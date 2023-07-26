import json
import sys
import os
import logging
import rds_config as rds_config
import pymysql as pymysql

# rds settings
rds_host = "marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com"
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
        body = json.loads(event['body'])
        userEmail = body['email']
    except:
        resObj['statusCode'] = 400
        resObj['body'] = 'Invalid request body'
        return resObj

    sql = "select * from User where email='%s';" % userEmail
    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        if len(res)==0:  
            resObj['statusCode'] = 400
            resObj['body'] = 'User does not exist'
            return resObj
        else:
            user = res[0]
            resbody['userId']=user[0]
            resbody['email'] =  user[3]
            resbody['userType'] = user[2]
            resObj['statusCode'] = 200

    resObj = {}
    
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    conn.commit()
    return resObj

# req = {
#     'body': '{"email":"john_2@amazon.com"}'
# }

# print(lambda_handler(req,""))