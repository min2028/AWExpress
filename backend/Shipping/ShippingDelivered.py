import json
import logging
from rds_config import get_db_connection
import SendEmail
import POSTShippingStatus
from POSTShippingStatus import ShippingStatusCode
from ShippingFunctions import getProductName

logger = logging.getLogger()
logger.setLevel(logging.INFO)
conn = get_db_connection(logger)


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
    try:
        event_body = event['body']
        seller_map = event_body['sellerMap']
        user_email = event_body['userEmail']
        orderId = event_body['orderId']
        buyer_id = event_body['userId']
        ship_id = event_body['shipId']
    except:
        request_body['statusCode'] = 400
        request_body = 'Invalid request body'
        return {'body': json.dumps(request_body)}

    with conn.cursor() as cur:
        try:
            delivered(seller_map, orderId, user_email)
        except Exception as e: 
            print(e)
            request_body['statusCode'] = 400
            request_body = 'Invalid query to Orders'
            return {'body': json.dumps(request_body)}
        try:
            update_order_sql = "UPDATE Orders SET status=3 WHERE orderId=%d;"%orderId
            cur.execute(update_order_sql)
        except Exception as e: 
            print(e)
            request_body['statusCode'] = 400
            request_body = 'Invalid query to Update Orders'
            return {'body': json.dumps(request_body)}
    conn.commit()
    request_body['orderId'] = orderId
    request_body['userEmail'] = user_email
    request_body['sellerMap'] = seller_map
    request_body['statusCode'] = 200

    return {'body': json.dumps(request_body)}


def delivered(seller_map, order_id, user_email):
    for seller in seller_map:
        listOfProductName = getProductName(seller_map[seller], conn)
        bodyString = 'Your order number %d, product %s is delivered.'%(order_id, listOfProductName)
        shipout_email = {
            'subject' : 'Your order is delivered',
            'body':bodyString,
            'recipient':user_email
        }
        print(shipout_email)
        SendEmail.sendEmail(shipout_email)

    # update shipping status to delivered
    event_body = {
        "orderId": order_id,
        "shipStatus": ShippingStatusCode.DELIVERED,
        "statusCode": 200
    }
    event_body = f'{event_body}'
    lambda_event = {'body': event_body}
    POSTShippingStatus.lambda_handler(lambda_event, None)
    return 0


# test_event = {'body': '{"userId": 2058, "orderId": 123, "userEmail": "rebecca.chang1001@gmail.com", "sellerMap": {"2011": [1]}, "shipId": 530}'}
# delivered_obj = lambda_handler(test_event, context=0)
# print(delivered_obj)
    