import re
import json

def getProductsWithInvalidSellers(productIdsAndQuantity, databaseConnection):
    productsWithInvalidSellers = []
    with databaseConnection.cursor() as cur:
        for product in productIdsAndQuantity:
            productId = product['productId']
            queryForSellerId = "SELECT sellerId FROM Product WHERE productId=%d;"%productId
            cur.execute(queryForSellerId)
            databaseResponse = cur.fetchall()
            if len(databaseResponse) == 0:
                productsWithInvalidSellers.append(productId)
            else:
                sellerId = databaseResponse[0][0]
                queryForSellerDeposit = 'SELECT deposit FROM UserProfile WHERE userId=%d' % sellerId
                cur.execute(queryForSellerDeposit)
                databaseResponse = cur.fetchall()
                sellerDepositInfo = json.loads(databaseResponse[0][0])
                sellerAccountNumber = sellerDepositInfo['accountNumber']
                sellerTransitNumber = sellerDepositInfo['transitNumber']
                sellerInstitutionNumber = sellerDepositInfo['institutionNumber']
                if not verifyDeposit(sellerAccountNumber, sellerTransitNumber, sellerInstitutionNumber):
                    productsWithInvalidSellers.append(productId)
        return productsWithInvalidSellers

def verifyDeposit(accountNumber, transitNumber, institutionNumber):
    return (
        len(accountNumber) >= 7 and
        len(accountNumber) <= 12 and
        len(transitNumber) == 5 and 
        len(institutionNumber) == 3 and
        isOnlyNumbers(accountNumber) and
        isOnlyNumbers(transitNumber) and
        isOnlyNumbers(institutionNumber)
    )

def isOnlyNumbers(str):
    return re.match("^[0-9]+$", str)

def isOnlyLettersAndSpace(str):
    return re.match("^[A-Za-z\s]+$", str)