import sys
import logging
import pymysql
import json
import rds_config

# rds settings
rds_host = "marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com"
user_name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# create the database connection outside of the handler to allow connections to be
# re-used by subsequent function invocations.
try:
    conn = pymysql.connect(host=rds_host, user=user_name, passwd=password, db=db_name, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error("ERROR: Unexpected error: Could not connect to MySQL instance.")
    logger.error(e)
    sys.exit()

logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")
print("connect successful")


def post_cart_item(event, context):
    """
    Add shopping cart item. Returns the new Shopping Cart Item
    Path: POST /user/{userId}/cart
    """
    # Parse out Query string params
    userId = int(event["pathParameters"]["userId"])
    body = json.loads(event["body"])
    # productId and quantity in the cart
    productId = int(body["productId"])
    quantity = int(body["quantity"])
    if not (userId and productId and quantity):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Bad request'})
        }
    
    resObj = {}

    # Check if the cart item quantity > post quantity and status is active = 1
    query = "SELECT Post.quantity, Post.status, Product.sellerId FROM Post, Product WHERE Post.productId = Product.productId AND Product.productId=%d;" % productId
    with conn.cursor() as cur:
        cur.execute(query)
        res = cur.fetchone()
        if not len(res):
            resObj =  {
                'statusCode': 410,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'Product does not exist'})
            }
        # Construct response
        elif not res[1]:
            resObj = {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'Item is inactive'})
            }
        elif quantity > res[0]:
            resObj = {
                'statusCode': 410,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'Invalid quantity'})
            }
        elif userId == res[2]:
            resObj = {
                'statusCode': 410,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'You cannot buy products that are listed by the same account. Users on other accounts will not encounter this error.'})
            }
        if not resObj == {}:
            conn.commit()
            return resObj
        # Check if the item already exist
        query = "SELECT * FROM ShoppingCartItem WHERE userId=%d AND productId=%d;" % (userId, productId)
        cur.execute(query)
        # params = (userId, productId)
        # cur.execute(query, params)
        res = cur.fetchone()
        if not res is None:
            conn.commit()
            resbody = {
                'productId': res[1],
                'quantity': res[2],
                'message': 'item is already in the cart'
            }
            resObj = {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps(resbody)
            }
            return resObj
        # Insert product in the shopping cart
        query = "INSERT INTO ShoppingCartItem(userId, productId, quantity) VALUES (%d, %d, %d);" % (userId, productId, quantity)
        cur.execute(query)
        # params = (userId, productId, quantity)
        # cur.execute(query, params)

        query = "SELECT ShoppingCartItem.productId, Product.productName, Product.price, ShoppingCartItem.quantity " \
                "FROM ShoppingCartItem " \
                "JOIN Product ON Product.productId = ShoppingCartItem.productId " \
                "WHERE ShoppingCartItem.userId = %d AND ShoppingCartItem.productId = %d;" % (userId, productId)
        cur.execute(query)
        # params = (userId, productId)
        # cur.execute(query, params)
        res = cur.fetchone()
        resbody = {
            "productId": res[0],
            "productName": res[1],
            "price": res[2],
            "quantity": res[3]
        }
    conn.commit()

    resObj = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(resbody)
    }
    return resObj
