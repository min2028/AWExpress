import pymysql as pymysqls
def createOrderLists(productIdsAndQuantity, buyerId, orderId, conn):
    with conn.cursor() as cur:
        for product in productIdsAndQuantity:
            productId = product['productId']
            requestedQuantity = product['quantity']
            queryForSellerId = "SELECT sellerId FROM Product WHERE productId=%d;" % productId
            cur.execute(queryForSellerId)
            databaseResponse = cur.fetchall()
            sellerId = int(databaseResponse[0][0])
            queryToInsertNewOrderList = "INSERT INTO OrderList(orderId,productId,quantity,sellerId,buyerId) VALUES (%d,%d,%d,%d,%d);" % \
                (int(orderId), int(productId), int(requestedQuantity), int(sellerId),int(buyerId))
            cur.execute(queryToInsertNewOrderList)
            databaseResponse = cur.fetchall()
    conn.commit()