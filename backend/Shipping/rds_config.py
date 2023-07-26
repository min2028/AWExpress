import pymysql
import sys
import logging

# RDS MySQL instance
rds_host  = "marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com"
db_username = "dev-user1"
db_password = "dev-user1"
db_name = "aws"
port = 3306


def get_db_connection(logger):
    try:
        conn = pymysql.connect(host=rds_host, user=db_username, passwd=db_password, db=db_name, connect_timeout=5)
    except pymysql.MySQLError as e:
        logger.error("ERROR: Unexpected error: Could not connect to MySQL instance.")
        logger.error(e)
        sys.exit()
    return conn

