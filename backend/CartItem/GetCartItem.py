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


def get_cart_item(event, context):
    """
    This function return cart item for a user with the given userId if it exists and return Error otherwise
    Path: GET /user/{userId}/cart
    """
    # Parse out Query string params
    userId = int(event["pathParameters"]["userId"])
    resObj = {}
    resbody = {"items": []}
    # Query Database
    query = "select ShoppingCartItem.productId, productName, description, price, ShoppingCartItem.quantity, picture  " \
            "from ShoppingCartItem, Product where Product.productId = ShoppingCartItem.productId AND userId=%d;" % userId
    with conn.cursor() as cur:
        cur.execute(query)
        res = cur.fetchall()
        
        # Construct response
        for row in res:
                item = {
                    'productId': row[0],
                    'productName': row[1],
                    'description': row[2],
                    'price': row[3],
                    'quantity': row[4],
                    'picture': row[5]
                }
                quantity_query = "SELECT quantity from Post WHERE productId = %d;" %int(row[0])
                cur.execute(quantity_query)
                res2 = cur.fetchall()
                item['availableQuantity'] = int(res2[0][0])
                resbody['items'].append(item)
            
        resObj = {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(resbody)
        }
    conn.commit()

    return resObj
