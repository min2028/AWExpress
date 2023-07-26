import json
import sys
import os
import logging
import rds_config as rds_config
import pymysql as pymysql
#rds settings
rds_host  = "marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com"
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

logger = logging.getLogger()
logger.setLevel(logging.INFO)
try:
    conn = pymysql.connect(host=rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error("ERROR: Unexpected error: Could not connect to MySQL instance.")
    logger.error(e)
    sys.exit()

logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")
print("connect successful")
def lambda_handler(event, context):
    """
    This function returns the order history for a user with the given userId if it exists and return Error otherwise
    Path: GET /user/{userId}/orderHistory
    """
    # Parse out Query string params
    # userId = int(event["pathParameters"]["userId"])
    userId = int(event['pathParameters']['userId'])
    print(userId)
    resbody = {"orders": []}
    # Query Database
    query = "select * " \
            "from Orders where Orders.buyerId=%d;" % userId
    with conn.cursor() as cur:
        cur.execute(query)
        res = cur.fetchall()

        # Construct response
        if not len(res):
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'Unable to load order history.'})
            }
        for row in res:
            productList = []
            address = None
            try:
                address = json.loads(row[3])
            except:
                pass
            order = {
                'orderId': row[0],
                'buyerId': row[1],
                'shipAddress':address,
                'status': row[4]
            }
            # get products in order
            getProductSql = "SELECT productId,quantity from OrderList WHERE orderId=%d;" % row[0]
            cur.execute(getProductSql)
            res = cur.fetchall()
            for i in res:
                productId = i[0]
                getDetailSql = "SELECT productName, description, quantity,price,picture from Product WHERE productId=%d;" % productId
                cur.execute(getDetailSql)
                res = cur.fetchall()
                pro = res[0]
                product = {}
                product['productName'] = pro[0]
                product['description'] = pro[1]
                product['quantity'] = i[1]
                product['price'] = pro[3]
                product['picture'] = pro[4]
                getAvailableQty = "SELECT quantity from Post WHERE productId=%d;" % productId
                cur.execute(getAvailableQty)
                res = cur.fetchall()
                product['availableQuantity'] = res[0][0]
                productList.append(product)
            order['items'] = productList
            resbody['orders'].append(order)
    conn.commit()

    return {
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(resbody)
    }


# req = {'pathParameters': {"userId": 2007}}

# print(lambda_handler(req, ""))


