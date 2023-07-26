from email.message import EmailMessage
import ssl
import smtplib

EMAIL_SENDER_ADDRESS = 'awe.noreplay.notification@gmail.com'
EMAIL_SENDER_PASSWORD = 'vjneblhmbwkqlxyb'

EMAIL_SENDER_PLATFORM = EMAIL_SENDER_ADDRESS.split('@',1)[1] # the platform that serves the email address e.g. gmail.com
EMAIL_SENDER_PLATFORM_PORT = 465

def sendOrderConfirmationOrderShippedAndOrderArrivedEmailOrOrderCancelledEmailIfBuyerCancelsOrderBeforeOrderHasShipped(
        newOrderId, productIdsAndQuantity, userId,conn):
    """
    This function sends an email using SSL (Secure Socket Layer)
    """
    with conn.cursor() as cur:
        emailBodyIntro = 'You have received an order for the following items\n\n'
        emailBodyOutro = '\nThis is an automated message. Please do not reply to this email.'
        emailBodyOrderInformation = ''
        for product in productIdsAndQuantity:
            productId = product['productId']
            quantity = product['quantity']
            queryForProductName = "SELECT productName FROM Product WHERE productId=%d" % productId
            cur.execute(queryForProductName)
            databaseResponse = cur.fetchall()
            productName = databaseResponse[0][0]
            emailBodyOrderInformation = emailBodyOrderInformation + f"{quantity} x {productName}\n\n"
       
        queryForSellerEmail = "SELECT email FROM User WHERE userId=%d" % userId
        cur.execute(queryForSellerEmail)
        databaseResponse = cur.fetchall()
        sellerEmail = databaseResponse[0][0]

        
    
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