import json
import sys
import logging
import rds_config as rds_config
import pymysql as pymysql

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


def lambda_handler(event, context):
    response_body = {}
    try:
        event_body = json.loads(event['body'])
        user_email = event_body['email']
        status_to_get = event_body['orderStatus']

        user_id = get_userid_from_email(user_email)
        if user_id is None:
            response_body['statusCode'] = 404
            resbody = 'User not found'
            response_body['body'] = json.dumps(resbody)
            return response_body

        orders = get_orders_by_userid(user_id)

        if orders is None:
            response_body['body']['orders'] = None
            return json.dumps(response_body)

        # get all orders with paid status (status == 2)
        orders_with_status_paid = get_orders_with_status(orders, status_to_get)
        response_body['body'] = json.dumps(orders_with_status_paid)

        return response_body

    except:
        response_body['statusCode'] = 400
        resbody = 'Invalid request body'
        response_body['body'] = json.dumps(resbody)
        return response_body


def get_orders_with_status(orders, status):
    order_with_status = []
    for order in orders:
        if order['status'] == status:
            order_with_status.append(order)

    return order_with_status


def get_orders_by_userid(userId):
    """
    This function returns the order history for a user with the given userId if it exists and return Error otherwise
    Path: GET /user/{userId}/orderHistory
    """
    # Parse out Query string params
    # resbody = {"orders": []}

    orders = []

    # Query Database
    query = "select * " \
            "from Orders where Orders.buyerId=%d;" % userId
    with conn.cursor() as cur:
        cur.execute(query)
        res = cur.fetchall()

        # Construct response
        if not len(res):
            return None
        for row in res:
            order = {
                'orderId': row[0],
                'buyerId': row[1],
                'status': row[4]
            }
            orders.append(order)
    conn.commit()

    return orders


def get_userid_from_email(userEmail):
    """
    This function check if the user exists in the system, if user doesn't exist will add the user to database
    """


    sql = "select * from User where email='%s';" % userEmail
    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        conn.commit()
        if len(res) == 0:
            return None
        else:
            user = res[0]
            userId = user[0]
            return userId


# test_event = {'body': '{"email": "rebecca.chang1001@gmail.com", "orderStatus": 2}'}
# response = lambda_handler(test_event, context=0)
#
# print(response)
