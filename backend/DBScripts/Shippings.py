import json

import pymysql
from faker import Faker
import random
from Orders import fake_address

# Establish a connection to the MySQL database
conn = pymysql.connect(
    host='marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com',
    user='dev-user1',
    password='dev-user1',
    db='aws'
)

fake = Faker('en_CA')
shipStatus_enum = ["Processed", "Delayed", "Delivered", "Cancelled"]

# Restriction satisfied with (Orders.py)
shippingdata = []
for i in range(30):
    # shipId from 500 to 530
    shipId = i + 500
    # trackingId from 10000 to 10029
    trackingId = i + 10000
    shipStatus = shipStatus_enum.index(random.choice(shipStatus_enum))
    shipAddress = {
        "street_address": fake.street_address(),
        "city": fake.city(),
        "province": fake.province(),
        "postal_code": fake.postalcode()
    }
    shippedTime = fake.date()
    deliveryAddress = {
        "street_address": fake.street_address(),
        "city": fake.city(),
        "province": fake.province(),
        "postal_code": fake.postalcode()
    }
    shippingdata.append(
        (shipId, trackingId, shipStatus, json.dumps(shipAddress), shippedTime, json.dumps(deliveryAddress)))

query = "INSERT INTO Shipping " \
        "(shipId, trackingId, shipStatus, shipAddress, shippedTime, deliveryAddress) " \
        "VALUES (%s, %s, %s, %s, %s, %s)"

with conn.cursor() as cursor:
    cursor.executemany(query, shippingdata)

# Commit changes and close the connection
conn.commit()
conn.close()
