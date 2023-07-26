import re

def verifyShipping(name, country, region, municipality, postalCode):
    return (
        isOnlyLettersAndSpace(name) and
        isOnlyLettersAndSpace(country) and
        isOnlyLettersAndSpace(region) and
        isOnlyLettersAndSpace(municipality) and
        checkPostalCode(postalCode)
    )

def isOnlyLettersAndSpace(str):
    return re.match("^[A-Za-z\s]+$", str)

def isAlphaNumeric(str):
    return str.isalnum()

def isAlphaNumericAndSpace(str):
    return re.match("^[A-Za-z0-9\s]+$", str)

def checkPostalCode(postalCode):
    if len(postalCode) !=7 and len(postalCode) !=6:
        return False
    if len(postalCode)==6:
        if not (postalCode[0].isalpha() and postalCode[2].isalpha() and postalCode[4].isalpha()):
            return False
        if not (postalCode[1].isdigit() and postalCode[3].isdigit() and postalCode[5].isdigit()):
            return False
        else:
            return True
    if len(postalCode)==7:
        if not (postalCode[0].isalpha() and postalCode[2].isalpha() and postalCode[5].isalpha() and postalCode[3==' ']):
            return False
        if not (postalCode[1].isdigit() and postalCode[4].isdigit() and postalCode[6].isdigit()):
            return False
        else:
            return True
    else:
        return True
    
def verifyBilling(name, country, region, municipality, postalCode):
    return (
        isOnlyLettersAndSpace(name) and
        isOnlyLettersAndSpace(country) and
        isOnlyLettersAndSpace(region) and
        isOnlyLettersAndSpace(municipality) and
        isAlphaNumericAndSpace(postalCode)
    )