import json
import sys
import os
import logging
import rds_config as rds_config
import pymysql as pymysql
import SendEmail

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
    """
    This function check if the user exists in the system, if user doesn't exist will add the user to database
    """
    adminUserId = int(event['pathParameters']['userId'])
    resObj = {}
    resbody = {}
    userEmail = None
    try:
        body = json.loads(event['body'])
        orderId = body['orderId']
    except Exception as e:
        print(e)
        resObj['statusCode'] = 400
        resbody = 'Invalid request body'
        resObj['body'] = json.dumps(resbody)
        return resObj

    sql = "select * from User where userId=%d;" % adminUserId
    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        if len(res) == 0:
            resObj['statusCode'] = 404
            resObj['body'] = 'Admin does not exist'
            return resObj
        else:
            admin = res[0]
            print(admin)
            if admin[2] != 'admin' and admin[2] != 'Admin':
                resObj['statusCode'] = 403
                resObj['body'] = 'Invalid admin userId'
                return resObj
            adminEmail = admin[3]
            # check order status
            sql = "select status from Orders WHERE orderId=%d;" % orderId
            cur.execute(sql)
            res = cur.fetchall()
            if len(res) == 0:
                resObj['statusCode'] = 404
                resObj['body'] = 'Order not exists'
                return resObj
            elif res[0][0] != 2:
                #     if order is not paid
                resObj['statusCode'] = 400
                resObj['body'] = 'This order cannot be cancelled because it is not in paid status'
                return resObj
            else:
                cancel_order_sql = "UPDATE Orders SET status=4 WHERE orderId=%d;" % orderId
                cur.execute(cancel_order_sql)
                res = cur.fetchall()
            # update all post quantity from orders
            get_order_item_sql = "SELECT * FROM OrderList WHERE orderId=%d;" % orderId
            cur.execute(get_order_item_sql)
            res = cur.fetchall()
            productIdList = []
            for item in res:
                quantity = int(item[2])
                productId = int(item[1])
                userId = int(item[4])

                productIdList.append(productId)
                # check item quantity
                get_post_qty_sql = "SELECT quantity,status FROM Post WHERE productId=%d;" % productId
                cur.execute(get_post_qty_sql)
                res = cur.fetchall()
                postQuantity = res[0][0]
                if res[0][1] == 2:  # sold out inactive status
                    newStatus = 1
                    newQuantity = quantity
                    update_sql = "UPDATE Post SET quantity=%d, status=%d WHERE productId=%d;" % (
                        newQuantity, newStatus, productId)
                    cur.execute(update_sql)
                    res = cur.fetchall()
                elif res[0][1] == 3 or res[0][1] == 4: # post is deleted but will add the quantity back
                    newQuantity = quantity + postQuantity
                    update_sql = "UPDATE Post SET quantity=%d WHERE productId=%d;" % (
                        newQuantity, productId)
                    cur.execute(update_sql)
                    res = cur.fetchall()
                elif res[0][1] == 1:  # add the quantity back to active post
                    newQuantity = quantity + postQuantity
                    update_sql = "UPDATE Post SET quantity=%d WHERE productId=%d;" % (
                        newQuantity, productId)
                    cur.execute(update_sql)
                    res = cur.fetchall()
            userEmail = getUserEmail(orderId)
            productListName = getProductName(productIdList)
            # send email to buyer that the order is cancelled and refund
            bodyString = f"Your order %d has been cancelled from AWExpress by the Admin %s, \
                        your item in the cancelled order was %s, please check with the admin for further details." % (
                orderId, adminEmail, productListName)
            email = {
                'subject': "Your order has been cancelled by an Admin from AWExpress",
                'recipient': userEmail,
                'body': bodyString
            }
            SendEmail.sendEmail(email)
            resbody['orderId'] = orderId
            resObj['statusCode'] = 200
    conn.commit()

    resObj['headers'] = {}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)

    return resObj


def getProductName(productIdList):
    listOfName = ''
    firstItem = True
    with conn.cursor() as cur:
        for id in productIdList:
            try:
                getProductSql = "SELECT productName FROM Product where productId=%d;" % id
                cur.execute(getProductSql)
                res = cur.fetchall()
                name = res[0][0]
                if firstItem:
                    listOfName = name
                else:
                    listOfName = listOfName + ', ' + name
            except Exception as e:
                print(e)
                return "Invalid query to Product"
    conn.commit()
    return listOfName


def getUserEmail(orderId):
    with conn.cursor() as cur:
        try:
            getEmailsql = "SELECT User.email FROM User LEFT JOIN Orders ON User.userId=Orders.buyerId where Orders.orderId=%d;" % orderId
            cur.execute(getEmailsql)
            res = cur.fetchall()
            email = res[0][0]
            print(email)
            USER_EMAIL = email
            print(USER_EMAIL)
            return email
        except Exception as e:
            print(e)
            return 'Invalid query to User'
    conn.commit()
# req = {
#     'pathParameters':{'userId':2055},
#     'body': '{"orderId":1028}'
# }
#
# print(lambda_handler(req,""))
