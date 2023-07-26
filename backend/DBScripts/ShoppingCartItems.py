import pymysql
import random

# Establish a connection to the MySQL database
conn = pymysql.connect(
    host='marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com',
    user='dev-user1',
    password='dev-user1',
    db='aws'
)
# ShoppingCartItem data to be inserted

# Restriction satisfied with (Products.py, Posts.py, Orders.py)
scidata = []
for i in range(30):
    # Orders.py: buyerId from 1985 -> 2014
    # 1985 -> 1999 buyers without Shopping Cart Items
    # 2000 -> 2010 buyers with Shopping Cart items
    # 2011 -> 2014 buyers who are also sellers with Shopping Cart Items
    # ShoppingCartItems.py: UserId from 2000 -> 2029
    # Posts.py: sellerId from 2010 -> 2039
    # 2015 -> 2029: sellers with Shopping Cart Items
    # 2029 -> 2039: sellers without Shopping Cart Items
    userId = i + 2000
    # ProductId from 1 to 30
    productId = i + 1
    # quantity from 1 to 5
    quantity = random.randint(1, 5)
    scidata.append((userId, productId, quantity))

# Define the insert query and parameters
query = "INSERT INTO ShoppingCartItem (userId,productId,quantity) VALUES (%s, %s, %s)"

# Create a cursor object and execute the insert query using executemany()
with conn.cursor() as cursor:
    cursor.executemany(query, scidata)

# Commit changes and close the connection
conn.commit()
conn.close()
