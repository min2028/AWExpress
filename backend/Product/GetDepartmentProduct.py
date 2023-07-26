
import json
import sys
import os
import logging
import rds_config as rds_config
import pymysql as pymysql
import math
#rds settings
rds_host = "marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com"
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

PAGE_SIZE = 50
CATEGORY_LIST = {
    0:"Electronics",
    1:"Clothing",
    2:"Home and Kitchen",
    3:"Toys",
    4:"Books",
    5:"Supplements",
    6:"Drugs",
    7:"Drinks and Food",
    8:"Pets Good",
    9:"Others"
}
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
    This function searches for a product by name and returns a list of products containing that name in productName
    """
    resObj = {}
    resbody = {'items': []}

    with conn.cursor() as cur:
        specialUserSql = "SELECT userId from User WHERE DepartmentRole=1;"
        cur.execute(specialUserSql)
        res = cur.fetchall()
        for user in res:
            userId=user[0]
            getProductListSql = "SELECT Product.productId as productId, sellerId, productName, price, description, picture, \
            Post.status as status, Post.quantity as quantity, categoryId, Post.postId FROM Product LEFT JOIN Post ON Product.productId= Post.productId \
            WHERE Product.sellerId=%d" % userId
            cur.execute(getProductListSql)
            res = cur.fetchall()
            for product in res:
                item = {}
                item['productId'] = product[0]
                item['sellerId'] = product[1]
                item['productName'] = product[2]
                item['price'] = "%.2f" % product[3]
                item['description'] = product[4]
                item['picture'] = product[5]
                item['status'] = product[6]
                item['quantity'] = product[7]
                item['categoryId'] = product[8]
                if item['categoryId'] is not None and int(item['categoryId']) <=9 and int(item['categoryId']) >=0:
                    item['categoryId'] = CATEGORY_LIST[int(product[8])]
                else:
                    item['categoryId'] = None
                item['postId'] = product[9]
                queryForSellerFirstAndLastName = 'SELECT firstName, lastName, department FROM UserProfile WHERE userId=%d' % item['sellerId']
                cur.execute(queryForSellerFirstAndLastName)
                databaseResponse = cur.fetchall()
                sellerFirstName = databaseResponse[0][0]
                sellerLastName = databaseResponse[0][1]
                sellerDepartment = databaseResponse[0][2]
                item['sellerFirstName'] = sellerFirstName
                item['sellerLastName'] = sellerLastName
                item['sellerDepartment'] = sellerDepartment
                queryForAvailableProductQuantity = 'SELECT quantity FROM Post WHERE productId=%d' % item['productId']
                cur.execute(queryForAvailableProductQuantity)
                databaseResponse = cur.fetchall()
                availableQuantity = databaseResponse[0][0]
                item['availableQuantity'] = availableQuantity
                sellerdepartmentQuery = "SELECT DepartmentRole FROM User WHERE userId=%d;" % item['sellerId']
                cur.execute(sellerdepartmentQuery)
                databaseResponse = cur.fetchall()
                resbody['departmentRole'] = databaseResponse[0][0]
                resbody['items'].append(item)
    conn.commit()
    resObj['statusCode'] = 200
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    return resObj
req = None

print(lambda_handler(req,""))