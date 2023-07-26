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
    address=None
    userType=None
    department=None
    lastname=None
    firstname=None
    resObj = {}
    resbody = {}
    try:
        body = json.loads(event['body'])
    except:
        resObj['statusCode']=400
        resbody = 'Invalid request body'
        resObj['body'] = json.dumps(resbody)
        return resObj
    if 'address' in body:
        address = body['address']
        print("request address"+str(address))
    # if 'userType' in body:
    #     userType = body['userType']
    #     print("request userType"+str(userType))
    if 'department' in body:
        department = body['department']
        print("request department"+str(department))
    if 'firstname' in body:
        firstname = body['firstname']
        print("request firstname"+str(firstname))
    if 'lastname' in body:
        lastname = body['lastname']
        print("request lastname"+str(lastname))

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
        elif userType is not None and userType != '':
            # sql = "select userType from User where userId=%d;"%userId
            # cur.execute(sql)
            user = res[0]
            if (user[2] == 'user' or user[2]=='User') and (userType=='admin' or userType=='Admin'):
                resObj['statusCode'] = 403
                resObj['body'] = 'User has not permission to edit user type'
                return resObj
            else:
                sql = "UPDATE User SET userType='%s' WHERE userId=%d;"%(userId)
                cur.execute(sql)
                resbody['userType'] = userType
                resObj['statusCode'] = 200

        else:   
            if firstname is not None and firstname != '':
                sql = "UPDATE UserProfile SET firstname='%s' WHERE userId=%d;"%(firstname,userId)
                cur.execute(sql)
                res = cur.fetchall()
                print(res)
                
            if lastname is not None and lastname != '':
                sql = "UPDATE UserProfile SET lastname='%s' WHERE userId=%d;"%(lastname,userId)
                cur.execute(sql)
                res = cur.fetchall()
                print(res)
            if department is not None and department != '':
                sql = "UPDATE UserProfile SET department='%s' WHERE userId=%d;"%(department, userId)
                cur.execute(sql)
                res = cur.fetchall()
                print(res)
            if address is not None and address != '':
                sql = "UPDATE UserProfile SET address='%s' WHERE userId=%d;"%(json.dumps(address),userId)
                cur.execute(sql) 
                res = cur.fetchall()
                print(res)
            resObj['statusCode'] = 200
            resbody = {
                'userId':userId,
                'firstname':firstname,
                'lastname':lastname,
                'department':department,
                'address':json.loads(address)
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