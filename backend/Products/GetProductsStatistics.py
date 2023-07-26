import json
import sys
import logging
import rds_config
import pymysql

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
    This function returns # of cart items, # of listings, # of orders and # of pending orders
    Path: "/user/{userId}/products-statistics"
    """
    resbody = {}
    resObj = {}
    try:
       user_id = int(event["pathParameters"]["userId"])
    except:
        resObj['statusCode']=400
        resbody = 'Invalid request body'
        resObj['body'] = json.dumps(resbody)
        return resObj

    cartItemSql = "select count(*) from ShoppingCartItem where userId=%d;" % user_id
    listingSql = "select count(*) from Post where userId=%d;" % user_id
    orderSql = "select count(*) from Orders where buyerId=%d and status=3;" % user_id
    pendingOrderSql = "select count(*) from Orders where status=2 and buyerId=%d;" % user_id
    queries = {"cart-items": cartItemSql,
               "listings": listingSql,
               "orders": orderSql,
               "pending-orders": pendingOrderSql
    }
    with conn.cursor() as cur:
        for field, sql in queries.items():
            cur.execute(sql)
            res = cur.fetchall()
            resbody[field] = res[0][0]
        getsellpendorder = "select count(*) from Orders LEFT JOIN OrderList ON Orders.orderId = OrderList.orderId \
        WHERE Orders.status=2 and OrderList.sellerId = %d GROUP BY OrderList.orderId;" %user_id

        cur.execute(getsellpendorder)
        res = cur.fetchall()
        resbody['sellPendingOrders'] = len(res)
        conn.commit()

        return {
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps(resbody)
        }

# test_event = {'pathParameters': {"userId": 2058}}
# print(lambda_handler())
# print(lambda_handler(test_event, ""))