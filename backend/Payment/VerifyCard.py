import re

def verifyCard(number, name, expiryDate, securityCode):
    return (
        len(number) == 16 and
        len(expiryDate) == 4 and
        len(securityCode) == 3 and
        isOnlyLettersAndSpace(name) and
        isOnlyNumbers(number) and
        isOnlyNumbers(expiryDate) and
        checkExpiryDate(expiryDate) and
        isOnlyNumbers(securityCode)
    )
def checkExpiryDate(expiryDate):
    month = expiryDate[:2]
    year = expiryDate[2:]
    if int(year)>23:
        return True
    if int(month)>=4 and int(year)>=23:
        return True
    else:
        return False

def isOnlyNumbers(str):
    return re.match("^[0-9]+$", str)

def isOnlyLettersAndSpace(str):
    return re.match("^[A-Za-z\s]+$", str)


def isOnlyLettersAndSpace(str):
    return re.match("^[A-Za-z\s]+$", str)