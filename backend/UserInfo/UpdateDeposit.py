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
    print(f"event is {event}")
    userId = int(event['pathParameters']['userId'])
    resObj = {}
    resbody = {}
    try:
        body = json.loads(event['body'])
        deposit = body['deposit']
    except:
        resObj['statusCode']=400
        resbody = 'Invalid request body'
        resObj['body'] = json.dumps(resbody)
        return resObj
    

    resObj = {}
    resbody = {}

    sql = "select * from User where userId=%d;" % userId
    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        if len(res)==0:  
            resObj['statusCode'] = 400
            resObj['body'] = 'User does not exist'
            return resObj

        sql = "UPDATE UserProfile SET deposit='%s' WHERE userId=%d;"% (json.dumps(deposit),userId)
        cur.execute(sql)
        res = cur.fetchall()
        print(res)
            
        
        resObj['statusCode'] = 200
        resbody = {
            'deposit':deposit,
        }
    conn.commit()
    
    
    
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    
    return resObj

# req = {
#     'pathParameters':{'userId':2002},
#     'body-json':
#     {
#         'userType':'admin'
#     }
# }

# print(lambda_handler(req,""))