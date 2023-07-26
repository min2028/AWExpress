import pymysql
import random
from faker import Faker

# Establish a connection to the MySQL database
conn = pymysql.connect(
    host='marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com',
    user='dev-user1',
    password='dev-user1',
    db='aws'
)

fake = Faker()

userType_enum = ["User", "Seller", "Admin"]
# Restriction satisfied with (Products.py, Posts.py, Orders.py, UserProfiles.py)
userdata = []
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
    password = fake.password(length=10)
    userType = userType_enum[0]
    if 2010 < userId < 2040:
        userType = userType_enum[1]
    if 2039 < userId < 2050:
        userType = userType_enum[2]
    email = fake.free_email()
    userdata.append((userId, password, userType, email))

# Define the insert query and parameters
query = "INSERT INTO User (userId, password, userType, email) VALUES (%s, %s, %s, %s)"

# Create a cursor object and execute the insert query using executemany()
with conn.cursor() as cursor:
    cursor.executemany(query, userdata)

# Commit changes and close the connection
conn.commit()
conn.close()
