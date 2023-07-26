import pymysql
from faker import Faker
import random

# Establish a connection to the MySQL database
conn = pymysql.connect(
    host='marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com',
    user='dev-user1',
    password='dev-user1',
    db='aws'
)

fake = Faker()

# Can add sellers with multiple products
categories = ['Electronics', 'Clothing', 'Home and Kitchen', 'Toys', 'Books']
random_quantity_status = []
# Restriction satisfied with (ShoppingCartItems.p, Categories.py, Posts.py, Orders.py)
productdata = []
for i in range(30):
    # ProductId from 1 to 30
    productId = i + 1
    # Orders.py: buyerId from 1985 -> 2014
    # 1985 -> 1999 buyers without Shopping Cart Items
    # 2000 -> 2010 buyers with Shopping Cart items
    # 2011 -> 2014 buyers who are also sellers with Shopping Cart Items
    # ShoppingCartItems.py: UserId from 2000 -> 2029
    # Posts.py: sellerId from 2010 -> 2039
    # 2015 -> 2029: sellers with Shopping Cart Items
    # 2029 -> 2039: sellers without Shopping Cart Items
    sellerId = i + 2011
    productName = fake.catch_phrase()
    price = random.randint(10, 1000)
    description = fake.text(max_nb_chars=200)
    picture = fake.image_url()
    quantity = random.randint(5, 40)
    status = random.randint(0, 1)
    categoryId = categories.index(random.choice(categories))
    random_quantity_status.append((quantity, status))
    productdata.append(
        (productId, sellerId, productName, price, description, picture, quantity, status, categoryId))

query = "INSERT INTO Product " \
        "(productId, sellerId, productName, price, description, picture, quantity, status, categoryId) " \
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"

with conn.cursor() as cursor:
    cursor.executemany(query, productdata)

# Commit changes and close the connection
conn.commit()
conn.close()