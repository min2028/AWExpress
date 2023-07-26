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

    sql = "select * from User where userId=%d;" % userId
    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        if len(res) == 0:
            resObj['statusCode'] = 400
            resObj['body'] = 'User does not exist'
            return resObj
        else:
            user = res[0]
            resbody['userEmail'] = user[3]
            resbody['userType'] = user[2]
            resbody['departmentRole'] = user[4]
            sql = "select * from UserProfile where userId=%d;" % userId
            cur.execute(sql)
            res = cur.fetchall()
            try:
                row = res[0]
            except:

                # If the userProfile tuple is not exist, create a tuple for the
                sql = "INSERT INTO UserProfile (userId) VALUES (%d);" % userId
                cur.execute(sql)
                sql = "select * from UserProfile where userId=%d;" % userId
                cur.execute(sql)
                res = cur.fetchall()
                row = (None,None,None,None,None,None,None,None,None)
            resbody['userId'] = userId
            resbody['firstname'] = row[1]
            resbody['lastname'] = row[2]

            if row[3] is not None:
                resAddress = row[3].strip('\"')
                resbody['address'] = json.loads(resAddress)
            else:
                resbody['address']=None

            resbody['payment'] = row[4]
            resbody['deposit'] = json.loads(row[5])
            resbody['department'] = row[6]
            resObj['statusCode'] = 200
    conn.commit()
    resObj = {}
    
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    
    return resObj

# req = {
#     'pathParameters':{'userId':2002},
#     'queryStringParameters':
#     {
#         'email':'john_2@amazon.com'
#     }
# }

# print(lambda_handler(req,""))