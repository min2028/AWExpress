import json
import sys
import os
import logging
import rds_config as rds_config
import pymysql as pymysql
import SendEmail
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
    adminUserId = int(event['pathParameters']['userId'])
    resObj = {}
    resbody = {}
    try:
        body = json.loads(event['body'])
        email = body['email']
    except:
        resObj['statusCode']=400
        resbody = 'Invalid request body'
        resObj['body'] = json.dumps(resbody)
        return resObj

    sql = "select * from User where userId=%d;" % adminUserId
    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        if len(res)==0:  
            resObj['statusCode'] = 404
            resObj['body'] = 'Admin does not exist'
            return resObj
        else:
            admin = res[0]
            if admin[2]!='admin' and admin[2]!='Admin':
                resObj['statusCode'] = 403
                resObj['body'] = 'Invalid admin userId'
                return resObj
            adminEmail = admin[3]
            # check the number of admin in system, if this is last admin can't be promoted. Admin can't demote themselves
            if adminEmail==email:
                resObj['statusCode'] = 404
                resObj['body'] = 'Admins cannot demote their own account.'
                return resObj
        
            sql = "select * from User WHERE userType='admin' or userType='Admin';"
            cur.execute(sql)
            res = cur.fetchall()
            if len(res)==1 and res[0][3]==email:
                resObj['statusCode'] = 400
                resObj['body'] = 'Cannot demote this admin, since this is the last admin in the system.'
                return resObj
            

            sql = "select * from User where email='%s';" % email
            cur.execute(sql)
            res = cur.fetchall()
            if len(res)==0:  
                resObj['statusCode'] = 404
                resObj['body'] = 'User with email %s does not exist.'%email
                return resObj
            
            user = res[0]
            userId = user[0]
            # check user Type
            if user[2]=='user' or user[2]=='User':
                resObj['statusCode'] = 400
                resObj['body'] = 'User with email %s is not admin, cannot be demoted.'%email
                return resObj
            sql = "UPDATE User SET userType='user' WHERE userId=%d;"%(userId)
            cur.execute(sql)
            res = cur.fetchall()
            print(res)
            resbody['userId'] = userId
            email = {}
            email['subject'] = "AWExpress - Account Demotion"
            email['recipient']=email
            email['body']="Your AWExpress account has been demoted to a user account by the Admin %s"%adminEmail
            # SendEmail.sendEmail(email=email)
            resObj['statusCode'] = 200
    conn.commit()
    
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    
    return resObj

# req = {
#     'pathParameters':{'userId':2001},
#     'body': '{"email":"john_2@amazon.com"}'
# }

# print(lambda_handler(req,""))