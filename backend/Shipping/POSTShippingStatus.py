import json
import logging
from rds_config import get_db_connection
from enum import Enum

logger = logging.getLogger()
logger.setLevel(logging.INFO)
conn = get_db_connection(logger)


class ShippingStatusCode(Enum):
    SHIPPING_PENDING = 0,
    ON_THE_WAY = 1,
    DELIVERED = 2,
    CANCELLED = 3


ShippingStatusString = {
    0: "Shipping Pending",
    1: "On the way",
    2: "Delivered",
    3: "Cancelled"
}


def lambda_handler(event, context):
    request_body = {}

    try:
        # get shipping status of order
        orderId = json.loads(event['body'])['orderId']
        new_shipping_status = json.loads(event['body'])['shipStatus']
    except:
        request_body['statusCode'] = 400
        request_body = 'Invalid request body'
        return {'body': json.dumps(request_body)}

    select_cur = conn.cursor()  # cursor for select queries
    update_cur = conn.cursor()  # cursor for update queries
    with conn.cursor() as cur:
        try:
            # get shippingId of order we want to update
            shipingId_query = "SELECT shipId from Orders where orderId=%d;" % orderId
            cur.execute(shipingId_query)
            res = cur.fetchall()
            shippingId = res[0][0]

            # update shipping status
            update_shipping_status_query = "UPDATE Shipping SET shipStatus=%d WHERE shipId=%d;" % (new_shipping_status, shippingId)
            cur.execute(update_shipping_status_query)
            

            # confirm that shipping status is updated
            confirm_shipping_status_query = "SELECT shipStatus from Shipping where shipId=%d;" % shippingId
            cur.execute(confirm_shipping_status_query)
            res=cur.fetchall()
            updated_shipping_status = res[0][0]

        except:
            request_body['statusCode'] = 400
            request_body = 'Invalid query'
            return {'body': json.dumps(request_body)}
    conn.commit()
    # return order and new shipping status
    request_body['statusCode'] = 200
    request_body['body'] = {'orderId': orderId, 'shipStatus': updated_shipping_status}
    return request_body


test_event = {'body': '{"orderId": 1000, "shipStatus": 2}'}
print(lambda_handler(test_event, context=0))
