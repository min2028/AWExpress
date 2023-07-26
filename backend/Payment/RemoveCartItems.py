def removeAllItemsFromUsersCart(productIdsAndQuantity, userId, conn):
    with conn.cursor() as cur:
        for product in productIdsAndQuantity:
            productId = product['productId']
            queryToDeleteCartItem = 'DELETE FROM ShoppingCartItem WHERE userId=%d AND productId=%d;' % (userId, productId)
            cur.execute(queryToDeleteCartItem)
        databaseResponse = cur.fetchall()
    conn.commit()