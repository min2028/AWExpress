import json
import sys
import logging
from rds_config import get_db_connection
import pymysql
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


def lambda_handler(event, context):

    request_body = {}

    try:
        orderId = json.loads(event['body'])['orderId']
        # print(shipID_from_orderID)
    except:
        request_body['statusCode'] = 400
        request_body = 'Invalid request body'
        return {'body': json.dumps(request_body)}

    with conn.cursor() as cur:
        try:
            shipingId_query = "SELECT shipId from Orders where orderId=%d" % orderId
            cur.execute(shipingId_query)
            shippingId = cur.fetchall()[0][0]

            shipping_status_query = "Select shipStatus from Shipping where shipId=%d" % shippingId
            cur.execute(shipping_status_query)
            shipping_status = int(cur.fetchall()[0][0])
        except:
            request_body['statusCode'] = 400
            request_body = 'Invalid query to Orders'
            return {'body': json.dumps(request_body)}

        if shipping_status not in ShippingStatusString:
            request_body['statusCode'] = 400
            request_body = 'Invalid shippingId or status'
            return {'body': json.dumps(request_body)}

        request_body['shipId'] = shippingId
        request_body['shipStatus'] = shipping_status
        request_body['statusString'] = ShippingStatusString[shipping_status]

        return {'body': json.dumps(request_body)}


test_event = {'body': '{"orderId": 1000}'}
print(lambda_handler(test_event, context=0))
