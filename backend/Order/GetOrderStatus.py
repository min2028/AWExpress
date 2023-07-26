import json
import sys
import os
import logging
import rds_config as rds_config
import pymysql as pymysql
#rds settings
# order status code:
# 1 - Pending
# 2 - Paid
# 3 - Completed(delivered)
# 4 - Cancelled
# Post status code:
# 1 - active
# 2 - inactive
# 3 - deleted by owner
# 4 - deleted by admin
# Product status code:
# 1 - active
# 2 - inactive
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
    print(f"event is {event}")
    """
    This function check if the user exists in the system, if user doesn't exist will add the user to database
    """
    resObj = {}
    resbody = {}
    
    try:
        orderId = int(event['orderId'])
    except:
        # The request body is invalid
        resObj['statusCode']=400
        resbody = 'Invalid request body'
        resObj['body'] = json.dumps(resbody)
        return resObj

    with conn.cursor() as cur:
        sql = "select status from Orders WHERE orderId=%d;"%orderId
        cur.execute(sql)
        res = cur.fetchall()
        status = res[0][0]
        if status ==2:
            resObj['status']=2
        elif status==4:
            resObj['status']=4
    conn.commit()
    resbody = {
        "orderId":orderId
    }
    resObj['body'] = json.dumps(resbody)
    resObj['statusCode']=200
    
    return resObj

req = {
    'pathParameters':{"orderId":1028}
}

print(lambda_handler(req,""))