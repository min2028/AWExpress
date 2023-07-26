import re

def verifyContact(phoneNumber, emailAddress):
    return (
        (len(phoneNumber)==10 or len(phoneNumber)==11) and
        isAlphaNumeric(phoneNumber) and
        isValidEmailAddress(emailAddress)
    )

def isAlphaNumeric(str):
    return str.isalnum()

def isValidEmailAddress(str):
    regexForEmailValidation = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
    return re.match(regexForEmailValidation, str)

