#!/usr/bin/env python
import cgi
import json
import httplib
import urllib

CLIENT_ID = '0d9075b879f4402d88d9dd17fef05d02'
CLIENT_SECRET = '' # SECRET HEHEHE
REDIRECT_URI = 'https://stanford.edu/~jeffjar/cgi-bin/authorize_instagram.py'
BASE_URL = "api.instagram.com"
ENDPOINT = '/oauth/access_token'

def get_access_token(code):
    payload = {'client_id'   : CLIENT_ID,
             'client_secret' : CLIENT_SECRET,
             'grant_type'    : 'authorization_code',
             'redirect_uri'  : REDIRECT_URI,
             'code'          : code}
    body = urllib.urlencode(payload)
    headers = {'Content-Type' : 'application/x-www-form-urlencoded'}

    c = httplib.HTTPSConnection(BASE_URL)
    c.request('POST', ENDPOINT, body, headers)
    response = c.getresponse()
    data = json.loads(response.read())
    return data['access_token']

http_header = "Content-type:text/html\r\n\r\n"
print http_header 

try:
    params = cgi.FieldStorage()
    code = params['code'].value
    access_token = get_access_token(code)
    print access_token
except:
    print 'Error in creating access token'
