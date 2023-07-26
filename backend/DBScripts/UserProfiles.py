import json
import random

import pymysql
from faker import Faker
from faker.providers import address

# Establish a connection to the MySQL database
conn = pymysql.connect(
    host='marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com',
    user='dev-user1',
    password='dev-user1',
    db='aws'
)

fake = Faker('en_CA')
fake.add_provider(address)

department_enum = ["Accounting", "Marketing", "Software Development", "Law", "Human Resources", "Global Affairs"]

# Restriction satisfied with (Products.py, Posts.py, Orders.py)
userprodata = []
for i in range(65):
    # Orders.py: buyerId from 1985 -> 2014
    # 1985 -> 1999 buyers without Shopping Cart Items
    # 2000 -> 2010 buyers with Shopping Cart items
    # 2011 -> 2014 buyers who are also sellers with Shopping Cart Items
    # ShoppingCartItems.py: UserId from 2000 -> 2029
    # Posts.py: sellerId from 2010 -> 2039
    # 2015 -> 2029: sellers with Shopping Cart Items
    # 2029 -> 2039: sellers without Shopping Cart Items
    # 2040 -> 2049: admins
    userId = i + 1985
    firstName = fake.first_name()
    lastName = fake.last_name()
    address = {
        "street_address": fake.street_address(),
        "city": fake.city(),
        "province": fake.province(),
        "postal_code": fake.postalcode()
    }
    payment = {
        "credit_card_number": fake.credit_card_number(),
        "cvv": fake.credit_card_security_code(),
        "expiry_date": fake.credit_card_expire()
    }
    deposit = {
        "institution_number": random.randint(100, 999),
        "transit_number": random.randint(10000, 99999),
        "account_number": random.randint(1000000, 9999999)
    }
    department = department_enum[random.randint(0, 5)]
    verified = 1 if 1985 < userId < 2039 else 0
    userprodata.append((userId, firstName, lastName, json.dumps(address), json.dumps(payment), json.dumps(deposit),
                        department, verified))

# Define the insert query and parameters
query = "INSERT INTO UserProfile (userId, firstName, lastName, address, payment, deposit, department, verified) " \
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"

# Create a cursor object and execute the insert query using executemany()
with conn.cursor() as cursor:
    cursor.executemany(query, userprodata)

# Commit changes and close the connection
conn.commit()
conn.close()
