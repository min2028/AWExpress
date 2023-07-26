def getProductsWithInvalidQuantities(productIdsAndQuantity, databaseConnection):
    productsWithInvalidQuantities = []
    with databaseConnection.cursor() as cur:
        for product in productIdsAndQuantity:
            productId = product['productId']
            requestedQuantity = product['quantity']
            query = "SELECT quantity FROM Post WHERE productId=%d;"%productId
            cur.execute(query)
            databaseResponse = cur.fetchall()
            postQuantity = databaseResponse[0][0]
            if requestedQuantity > postQuantity:
                productsWithInvalidQuantities.append(productId)
        return productsWithInvalidQuantities