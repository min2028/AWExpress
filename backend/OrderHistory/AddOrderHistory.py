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
    This function adds an order to the order history for a user with the given userId if it exists and return Error otherwise
    Path: POST /user/{userId}/orderHistory
    """
    resObj = {}
    resbody = {}

    sql = "select max(orderId) from Orders"
    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        maxOrder = res[0]
        maxId = maxOrder[0]
        
        body = event['body']
        orderId = maxId + 1
        buyerId = int(body['buyerId'])
        status = int(body['status'])

        sql = ("insert into Orders (orderId, buyerId, status)",
               "values (%d. %d, %d);" % (orderId, buyerId, status))

        cur.execute(sql)
        resbody['orderId'] = orderId 

    conn.commit()
    
    
    resObj['statusCode'] = 200
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    
    return resObj

# req = {
#     'pathParameters':{'userId':2002}
# }

# print(lambda_handler(req,""))
