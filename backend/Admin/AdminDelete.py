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
                resObj['body'] = 'Admin cannot demote their own account'
                return resObj
            sql = "select * from User WHERE userType='admin' or userType='Adimn';"
            cur.execute(sql)
            res = cur.fetchall()
            if len(res)==1 and res[0][3]==email:
                resObj['statusCode'] = 400
                resObj['body'] = 'Cannot demote this admin, since this is the last admin in the system'
                return resObj

            sql = "select * from User where email='%s';" % email
            cur.execute(sql)
            res = cur.fetchall()
            if len(res)==0:  
                resObj['statusCode'] = 404
                resObj['body'] = 'User with email %s does not exist'%email
                return resObj
        
            user = res[0]
            userId = user[0]
            # check user Type
            if user[2]=='admin' or user[2]=='admin':
                resObj['statusCode'] = 400
                resObj['body'] = 'User with email %s is an admin, cannot be deleted. If want to delete admin please demote them to regular user first'%email
                return resObj
            sql = "DELETE FROM User WHERE userId=%d;"%(userId)
            cur.execute(sql)
            res = cur.fetchall()
            print(res)

            # inactive all user's product and related post
            sql = "UPDATE Post SET status=2 WHERE userId=%d;"%userId
            cur.execute(sql)
            res = cur.fetchall()
            print(res)
            
            sql2 = "UPDATE Product SET status=2 WHERE sellerId=%d;"%userId
            cur.execute(sql2)
            res = cur.fetchall()
            print(res)
            resbody['userId'] = userId
            email = {}
            email['subject'] = "AWExpress Account Termination"
            email['recipient']=email
            email['body']=f"Your account has been deleted from AWExpress by the Admin %s, please check with the admin for further detail.\
            Any active listings you had have been deleted. If you would like to use AWExpress again, you can login with your email again, but note that any listings you had previously are permanently deleted..\
            You will need to repost any products you still wish to sell."%adminEmail
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