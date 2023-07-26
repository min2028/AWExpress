import json
import sys
import os
import logging
import rds_config as rds_config
import pymysql as pymysql
#rds settings
# order status code:
# 1 - Pending
# 2 - Valided Shipping Info
# 3 - Completed
# 4 - Cancelled
rds_host  = "marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com"

name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

logger = logging.getLogger()
logger.setLevel(logging.INFO)
provinceList = ['AB','BC','MB','NF', 'NT','NS', 'NU', 'ON','PE','QC','SK','YT']
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
    itemPrice = 0.0
    try:
        body = json.loads(event['body'])
        shipAdr = body['shippingAddress']
        contactInfo = body['contactInfo']
        city = shipAdr['city']
        province = shipAdr['province']
        postalCode = shipAdr['postal-code']
        orderId = int(event['pathParameters']['orderId'])
    except:
        # The request body is invalid
        resObj['statusCode']=400
        resbody = 'Invalid request body'
        resObj['body'] = json.dumps(resbody)
        return resObj
    if any(char.isdigit() for char in city):
        resObj['statusCode']=405
        resbody = 'Invalid request body, invalid city name'
        resObj['body'] = json.dumps(resbody)
        return resObj
    if province not in provinceList:
        resObj['statusCode']=405
        resbody = 'Invalid request body, invalid province'
        resObj['body'] = json.dumps(resbody)
        return resObj
    if len(postalCode) !=7 and len(postalCode) !=6:
        resObj['statusCode']=405
        resbody = 'Invalid request body, invalid postal code'
        resObj['body'] = json.dumps(resbody)
        return resObj
    if len(postalCode)==6:
        if not (postalCode[0].isalpha() and postalCode[2].isalpha() and postalCode[4].isalpha()):
            resObj['statusCode']=405
            resbody = 'Invalid request body, invalid postal code'
            resObj['body'] = json.dumps(resbody)
            return resObj
        if not (postalCode[1].isdigit() and postalCode[3].isdigit() and postalCode[5].isdigit()):
            resObj['statusCode']=400
            resbody = 'Invalid request body, invalid postal code'
            resObj['body'] = json.dumps(resbody)
            return resObj
    if len(postalCode)==7:
        if not (postalCode[0].isalpha() and postalCode[2].isalpha() and postalCode[5].isalpha() and postalCode[3==' ']):
            resObj['statusCode']=405
            resbody = 'Invalid request body, invalid postal code'
            resObj['body'] = json.dumps(resbody)
            return resObj
        if not (postalCode[1].isdigit() and postalCode[4].isdigit() and postalCode[6].isdigit()):
            resObj['statusCode']=405
            resbody = 'Invalid request body, invalid postal code'
            resObj['body'] = json.dumps(resbody)
            return resObj
    if len(contactInfo['phoneNumber'])!=9 and len(contactInfo['phoneNumber'])!=10:
        resObj['statusCode']=405
        resbody = 'Invalid request body, invalid phone number'
        resObj['body'] = json.dumps(resbody)
        return resObj
    for c in contactInfo['phoneNumber']:
        if not c.isdigit():
            resObj['statusCode']=405
            resbody = 'Invalid request body, invalid phone number'
            resObj['body'] = json.dumps(resbody)
            return resObj
    with conn.cursor() as cur:
        sql = "UPDATE Orders SET status=2 WHERE orderId=%d;" % orderId
        cur.execute(sql)
        res = cur.fetchall()
        print(res)
        sql2 = "SELECT productId FROM OrderList WHERE orderId=%d" % orderId
        cur.execute(sql2)
        res = cur.fetchall()
        print(res)
        for i in res:
            productId = int(i[0])
            sql2 = "SELECT price FROM Product WHERE productId=%d" % productId
            cur.execute(sql2)
            res = cur.fetchall()
            price  = float(res[0][0])
            itemPrice=itemPrice + price
        resbody['orderId']=orderId
        resbody['orderStatus']=2
        resbody['itemPrice'] = format(itemPrice,'.2f')
        resbody['tax']=0
        resbody['shippingFee']=0
    conn.commit()

    resObj['statusCode'] = 200
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    print(resObj)
    return resObj

# req = {
#     'body': '{"shippingAddress":{"street":"36 A st","city":"vancouver","province":"BC","postal-code":"V1V6k9"},"contactInfo":{"firstname":"john","lastname":"kii","phoneNumber":"1234567899"}}',
#     'pathParameters':{"orderId":1}
# }

# print(lambda_handler(req,""))