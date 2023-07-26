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


def patch_cart_item(event, context):
    """
    Update shopping cart item quantity. Returns the updated Shopping Cart Item
    Path: PATCH /user/{userId}/cart/{productId}
    """
    # Parse out Query string params
    userId = int(event["pathParameters"]["userId"])
    productId = int(event["pathParameters"]["productId"])
    body = json.loads(event["body"])
    # quantity in the cart
    quantity = int(body["quantity"])
    if not (userId and productId and quantity):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Bad request'})
        }
    
    resObj = {}

    # Check if the cart item quantity > post quantity and status is active = 1
    query = "SELECT Post.quantity, Post.status FROM Post, Product WHERE Post.productId = Product.productId AND Product.productId=%d;" % productId
    with conn.cursor() as cur:
        cur.execute(query)
        res = cur.fetchone()
        if not len(res):
            resObj = {
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
                'body': json.dumps({'message': 'The quantity that you tried to add exceeds the available quantity of this item. You may already have this item in your cart.'})
            }
        if not resObj == {}:
            conn.commit()
            return resObj
        # Check if the item already exist
        query = "SELECT NOT EXISTS(SELECT * FROM ShoppingCartItem WHERE userId=%s AND productId=%s);"
        params = (userId, productId)
        cur.execute(query, params)
        res = cur.fetchone()
        if res[0]:
            conn.commit()
            return {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'The item does not exist in cart'})
            }
        query = "UPDATE ShoppingCartItem SET quantity=%d WHERE userId=%d AND productId=%d" % (quantity, userId, productId)
        cur.execute(query)
        # params = (quantity, userId, productId)
        # cur.execute(query, params)

        query = "SELECT * FROM ShoppingCartItem WHERE userId=%s AND productId=%s" % (userId, productId)
        cur.execute(query)
        # params = (userId, productId)
        # cur.execute(query, params)
        res = cur.fetchone()
        resbody = {
            "productId": res[1],
            "quantity": res[2]
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
