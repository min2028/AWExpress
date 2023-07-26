import json
import sys
import logging
from rds_config import get_db_connection
import pymysql
import time
import SendEmail
import POSTShippingStatus
from enum import Enum

# simulated response time
# SIMULATED_TIME = 5

logger = logging.getLogger()
logger.setLevel(logging.INFO)

conn = get_db_connection(logger)


# class ShippingStatusCode(Enum):
#     SHIPPING_PENDING = 0
#     ON_THE_WAY = 1
#     DELIVERED = 2,
#     DELAYED = 3


ShippingStatusString = {
    0: "Shipping Pending",
    1: "On the way",
    2: "Delivered",
    3: "Delayed"
}
ORDER_ID = 0
BUYER_ID = 0
USER_EMAIL = ""

def lambda_handler(event, context):
    # order is complete -> create shipping id and shipping instance
    # check the items in the order (create an object, sellerId is key, value a list of productId)
    # wait 10s 
    # ship out the product(send email notification and update shipping status in db)
    # wait 5 mins
    # delivered product (send email and update shipping status in db)
    # 1 order - 1 ship instance (ship) -> multiple shippingItems (2 shippingItemId, -shipId)
    # shippingID=1, shippingItemId=1 & shippingId=1, shipipngItemId=2 & shippingId=1
    request_body = {}
    seller_map = {}
    try:
        orderId = json.loads(event['body'])['orderId']
        ORDER_ID=orderId
        # print(shipID_from_orderID)
    except:
        request_body['statusCode'] = 400
        request_body = 'Invalid request body'
        return {'body': json.dumps(request_body)}
    # create a shipId for order
    
    
    with conn.cursor() as cur:
        try:
            # check shipId in Order table
            checkShipSql = "SELECT shipId FROM Orders WHERE orderId=%d;"%(orderId)
            cur.execute(checkShipSql)
            res = cur.fetchall()[0][0]
            if res!=None and res!=0:
                resObj = {}
                resObj['statusCode']=400
                resbody = 'This order has an exist shipping instance'
                resObj['body'] = json.dumps(resbody)
                return resObj
            # assgin a shipId
            sql_get_ship_id = "SELECT MAX(shipId) From Shipping;"
            cur.execute(sql_get_ship_id)
            maxShippingId = cur.fetchall()[0][0]
            shipId = maxShippingId+1
            # update shipId for Order
            sql_update_ship_id = "UPDATE Orders SET shipId=%d WHERE orderId=%d;"%(shipId,orderId)
            cur.execute(sql_update_ship_id)
            res = cur.fetchall()
            
            # insert shipping tuple into shipping table
            insert_ship_sql = "INSERT INTO Shipping (shipId, shipStatus) VALUES (%d, 0);"%shipId
            cur.execute(insert_ship_sql)
            res = cur.fetchall()
            
            sql1 = "SELECT OrderList.productId, OrderList.sellerId, Orders.buyerId, Orders.shipAddress FROM Orders LEFT JOIN OrderList ON Orders.orderId=OrderList.orderId WHERE Orders.orderId=%d;"%orderId
            cur.execute(sql1)
            items = cur.fetchall()
            shipAddress = items[0][3]
            # update shipping address in shipping tuples
            update_address_sql = "UPDATE Shipping SET shipAddress='%s' WHERE shipId=%d;"%(shipAddress,shipId)
            print(update_address_sql)
            cur.execute(update_address_sql)
            for i in items:
                seller = i[1]
                productId = i[0]
                if seller in seller_map:
                    seller_map[seller].append(productId)
                else:
                    seller_map[seller] = [productId]
            BUYER_ID = items[0][2]
            getUserEmail()
            time.sleep(10)
            shipout(seller_map)
            # time.sleep(300)
            # For Testing 
            time.sleep(10)
            delivered(seller_map)
        except Exception as e: 
            print(e)
            request_body['statusCode'] = 400
            request_body = 'Invalid query to Orders'
            return {'body': json.dumps(request_body)}
    conn.commit()
    request_body['shipId'] = shipId
    request_body['shipStatus'] = 2
    request_body['statusString'] = ShippingStatusString[2]

    return {'body': json.dumps(request_body)}


# test_event = {'body': '{"orderId": 1000}'}
# print(lambda_handler(test_event, context=0))

def shipout(seller_map):
    for seller in seller_map:
        listOfProductName = getProductName(seller_map[seller])
        bodyString = 'Your order number %d, product %s is on the way.'% (ORDER_ID,listOfProductName)
        print(bodyString)
        shipout_email = {
            'subject':'Your Order is On the Way',
            'body':bodyString,
            'recipient':USER_EMAIL
        }
        # TODO: test SendEmail function
        # SendEmail.EmailMessage(shipout_email)
    event_body = {"orderId": ORDER_ID, "shipStatus":1}
    event_body = f'{event_body}'
    lambda_event = {'body':event_body}
    POSTShippingStatus.lambda_handler(lambda_event,None)
    return 0

def delivered(seller_map):
    for seller in seller_map:
        listOfProductName = getProductName(seller_map[seller])
        bodyString = 'Your order number %d, product %s is delivered.'%(ORDER_ID,listOfProductName)
        shipout_email = {
            'subject':'Your Order is Delivered',
            'body':bodyString,
            'recipient':USER_EMAIL
        }
        print(shipout_email)
        # TODO: test SendEmail function
        # SendEmail.EmailMessage(shipout_email)
    event_body = {"orderId": ORDER_ID, "shipStatus":2}
    event_body = f'{event_body}'
    lambda_event = {'body':event_body}
    POSTShippingStatus.lambda_handler(lambda_event,None)
    return 0

def getUserEmail():
    with conn.cursor() as cur:
        try:
            getEmailsql = "SELECT email FROM User where userId=%d;"% BUYER_ID
            cur.execute(getEmailsql)
            email = cur.fetchall[0][0]
            print(email)
            USER_EMAIL=email
            print(USER_EMAIL)
        except:
            return 'Invalid query to User'
    conn.commit()
def getProductName(productIdList):
    listOfName = ''
    firstItem=True
    with conn.cursor() as cur:
        for id in productIdList:
            try:
                getProductSql = "SELECT productName FROM Product where productId=%d;"% id
                cur.execute(getProductSql)
                name = cur.fetchall[0][0]
                if firstItem:
                    listOfName = name
                else:
                    listOfName=listOfName+', '+name
            except:
                return "Invalid query to Product"
    conn.commit()
    return listOfName

test_event = {'body': '{"orderId": 1000}'}
print(lambda_handler(test_event, context=0))
    