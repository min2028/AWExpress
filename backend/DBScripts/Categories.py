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

categories = ['Electronics', 'Clothing', 'Home and Kitchen', 'Toys', 'Books', "Supplements", "Drugs", "Drinks", "Food", "Pet Food"]

# Restriction satisfied with (ShoppingCartItems.py)
catdata = []
for i in range(10):
    categoryId = i
    name = categories[i]
    catdata.append((categoryId, name))

query = "INSERT INTO Category " \
        "(categoryId, name) " \
        "VALUES (%s, %s)"

with conn.cursor() as cursor:
    cursor.executemany(query, catdata)

# Commit changes and close the connection
conn.commit()
conn.close()