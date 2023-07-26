create table if not exists Category
(
    categoryId int         not null
        primary key,
    name       varchar(45) null
);

create table if not exists OrderList
(
    orderId   int not null,
    productId int not null comment 'If one order has more than 1 product, then use orderListId to identify each item in one order. If there is only one item in the order, then just put orderListId=1',
    quantity  int null,
    sellerId  int null,
    buyerId   int null,
    primary key (orderId, productId)
);

create table if not exists Orders
(
    orderId     int         not null
        primary key,
    buyerId     int         not null,
    contactInfo varchar(45) null,
    shipAddress json        null,
    status      int         null,
    shipId      int         null
);

create table if not exists Post
(
    postId    int not null
        primary key,
    userId    int not null,
    productId int null,
    quantity  int null,
    status    int null
);

create index productId_idx
    on Post (productId);

create index userId_idx
    on Post (userId);

create table if not exists Product
(
    productId   int             not null
        primary key,
    sellerId    int             not null,
    productName varchar(45)     not null,
    price       float default 0 not null,
    description longtext        null,
    picture     longtext        null,
    quantity    int             null,
    status      int             not null,
    categoryId  int             null
);

create table if not exists Shipping
(
    shipId          int         not null
        primary key,
    trackingId      int         null,
    shipStatus      varchar(45) null,
    shipAddress     json        null,
    shippedTime     varchar(45) null,
    deliveryAddress json        null
);

create table if not exists ShoppingCartItem
(
    userId    int not null,
    productId int not null,
    quantity  int null,
    primary key (userId, productId)
);

create table if not exists User
(
    userId         int               not null
        primary key,
    password       varchar(45)       null,
    userType       varchar(45)       null,
    email          varchar(45)       null,
    DepartmentRole tinyint default 0 not null
);

create table if not exists UserProfile
(
    userId     int         not null
        primary key,
    firstName  varchar(45) null,
    lastName   varchar(45) null,
    address    json        null,
    payment    json        null,
    deposit    json        null,
    department varchar(45) null,
    verified   tinyint     null
);


