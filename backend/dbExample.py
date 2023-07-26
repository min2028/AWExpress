import json
import sys
import logging
import rds_config
import library.pymysql as pymysql
#rds settings
rds_host  = "marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com"
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

logger = logging.getLogger()
logger.setLevel(logging.INFO)
print(logging)
try:
    conn = pymysql.connect(host=rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error("ERROR: Unexpected error: Could not connect to MySQL instance.")
    logger.error(e)
    sys.exit()

logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")
print("connect successful")
def handler(event, context):
    """
    This function fetches content from MySQL RDS instance
    """

    item_count = 0
    
    sql = "select * from User"

    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()
        print(res)
    conn.commit()

    return "Added %d items from RDS MySQL table" %(item_count)
handler("","")