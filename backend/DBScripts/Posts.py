import pymysql
from faker import Faker
from Products import random_quantity_status

# Establish a connection to the MySQL database
conn = pymysql.connect(
    host='marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com',
    user='dev-user1',
    password='dev-user1',
    db='aws'
)

fake = Faker()

# Restriction satisfied with (ShoppingCartItems.py, Products.py)
postdata = []
for i in range(30):
    # ProductId from 1000 to 1029
    postId = i + 1000
    # sellerId/userId from 2010 -> 2039
    # 2000 -> 2010: general users with Shopping Cart Items
    # 2011 -> 2040: sellers with Shopping Cart Items
    userId = i + 2011
    # ProductId from 1 to 30
    productId = i + 1
    # quantity in post is equal to quantity in Products
    # Products.py: quantity = random.randint(5, 40)
    quantity = random_quantity_status[i][0]
    # Same as quantity
    # Products.py: status = random.randint(0, 1)
    status = random_quantity_status[i][1]
    postdata.append(
        (postId, userId, productId, quantity, status))

query = "INSERT INTO Post " \
        "(postId, userId, productId, quantity, status) " \
        "VALUES (%s, %s, %s, %s, %s)"

with conn.cursor() as cursor:
    cursor.executemany(query, postdata)

# Commit changes and close the connection
conn.commit()
conn.close()
