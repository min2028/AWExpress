import json
import sys
import os
import logging
import rds_config as rds_config
import pymysql as pymysql
#rds settings
rds_host  = "marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com"
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
    This function adds a new product with specified parameters and returns the new product's id
    """
    
    resObj = {}
    resbody = {}
    body = json.loads(event['body'])
    with conn.cursor() as cur:
        if 'productId' in body:
            productId = body['productId']
        else:
            sql = "select max(productId) as maxId from Product;"
            cur.execute(sql)
            res = cur.fetchall()
            maxProduct = res[0]
            maxProductId = maxProduct[0]
            if maxProductId == None:
                maxProductId=1
            productId = maxProductId + 1
        
        picture = None
        categoryId=0
        description=None
        status = 1
        sellerId = int(body['sellerId'])
        productName = body['productName']
        price = float(body['price'])
        quantity = int(body['quantity'])
        if 'description' in body:
            descriptionBody = body['description']
            description = descriptionBody.replace("'", "''")
        if 'picture' in body:
            picture = body['picture']
        if 'categoryId' in body:
            categoryId = int(body['categoryId'])
        if 'status' in body:
            status = int(body['status'])

        if 'productId' in body:
            sqlToUpdateProduct = "UPDATE Product SET productName='%s', price=%f, description='%s', picture='%s', quantity=%d, status=%d, categoryId=%d WHERE productId=%d;" % (productName, price, description, picture, quantity, status, categoryId, productId)
            cur.execute(sqlToUpdateProduct)
            databaseResponse = cur.fetchall()

            sqlToUpdatePost = "UPDATE Post SET quantity=%d, status=%d WHERE productId=%d;" % (quantity, status, productId)
            cur.execute(sqlToUpdatePost)
            databaseResponse = cur.fetchall()

            sqlToGetPostId = "SELECT postId FROM Post WHERE productId=%d;" % productId
            cur.execute(sqlToGetPostId)
            databaseResponse = cur.fetchall()
            postId = databaseResponse[0][0]
        else:
            sql = ("insert into Product (productId, sellerId, productName, price, description, picture, quantity,status, categoryId) values (%d, %d, '%s', %f, '%s', '%s', %d,%d, %d);" % (productId, sellerId, productName, price, description, picture, quantity,status, categoryId))
            print(sql)
            cur.execute(sql)

            sql2 = "SELECT MAX(postId) as maxPostId from Post;"
            cur.execute(sql2)
            res = cur.fetchall()
            maxPost = res[0]
            maxPostId = maxPost[0]
            if maxPostId == None:
                maxPostId=1
            postId=maxPostId+1
            sql3 = "INSERT INTO Post (postId, userId,productId,quantity,status) VALUES (%d,%d,%d,%d,%d);" % (postId,sellerId,productId,quantity,1)
            cur.execute(sql3)
            res = cur.fetchall()

        resbody['productId'] = productId
        resbody['postId'] = postId

    conn.commit()
    
    
    resObj['statusCode'] = 200
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    
    return resObj

# req = {
#     'body':'{"sellerId":2055,"productName":"Notebook","price":20,"quantity":2, "picture":"https://s3.amazonaws.com/aws.image//tmp/notebook.jpg", "description": "Greatest\' notbook"}'
# }
#
# print(lambda_handler(req,""))