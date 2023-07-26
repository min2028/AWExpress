import sys
import logging
import pymysql
import json
import rds_config
import boto3

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


def delete_cart_item(event, context):
    """
    This function delete a cart item given userId and productId if it exists
    Path: DELETE /user/{userId}/cart/{productId}
    """
    # Parse out Query string params
    # client = boto3.client('lambda')
    userId = int(event["pathParameters"]["userId"])
    productId = int(event["pathParameters"]["productId"])
    resObj = {}
    # Query Database
    query = "DELETE FROM ShoppingCartItem WHERE userId=%d AND productId=%d" % (userId, productId)
    params = (userId, productId)
    with conn.cursor() as cur:
        cur.execute(query)
        rows_deleted = cur.rowcount
        if not rows_deleted:
            resObj =  {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'Cart item is not found'})
            }
        else: 
            resObj =  {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'message': 'Cart item deleted successfully'})
            }
        # input_payload = {
        #     "pathParameters": {
        #         "userId": userId
        #     }
        # }
        # response = client.invoke(FunctionName='get_cart_item', InvocationType='RequestResponse', Payload=json.dumps(input_payload))
        # response_payload = json.loads(response['body'])
        # items = response_payload["items"]
        # for item in items:
        #     resbody['items'].append(item)
    conn.commit()

    return resObj
