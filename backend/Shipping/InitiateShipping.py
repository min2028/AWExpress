import json
import logging
from rds_config import get_db_connection
import SendEmail
import POSTShippingStatus
from datetime import datetime
from POSTShippingStatus import ShippingStatusCode
from ShippingFunctions import getUserEmail, getProductName

logger = logging.getLogger()
logger.setLevel(logging.INFO)
conn = get_db_connection(logger)

# order status
# 1 - pending
# 2 - paid
# 3 - delivered
# 4 - cancelled
# 5 - confirmed shipping
# 6 - shipped out
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
    
    
    with conn.cursor() as cur:
        try:
            # check shipId in Order table
            checkShipSql = "SELECT shipId FROM Orders WHERE orderId=%d;"%(orderId)
            cur.execute(checkShipSql)
            res = cur.fetchall()[0][0]
            print(res)

            # TODO: check shipStatus and return corresponding code for next shipping step if shipId exists
            # if shipId exists, don't need to add another tuple, just return the shipping status to move to the next shipping step
            if res != None and res != -1:
                resObj = {}
                resbody = {}


                resbody['statusCode'] = 201
                resbody['message'] = 'This order has an existing shipping instance'
                resbody['orderId'] = orderId

                resObj['body'] = json.dumps(resbody)
                return resObj

            # assign a shipId
            sql_get_ship_id = "SELECT MAX(shipId) From Shipping;"
            cur.execute(sql_get_ship_id)
            maxShippingId = cur.fetchall()[0][0]

            if maxShippingId is None:
                maxShippingId = 0
                # raise Exception("Maximum shipping id does not exist")

            shipId = maxShippingId+1

            # update shipId for Order
            sql_update_ship_id = "UPDATE Orders SET shipId=%d WHERE orderId=%d;"%(shipId,orderId)
            cur.execute(sql_update_ship_id)
            res = cur.fetchall()

            # get new tracking id
            tracking_id_query = "SELECT MAX(trackingId) From Shipping;"
            cur.execute(tracking_id_query)
            max_tracking_id = cur.fetchall()[0][0]

            if max_tracking_id is None:
                max_tracking_id = 0
                # raise Exception("Max tracking id does not exist")

            tracking_id = max_tracking_id + 1

            # get ship time
            shipped_time = datetime.now().date().strftime('%Y-%m-%d')

            # TODO: only the year is inserted as date, fix this
            # insert shipping tuple into shipping table
            insert_ship_sql = "INSERT INTO Shipping (shipId, trackingId, shippedTime, shipStatus) VALUES (%d, %d, %s, 0);" % \
                              (shipId, tracking_id, shipped_time)
            cur.execute(insert_ship_sql)
            res = cur.fetchall()
            
            sql1 = "SELECT OrderList.productId, OrderList.sellerId, Orders.buyerId, Orders.shipAddress FROM Orders LEFT JOIN OrderList ON Orders.orderId=OrderList.orderId WHERE Orders.orderId=%d;"%orderId
            cur.execute(sql1)
            items = cur.fetchall()
            BUYER_ID = items[0][2]
            shipAddress = items[0][3]

            if shipAddress is None:
                raise Exception("Ship address is None")

            # get delivery address
            delivery_address_query = "SELECT shipAddress FROM Orders WHERE orderId=%d;" % orderId
            cur.execute(delivery_address_query)
            delivery_address = cur.fetchall()[0][0]

            if delivery_address is None:
                raise Exception("Buyer does not have a delivery address")

            update_delivery_address = "UPDATE Shipping SET deliveryAddress='%s' WHERE shipId=%d;" \
                                      % (delivery_address, shipId)
            cur.execute(update_delivery_address)
            res = cur.fetchall()
            print(res)
            # update shipping address in shipping tuples
            # update_address_sql = "UPDATE Shipping SET shipAddress='%s' WHERE shipId=%d;"%(shipAddress,shipId)
            # print(update_address_sql)
            # cur.execute(update_address_sql)

            for i in items:
                seller = i[1]
                productId = i[0]
                if seller is None or productId is None:
                    seller_map = None
                if seller in seller_map:
                    seller_map[seller].append(productId)
                else:
                    seller_map[seller] = [productId]

            USER_EMAIL = getUserEmail(BUYER_ID, conn)

            if seller_map is not None:
                initialize_shipping(seller_map, ORDER_ID, USER_EMAIL)
            else:
                raise Exception("Could not find any orders")

            update_order_sql = "UPDATE Orders SET status=5 WHERE orderId=%d;"%orderId
            cur.execute(update_order_sql)
            res = cur.fetchall()
            print(res)
        except Exception as e: 
            print(e)
            request_body['statusCode'] = 400
            request_body = str(e)
            return {'body': json.dumps(request_body)}
    conn.commit()
    request_body['userId'] = BUYER_ID
    request_body['orderId'] = orderId
    request_body['userEmail'] = USER_EMAIL
    request_body['sellerMap'] = seller_map
    request_body['shipId'] = shipId
    request_body['statusCode'] = 200

    return {'body': request_body}


def initialize_shipping(seller_map, ORDER_ID, USER_EMAIL):
    for seller in seller_map:
        listOfProductName = getProductName(seller_map[seller], conn)

        bodyString = 'Your order number %d has been processed. The shipping label for product %s has been created.' % \
                     (ORDER_ID, listOfProductName)
        print(bodyString)
        shipout_email = {
            'subject': 'Your order has been processed',
            'body': bodyString,
            'recipient': USER_EMAIL
        }
        # SendEmail.EmailMessage(shipout_email)
        email_status = SendEmail.sendEmail(shipout_email)

        print("email status", email_status)

    # update shipping status
    event_body = {"orderId": ORDER_ID, "shipStatus": ShippingStatusCode.SHIPPING_PENDING.value[0]}
    event_body = f'{event_body}'
    lambda_event = {'body': event_body}
    POSTShippingStatus.lambda_handler(lambda_event, None)
    return 0


# import Shipout
# import ShippingDelivered

# test_event = {'body': '{"orderId": 123}'}
# initialize_shipping_obj = lambda_handler(test_event, context=0)
# print("initialize obj: ", initialize_shipping_obj)

# shipout_obj = Shipout.lambda_handler(initialize_shipping_obj, context=0)
# print("shipout obj: ", shipout_obj)

# shipping_delivered_obj = ShippingDelivered.lambda_handler(shipout_obj, context=0)
# print("shipping delivered obj: ", shipping_delivered_obj)

# test_event = {
#   "body": "{\"orderId\": 15}"
# }
#
# print(lambda_handler(test_event, context=0))



