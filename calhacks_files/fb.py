import requests

access_token = "" # FILL IN WITH ACCESS TOKEN

BASE_URL = "https://graph.facebook.com/v2.8/"

def like_cover_photo(user_id, access_token = access_token):
    r = requests.get(BASE_URL + str(user_id),
            params = {'fields'       : 'cover',
                      'access_token' : access_token})
    cover_id = r.json()['cover']['id']
    b = requests.post(BASE_URL + cover_id + "/likes",
            params = {'access_token' : access_token})
    if not b:
        raise Exception("User %d not a friend" % user_id)
    return b.json()['success']

# example usage
like_cover_photo(100005281996483)
