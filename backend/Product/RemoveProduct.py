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
    try:
        body = json.loads(event['body'])
        productId = body['productId']
    except:
        resObj['statusCode']=400
        resbody = 'Invalid request body'
        resObj['body'] = json.dumps(resbody)
        return resObj

    sql = "select * from User where userId=%d;" % userId
    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        if len(res)==0:  
            resObj['statusCode'] = 404
            resObj['body'] = 'User does not exist'
            return resObj
        else:
            # check the number of admin in system, if this is last admin can't be promoted. Admin can't demote themselves
            sql = "select status, sellerId from Product WHERE productId=%d;"%(productId)
            cur.execute(sql)
            res = cur.fetchall()
            if len(res)==0:
                resObj['statusCode'] = 404
                resObj['body'] = 'Product not exists'
                return resObj
            product = res[0]
            if product[1]!=userId:
                resObj['statusCode'] = 403
                resObj['body'] = 'You can only deleted the product posted by yourself, you are deleting another user\'s post'
                return resObj
            sql = "select status from Post WHERE productId=%d;"%(productId)
            cur.execute(sql)
            res = cur.fetchall()
            product = res[0]
            if product[0] !=1:
                resObj['statusCode'] = 400
                resObj['body'] = 'Product is already inactive, cannot be deleted'
                return resObj

            # inactive all user's product and related post
            sql = "UPDATE Post SET status=3 WHERE productId=%d;"%productId
            cur.execute(sql)
            res = cur.fetchall()
            print(res)
            
            sql2 = "UPDATE Product SET status=2 WHERE productId=%d;"%productId
            cur.execute(sql2)
            res = cur.fetchall()
            print(res)
            resbody['productId'] = productId
            
            resObj['statusCode'] = 200
    conn.commit()
    
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    
    return resObj

# req = {
#     'pathParameters':{'userId':2001},
#     'body': '{"productId":34}'
# }

# print(lambda_handler(req,""))