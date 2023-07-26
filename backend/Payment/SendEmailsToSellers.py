from email.message import EmailMessage
import ssl
import smtplib

EMAIL_SENDER_ADDRESS = 'awe.noreplay.notification@gmail.com'
EMAIL_SENDER_PASSWORD = 'vjneblhmbwkqlxyb'

EMAIL_SENDER_PLATFORM = EMAIL_SENDER_ADDRESS.split('@',1)[1] # the platform that serves the email address e.g. gmail.com
EMAIL_SENDER_PLATFORM_PORT = 465

def sendOrderReceivedEmailToAllSellers(productIdsAndQuantity, conn):
    """
    This function sends an email using SSL (Secure Socket Layer)
    """
    with conn.cursor() as cur:
        listOfSellerIdsForEachProduct = []
        for product in productIdsAndQuantity:
            productId = product['productId']
            queryForSellerId = 'SELECT sellerId FROM Product WHERE productId=%d' % productId
            cur.execute(queryForSellerId)
            databaseResponse = cur.fetchall()
            sellerId = databaseResponse[0][0]
            listOfSellerIdsForEachProduct.append(sellerId)
            
        setOfUniqueSellerIds = set(listOfSellerIdsForEachProduct)
        for sellerId in setOfUniqueSellerIds:
            queryForSellerEmail = "SELECT email FROM User WHERE userId=%d" % sellerId
            cur.execute(queryForSellerEmail)
            databaseResponse = cur.fetchall()
            sellerEmail = databaseResponse[0][0]

            emailBodyIntro = 'You have received an order for the following items\n\n'
            emailBodyOutro = '\nThis is an automated message. Please do not reply to this email.'
            emailBodyOrderInformation = ''
            allIndicesOfSellerIdInList = [index for index, id in enumerate(listOfSellerIdsForEachProduct) if id == sellerId]
            for index in allIndicesOfSellerIdInList:
                queryForProductName = "SELECT productName FROM Product WHERE productId=%d" % productIdsAndQuantity[index]['productId']
                cur.execute(queryForProductName)
                databaseResponse = cur.fetchall()
                productName = databaseResponse[0][0]
                emailBodyOrderInformation = emailBodyOrderInformation + f"{productIdsAndQuantity[index]['quantity']} x {productName}\n\n"

            emailRecipient = sellerEmail
            emailSubject = 'You Have Received a New Order!'
            emailBody = emailBodyIntro + emailBodyOrderInformation + emailBodyOutro

            emailObject = EmailMessage()
            emailObject['From'] = EMAIL_SENDER_ADDRESS
            emailObject['To'] = emailRecipient
            emailObject['Subject'] = emailSubject
            emailObject.set_content(emailBody)

            secureSocket = ssl._create_unverified_context()
            with smtplib.SMTP_SSL('smtp.'+EMAIL_SENDER_PLATFORM, EMAIL_SENDER_PLATFORM_PORT, context=secureSocket) as smtp:
                smtp.login(EMAIL_SENDER_ADDRESS, EMAIL_SENDER_PASSWORD)
                smtp.sendmail(EMAIL_SENDER_ADDRESS, emailRecipient, emailObject.as_string())