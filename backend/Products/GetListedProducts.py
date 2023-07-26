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
    This function return all the products item that listed by the seller
    Path: "/user/{userId}/listed-products"
    """
    userId = int(event['pathParameters']['userId'])
    resbody = {"products": []}

    sql = "select * from Product where Product.sellerId = %d;" % userId

    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        for row in res:
            product = {
                'productId': row[0],
                'sellerId': row[1],
                'productName': row[2],
                'price': row[3],
                'description': row[4],
                'picture': row[5],
                'quantity': row[6],
                'status': row[7],
                'categoryId': row[8]
            }
            resbody['products'].append(product)
        conn.commit()

        return {
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps(resbody)
        }
