import json
import pymysql as pymysql
def createOrder(userId, address, conn):
    INITIAL_STATUS = 2
    with conn.cursor() as cur:
        queryForAllOrderIds = "select max(orderId) from Orders;"
        cur.execute(queryForAllOrderIds)
        maxOrderId = cur.fetchall()
        if maxOrderId[0][0] == None:
            newOrderId = 1
        else:
            newOrderId = int(maxOrderId[0][0]) + 1
        queryToInsertNewOrder = "INSERT INTO Orders(orderId,buyerId,status,shipAddress) VALUES (%d,%d,%d,'%s');" % (newOrderId,userId,INITIAL_STATUS,json.dumps(address))
        cur.execute(queryToInsertNewOrder)
        databaseResponse = cur.fetchall()
    conn.commit()
    return newOrderId