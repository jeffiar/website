import requests
import random

BASE_URL = "https://api.instagram.com/v1/"
COMMENT_TO_COMMENT = 'this is sexy dude!!!'

class InstaAPIClient():
    def __init__(self, access_token):
        self.access_token = access_token

    def _user_url(self, user_id):
        return BASE_URL + "users/" + str(user_id) + '/'

    def _media_url(self, media_id):
        return BASE_URL + "media/" + str(media_id) + '/'

    def _do_get(self, url, **kwargs):
        kwargs['access_token'] = access_token
        print kwargs
        return requests.get(url, params = kwargs)

    def _do_post(self, url, **kwargs):
        kwargs['access_token'] = access_token
        print kwargs
        return requests.post(url, data = kwargs)

    def get_post_ids(self, user_id):
        #TODO: deal with pagination
        url = self._user_url(user_id) + "media/recent"
        r = self._do_get(url)
        posts = r.json()['data']
        return [post['id'] for post in posts]

    def follow_user(self, user_id):
        url = self._user_url(user_id) + "relationship"
        r = self._do_post(url, action='follow')
        return r['data']

    def like_post(self, post_id):
        url = self._media_url(post_id) + "likes"
        r = self._do_post(url)
        return r.json()['meta']['code'] == '200'

    def comment_post(self, post_id, text):
        url = self._media_url(post_id) + "comments"
        r = self._do_post(url, text=text)
        return r.json()['meta']['code'] == '200'

    def do_shit(self, user_id, n_shits = 2):
        post_ids = self.get_post_ids(user_id)
        for i in range(n_shits):
            post_id = random.choice(post_ids)
            self.like_post(post_id)
            self.comment_post(post_id, COMMENT_TO_COMMENT)

my_id = 1491035561
alice_id = 1388405694
nick_id = 3676302732
hung_id = 1548079463

if __name__=='__main__':
    blah = InstaAPIClient(access_token)
    blah.do_shit(hung_id)
