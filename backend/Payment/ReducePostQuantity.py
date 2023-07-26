def reducePostQuantityByRequestedQuantity(productIdsAndQuantity, conn):
    with conn.cursor() as cur:
        for product in productIdsAndQuantity:
            productId = product['productId']
            requestedQuantity = product['quantity']
            queryForActualQuantity = "SELECT quantity FROM Post WHERE productId=%d;"%productId
            cur.execute(queryForActualQuantity)
            databaseResponse = cur.fetchall()
            actualQuantity = databaseResponse[0][0]
            newQuantity = actualQuantity - requestedQuantity
            if newQuantity <= 0:
                queryToSetPostQuantityToZeroAndStatusToInactive = "UPDATE Post SET quantity=0, status=2 WHERE productId=%d;" % productId
                cur.execute(queryToSetPostQuantityToZeroAndStatusToInactive)
                databaseResponse = cur.fetchall()
                queryToSetProductStatusToInactive = "UPDATE Product SET status=2 WHERE productId=%d;" % productId
                cur.execute(queryToSetProductStatusToInactive)
                databaseResponse = cur.fetchall()
            else:
                queryToUpdatePostQuantityAfterTheOrderIsProcessed = "UPDATE Post SET quantity=%d WHERE productId=%d;" %(newQuantity,productId)
                cur.execute(queryToUpdatePostQuantityAfterTheOrderIsProcessed)
                databaseResponse = cur.fetchall()
    conn.commit()