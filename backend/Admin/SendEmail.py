import json
import sys
import os
import logging
import rds_config as rds_config
import pymysql as pymysql
from email.message import EmailMessage
import ssl
import smtplib
#rds settings
rds_host  = "marketplacedb.c4h5s89ot7ec.us-east-1.rds.amazonaws.com"
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

EMAIL_SENDER_ADDRESS = 'awe.noreplay.notification@gmail.com'
EMAIL_SENDER_PASSWORD = 'vjneblhmbwkqlxyb'

EMAIL_SENDER_PLATFORM = EMAIL_SENDER_ADDRESS.split('@',1)[1] # the platform that serves the email address e.g. gmail.com
EMAIL_SENDER_PLATFORM_PORT = 465

# logger = logging.getLogger()
# logger.setLevel(logging.INFO)
# try:
#     conn = pymysql.connect(host=rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
# except pymysql.MySQLError as e:
#     logger.error("ERROR: Unexpected error: Could not connect to MySQL instance.")
#     logger.error(e)
#     sys.exit()

# logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")
# print("connect successful")
def sendEmail(email):
    """
    This function sends an email using SSL (Secure Socket Layer)
    """

    emailRecipient = email['recipient']
    emailSubject = email['subject']
    emailBody = email['body']

    emailObject = EmailMessage()
    emailObject['From'] = EMAIL_SENDER_ADDRESS
    emailObject['To'] = emailRecipient
    emailObject['Subject'] = emailSubject
    emailObject.set_content(emailBody)

    secureSocket = ssl._create_unverified_context()

    with smtplib.SMTP_SSL('smtp.'+EMAIL_SENDER_PLATFORM, EMAIL_SENDER_PLATFORM_PORT, context=secureSocket) as smtp:
        smtp.login(EMAIL_SENDER_ADDRESS, EMAIL_SENDER_PASSWORD)
        smtp.sendmail(EMAIL_SENDER_ADDRESS, emailRecipient, emailObject.as_string())
    
    resObj = {}
    resObj['statusCode'] = 200
    resObj['headers']={}
    resObj['headers']['Content-Type'] = 'application/json'
    resObj['body'] = {}
    
    return resObj

# test_event = {
#     'recipient':'shellyysq@gmail.com',
#     'body':"Test",
#     'subject':"Test"
# }
# print(sendEmail(test_event))