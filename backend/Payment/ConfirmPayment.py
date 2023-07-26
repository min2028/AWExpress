import json
import sys
import os
import logging
import rds_config as rds_config
import pymysql as pymysql

from VerifyCard import *
from VerifyDeposit import *
from VerifyAddress import *
from VerifyQuantity import *
from VerifyContact import *
from CreateOrder import *
from CreateOrderLists import *
from ReducePostQuantity import *
from RemoveCartItems import *
from SendEmailsToBuyer import *
from SendEmailsToSellers import *

#rds settings
rds_host  = "marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com"
from SendEmailsToSellers import *

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
    print(f"event is {event}")
    """
    This function processes an order, verifying all preconditions, updating tables, and sending notifications
    All information and items in the order must be valid, otherwise an error is returned
    To prevent race conditions where two conflicting orders are verified simultaneously, this function should have a concurrency limitation of 1
    """

    eventBody = json.loads(event['body'])
    userId = int(eventBody['userId'])
    productIdsAndQuantity = eventBody['productIdsAndQuantity']
    phoneNumber = eventBody['phoneNumber']
    emailAddress = eventBody['emailAddress']
    cardNumber = eventBody['cardNumber']
    cardName = eventBody['cardName']
    cardExpiry = eventBody['cardExpiry']
    cardSecurity = eventBody['cardSecurity']
    shippingName = eventBody['shippingName']
    shippingCountry = eventBody['shippingCountry']
    shippingRegion = eventBody['shippingRegion']
    shippingMunicipality = eventBody['shippingMunicipality']
    shippingStreetAddress = eventBody['shippingStreetAddress']
    shippingExtraAddressInfo = eventBody['shippingExtraAddressInfo']
    shippingPostalCode = eventBody['shippingPostalCode']
    billingName = eventBody['billingName']
    billingCountry = eventBody['billingCountry']
    billingRegion = eventBody['billingRegion']
    billingMunicipality = eventBody['billingMunicipality']
    billingPostalCode = eventBody['billingPostalCode']


    if not verifyContact(phoneNumber, emailAddress):
        httpResponse = {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Invalid contact information'})
        }
        return httpResponse

    if not verifyCard(cardNumber, cardName, cardExpiry, cardSecurity):
        httpResponse = {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Invalid card information'})
        }
        return httpResponse

    if not verifyShipping(shippingName, shippingCountry, shippingRegion, shippingMunicipality, shippingPostalCode):
        httpResponse = {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Invalid shipping address'})
        }
        return httpResponse
    
    if not verifyBilling(billingName, billingCountry, billingRegion, billingMunicipality, billingPostalCode):
        httpResponse = {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Invalid billing address'})
        }
        return httpResponse

    productsWithInvalidQuantities = getProductsWithInvalidQuantities(productIdsAndQuantity, conn)
    if len(productsWithInvalidQuantities) != 0:
        httpResponse = {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Invalid requested quantity',
                                'invalidIds': productsWithInvalidQuantities})
        }
        return httpResponse

    productsWithInvalidSellers = getProductsWithInvalidSellers(productIdsAndQuantity, conn)
    if len(productsWithInvalidSellers) != 0:
        httpResponse = {
            'statusCode': 503,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': 'Invalid product seller',
                                'invalidIds': productsWithInvalidSellers})
        }
        print(httpResponse)
        return httpResponse
    shippingAddress = {
        "city": shippingMunicipality, 
        "province": shippingRegion, 
        "postalCode": shippingPostalCode, 
        "streetAddress": shippingStreetAddress,
    }
    newOrderId = createOrder(userId, shippingAddress, conn)

    createOrderLists(productIdsAndQuantity, userId, newOrderId, conn)

    reducePostQuantityByRequestedQuantity(productIdsAndQuantity, conn)

    removeAllItemsFromUsersCart(productIdsAndQuantity, userId, conn)

    sendOrderConfirmationOrderShippedAndOrderArrivedEmailOrOrderCancelledEmailIfBuyerCancelsOrderBeforeOrderHasShipped(
        newOrderId, productIdsAndQuantity,userId, conn)

    sendOrderReceivedEmailToAllSellers(productIdsAndQuantity, conn)
    resBody = {
        'orderId':newOrderId,
        'message': 'Order has been placed successfully'
    }

    conn.commit()

    httpResponse = {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(resBody)
    }
    return httpResponse


# reqbody = {
#     'userId': 2002,
#     'productIdsAndQuantity': [
#         {
#             'productId': 3,
#             'quantity': 4
#         },
#         {
#             'productId': 4,
#             'quantity': 5
#         },
#         {
#             'productId': 6,
#             'quantity': 1
#         }
#     ],
#     'cardNumber': '1000000000000000',
#     'cardName': 'Joe Kim',
#     'cardExpiry': '0229',
#     'cardSecurity': '302',
#     'emailAddress': "123@123.com",
#     'shippingName': 'Joe Kim',
#     'shippingCountry': 'Canada',
#     'shippingRegion': 'BC',
#     'shippingMunicipality': 'Vancouver',
#     'shippingPostalCode': 'V6A 1B2',
#     'billingName':'Joe Kim',
#     'billingCountry': 'Canada',
#     'billingRegion': 'BC',
#     'billingMunicipality': 'Vancouver',
#     'billingPostalCode': 'V6A 1B2',
#     'phoneNumber':'1231231234'
# }
# req = {
#     'body': json.dumps(reqbody)
# }
# print(lambda_handler(req, ""))
