import json
import boto3
import base64
import random
import string
import logging

ACCESS_KEY = 'AKIAVSGRR4FUP5NKERNH'
SECRET_KEY = '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'
BUCKET = "aws.image"
def lambda_handler(event, context):
    print(f"event is {event}")
    resObj = {}
    resbody = {}
    try:
        body = json.loads(event['body'])
        image_base64_string = body['image']
    except Exception as e:
        # The request body is invalid
        resObj['statusCode']=400
        resbody = 'Invalid request body'
        resObj['body'] = json.dumps(resbody)
        print(e)
        return resObj
    try:
        image_base64_string = image_base64_string.split('\'')[1]
    except:
        pass
    try:
        filename = body['filename']
    except:
        letters = string.ascii_lowercase
        result_str = ''.join(random.choice(letters) for i in range(5))
        filename = result_str+'.jpg'
    
    s3 = boto3.client('s3', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
    
    content = base64_decode(image_base64_string)
    print(type(content))
    uniqueName=False
    while uniqueName==False:
        checkFile = checkUniqueFileName(filename)
        if checkFile!=False:
            filename=checkFile
            uniqueName=True
        else:
            filename = filename.split('.')[0]+'(1)'+'.'+filename.split('.')[1]
    filename = '/tmp/'+filename
    with open(filename, 'wb') as f:
        f.write(content)
    try:
        s3.upload_file(filename, BUCKET,filename)
        print("Upload Successful")
        location = s3.get_bucket_location(Bucket=BUCKET)
        print(location)
        url = f'https://s3.amazonaws.com/{BUCKET}/{filename}'
    except FileNotFoundError:
        print("The file was not found")
    except Exception as e:
        print (e)
    return {
        'statusCode': 200,
        'body': json.dumps({'image_url':url})
    }
def checkUniqueFileName(filename):
    session = boto3.Session( aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
    s3 = session.resource('s3')
    my_bucket = s3.Bucket(BUCKET)
    for my_bucket_object in my_bucket.objects.all():
            if my_bucket_object.key==filename:
                return False

    return filename

def base64_decode(s):
    """Add missing padding to string and return the decoded base64 string."""
    log = logging.getLogger()
    s = str(s).strip()
    base64Result=None
    try:
        base64Result = base64.b64decode(s)
    except Exception as e:
        print(e)
        padding = len(s) % 4
        print(padding)
        if padding == 1:
            log.error("Invalid base64 string: {}".format(s))
            return ''
        elif padding == 2:
            s += b'=='
        elif padding == 3:
            s += b'='
        base64Result=base64.b64decode(s)
    print(type(base64Result))
    return base64Result
# my_string = ''
# with open("/Users/shelly/Desktop/AWS/keyboard.jpg", "rb") as img_file:
#     my_string = base64.b64encode(img_file.read())
# with open("/Users/shelly/Desktop/AWS/image.txt", "wb") as file:
#     file.write(my_string)

# print(my_string)
# req = {
#     'body': '{"image":"%s"}' % my_string
# }
# print(lambda_handler(req,""))