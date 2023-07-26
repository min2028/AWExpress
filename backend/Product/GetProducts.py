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
    body = json.loads(event['body'])
    sql = createQuery(body)

    resObj = {}
    resbody = {'items': []}

    with conn.cursor() as cur:
        cur.execute(sql)
        res = cur.fetchall()

        start = (int(body['page'])-1)*PAGE_SIZE
        end = start + PAGE_SIZE
        if end > len(res): 
            end = len(res)

        if start > len(res):
            pass
        else:
            for i in range(start, end):
                product = res[i]
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
                item['originalQuantity'] = product[10]
                item['sellerFirstName'] = product[11]
                item['sellerLastName'] = product[12]
                item['sellerDepartment'] = product[13]
                item['availableQuantity'] = product[7]
                resbody['items'].append(item)
        
    conn.commit()
    resObj = {}
    resbody['numOfPages'] = math.ceil(len(res)/PAGE_SIZE)
    
    resObj['statusCode'] = 200
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = json.dumps(resbody)
    
    return resObj


# createQuery checks for defined parameters in the body, and adds the corresponding condition to the sql query and returns the sql
def createQuery(body):
    # sql = "SELECT Product.productId as productId, sellerId, productName, price, description, picture, Post.status as status, Post.quantity as quantity, categoryId, Post.postId FROM Product LEFT JOIN Post ON Product.productId= Post.productId"
    sql = "SELECT Product.productId as productId, sellerId, productName, price, description, picture, Post.status as status, Post.quantity as quantity, categoryId, Post.postId, Product.quantity as originalQuantity, UserProfile.firstName as sellerFirstName, UserProfile.lastName as sellerLastName, UserProfile.department as sellerDepartment FROM Product LEFT JOIN Post ON Product.productId= Post.productId LEFT JOIN UserProfile on Product.sellerId=UserProfile.userId"
    conditions = []
    try: conditions.append("Product.productId=%d" % int(body['productId']))
    except: pass
    try: conditions.append("Product.productId!=%d" % int(body['notProductId']))
    except: pass
    try: conditions.append("Product.sellerId=%d" % int(body['sellerId']))
    except: pass
    try: conditions.append("Product.productName like \'%s\'" % ('%'+body['productName']+'%'))
    except: pass
    try: conditions.append("Product.price>=%d" % float(body['lowPrice']))
    except: pass
    try: conditions.append("Product.price<=%d" % float(body['highPrice']))
    except: pass
    try: conditions.append("Product.description like \'%s\'" % ('%'+body['description']+'%'))
    except: pass
    try: conditions.append("Product.categoryId=%d" % int(body['categoryId']))
    except: pass
    try: conditions.append("Post.status=%d" % (int(body['status']),int(body['status'])))
    except: pass
    try: conditions.append("UserProfile.firstName like \'%s\'" % ('%'+body['sellerFirstName']+'%'))
    except: pass
    try: conditions.append("UserProfile.lastName like \'%s\'" % ('%'+body['sellerLastName']+'%'))
    except: pass
    try: conditions.append("UserProfile.department like \'%s\'" % ('%'+body['sellerDepartment']+'%'))
    except: pass
    try: conditions.append("Post.quantity>=%d" % int(body['quantity']))
    except: pass
    print(len(conditions))
    isFirst = True
    for i in range(len(conditions)):
        if isFirst: 
            sql = sql + " WHERE " + conditions[i]
            isFirst = False
        else: 
            sql = sql + " AND " + conditions[i]

    sql = sql + " ORDER BY ProductId DESC;"
    print(sql)
    return sql
# req = {
#     'body':'{"productId":33,"page":1}'
# }

# print(lambda_handler(req,""))