import json

import pymysql
from faker import Faker
from faker.providers import address
import random

# Establish a connection to the MySQL database
conn = pymysql.connect(
    host='marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com',
    user='dev-user1',
    password='dev-user1',
    db='aws'
)

fake = Faker('en_CA')
fake.add_provider(address)

status_enum = ["Processed", "In-progress"]
fake_address = []

# Restriction satisfied with (ShoppingCartItems.py, Products.py, Posts.py, OrderLists.py)
orderdata = []
for i in range(30):
    # OrderId from 1000 to 1029
    orderId = i + 1000
    # Orders.py: buyerId from 1985 -> 2014
    # 1985 -> 1999 buyers without Shopping Cart Items
    # 2000 -> 2010 buyers with Shopping Cart items
    # 2011 -> 2014 buyers who are also sellers with Shopping Cart Items
    # ShoppingCartItems.py: UserId from 2000 -> 2029
    # Posts.py: sellerId from 2010 -> 2039
    # 2015 -> 2029: sellers with Shopping Cart Items
    # 2029 -> 2039: sellers without Shopping Cart Items
    buyerId = i + 1985
    contactInfo = fake.phone_number()
    shipAddress = {
        "streetAddress": fake.street_address(),
        "city": fake.city(),
        "province": fake.province(),
        "postalCode": fake.postalcode()
    }
    status = status_enum.index(random.choice(status_enum))
    # shipId from 500 to 530
    shipId = i + 500
    fake_address.append(shipAddress)
    orderdata.append(
        (orderId, buyerId, contactInfo, json.dumps(shipAddress), status, shipId))

query = "INSERT INTO Orders " \
        "(orderId, buyerId, contactInfo, shipAddress, status, shipId) " \
        "VALUES (%s, %s, %s, %s, %s, %s)"

with conn.cursor() as cursor:
    cursor.executemany(query, orderdata)

# Commit changes and close the connection
conn.commit()
conn.close()
