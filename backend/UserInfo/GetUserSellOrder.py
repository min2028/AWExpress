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
    This function check if the user exists in the system, if user doesn't exist will add the user to database
    """
    userId = int(event['pathParameters']['userId'])
    resObj = {}
    resbody = {}
    orders = []

    sql = "select * from User where userId=%d;" % userId
    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        if len(res)==0:  
            resObj['statusCode'] = 400
            resObj['body'] = 'User does not exist'
            return resObj
        else:
            sql1 = "SELECT Orders.orderId, OrderList.productId, OrderList.quantity, Orders.shipAddress \
                FROM Orders LEFT JOIN OrderList ON Orders.orderId=OrderList.orderId \
                    WHERE OrderList.sellerId=%d AND Orders.status=2;"%userId
            cur.execute(sql1)
            res = cur.fetchall()
            for i in res:
                print(i)
                productId = i[1]
                sql_get_product = "SELECT price, productName, picture FROM Product WHERE productId=%d;" % productId
                cur.execute(sql_get_product)
                productInfo = cur.fetchall()
                productInfo = productInfo[0]
                orderItem = {
                    "orderId":i[0],
                    "productId":i[1],
                    "quantity":i[2],
                    "shipAddress":json.loads(i[3]),
                    "productName":productInfo[1],
                    "productPrice":productInfo[0],
                    "productPicture":productInfo[2]
                }
                orders.append(orderItem)
            resbody['orderItems'] = orders
            resObj['statusCode'] = 200
    conn.commit()   
    resObj = {}
    
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    
    return resObj

# req = {
#     'pathParameters':{'userId':2039}
# }
#
# print(lambda_handler(req,""))