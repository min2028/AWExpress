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
    body = json.loads(event['body'])
     
    userEmail = body['email']
    print(userEmail)
    userEmailOriginal = body['email']
    userEmail = f"'{userEmail}'"
    sql = "select userId from User where email=%s;" % userEmail
    userId = 0
    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        print(res)
        if len(res)==0:
            getUserSql = "SELECT userId FROM User;"
            cur.execute(getUserSql)
            idRes = cur.fetchall()
            maxId = 0
            for i in idRes:
                if int(i[0])>maxId:
                    maxId = int(i[0])
            maxId+=1
            insertSql = "INSERT INTO User (userId,password,userType,email) VALUES (%d,%s,%s,%s);" % (maxId,"''","'user'",userEmail)
            print(insertSql)
            cur.execute(insertSql)
            insertSql = "INSERT INTO UserProfile (userId) VALUES (%d);" % (maxId)
            print(insertSql)
            cur.execute(insertSql)
            
            userId = maxId
        else:
            userId = int(res[0][0])
        userTypeSql = "SELECT userType FROM User WHERE userId=%d;"%userId
        cur.execute(userTypeSql)
        res = cur.fetchall()
        userType = res[0][0]
    conn.commit()
    resbody = {
            'userId':userId,
            'email':userEmailOriginal,
            'userType':userType
    }
    resObj = {}
    resObj['statusCode'] = 200
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    print(resObj)
    return resObj

# req = {
#     'body': '{"email":"john_2@amazon.com"}'
# }

# print(lambda_handler(req,""))