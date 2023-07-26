import json


def getUserEmail(buyer_id, conn):
    with conn.cursor() as cur:
        try:
            getEmailsql = "SELECT email FROM User where userId=%d;" % buyer_id
            cur.execute(getEmailsql)
            email = cur.fetchall()[0][0]
            # print(email)
            # USER_EMAIL = email
            # print(USER_EMAIL)
        except:
            return 'Invalid query to User'
    conn.commit()

    return email


def getProductName(productIdList, conn):
    listOfName = ''
    firstItem=True
    if productIdList is None:
        return None
    with conn.cursor() as cur:
        for id in productIdList:
            try:
                getProductSql = "SELECT productName FROM Product where productId=%d;" % id
                cur.execute(getProductSql)
                name = cur.fetchall()[0][0]
                if firstItem:
                    listOfName = name
                else:
                    listOfName=listOfName+', '+name
            except:
                return "Invalid query to Product"
    conn.commit()
    return listOfName


def get_ship_status_from_order_id(order_id, conn):
    with conn.cursor() as cur:
        try:
            ship_id_query = "SELECT shipID FROM Orders WHERE orderId=%d;" % order_id
            cur.execute(ship_id_query)
            ship_id = cur.fetchall()[0][0]


        except:
            pass
    return


def get_ship_status_from_ship_id(ship_id, conn):
    body = {}
    with conn.cursor() as cur:
        try:
            ship_status_query = "SELECT shipStatus FROM Shipping WHERE shipId=%d;" % ship_id
            cur.execute(ship_status_query)
            return cur.fetchall()[0][0]
        except:
            return {'body': json.dumps()}
