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
        body = json.loads(event['body'])
        items = body['items']
        print(items)
        userId = int(event['pathParameters']['userId'])
    except:
        # The request body is invalid
        resObj['statusCode']=400
        resbody = 'Invalid request body'
        resObj['body'] = json.dumps(resbody)
        return resObj
    if len(items)==0:
        resObj['statusCode']=400
        resbody='Invalid request body, no item passed in'
        resObj['body'] = json.dumps(resbody)
        return resObj
    # create an order in db
    orderId = 0
    buyerId = userId
    status = 1
    with conn.cursor() as cur:
        sql = "select orderId from Orders;"
        cur.execute(sql)
        idRes = cur.fetchall()
        print(idRes)
        if len(idRes)==0:
            orderId = 1
        else:
            maxId = 0
            for i in idRes:
                if int(i[0])>maxId:
                    maxId = int(i[0])
            maxId+=1
            orderId=maxId
        sql = "INSERT INTO Orders(orderId,buyerId,status) VALUES (%d,%d,%d);" % (orderId,buyerId,status)
        print(sql)
        cur.execute(sql)
        print(cur.rowcount)
        for i in items:
            productId = int(i['productId'])
            quantity = int(i['quantity'])
            sql3 = "SELECT quantity FROM Post WHERE productId=%d;"%productId
            cur.execute(sql3)
            res = cur.fetchall()
            print(res)
            newQuantity = res[0][0] - quantity
            if newQuantity<0:
                resObj['statusCode']=405
                resbody = {
                    "error message": "invalid quantity",
                    "productId": productId
                }
                resObj['body'] = json.dumps(resbody)
                return resObj
            sql1 = "SELECT sellerId FROM Product WHERE productId=%d;" % productId
            cur.execute(sql1)
            res = cur.fetchall()
            print(res)
            sellerId = int(res[0][0])
            sql2 = "INSERT INTO OrderList(orderId,productId,quantity,sellerId,buyerId) VALUES (%d,%d,%d,%d,%d);" % \
                (int(orderId), int(productId), int(quantity), int(sellerId),int(buyerId))
            print(sql2)
            cur.execute(sql2)
            res = cur.fetchall()
            print(res)
            # reduce the quantity in post
            if newQuantity ==0:
                sql3 = "UPDATE Post SET quantity=0, status=2 WHERE productId=%d;" % productId
                cur.execute(sql3)
                res=cur.fetchall()
                sql3 = "UPDATE Product SET status=2 WHERE productId=%d;" % productId
                cur.execute(sql3)
                res=cur.fetchall()
                print(res)
            else:
                sql3 = "UPDATE Post SET quantity=%d WHERE productId=%d;" %(newQuantity,productId)
                cur.execute(sql3)
                res=cur.fetchall()
                print(res)
            resbody['orderId']=orderId
            resbody['orderStatus']=status
    conn.commit()

    resObj['statusCode'] = 200
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    print(resObj)
    return resObj

# req = {
#     'body': '{"items":[{"productId":"1","quantity":5}]}',
#     'pathParameters':{"userId":1001}
# }

# print(lambda_handler(req,""))