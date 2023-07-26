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

fake = Faker('en_CA')

# Restriction satisfied with (ShoppingCartItems.py, Products.py, Posts.py, Orders.py)
orderlistdata = []
for i in range(30):
    # OrderId from 1000 to 1029
    orderId = i + 1000
    # ProductId from 1 to 30
    productId = i + 1
    # quantity from 1 to 5
    quantity = random.randint(1, 5)
    # Orders.py: buyerId from 1985 -> 2014
    # 1985 -> 1999 buyers without Shopping Cart Items
    # 2000 -> 2010 buyers with Shopping Cart items
    # 2011 -> 2014 buyers who are also sellers with Shopping Cart Items
    # ShoppingCartItems.py: UserId from 2000 -> 2029
    # Posts.py: sellerId from 2010 -> 2039
    # 2015 -> 2029: sellers with Shopping Cart Items
    # 2029 -> 2039: sellers without Shopping Cart Items
    sellerId = i + 2011
    buyerId = random.randint(1985, 2039)
    if buyerId == sellerId:
        buyerId = random.randint(1985, 2039)
    orderlistdata.append(
        (orderId, productId, quantity, sellerId, buyerId))

query = "INSERT INTO OrderList " \
        "(orderId, productId, quantity, sellerId, buyerId) " \
        "VALUES (%s, %s, %s, %s, %s)"

with conn.cursor() as cursor:
    cursor.executemany(query, orderlistdata)

# Commit changes and close the connection
conn.commit()
conn.close()
