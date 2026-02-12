from functools import wraps

from flask import url_for, request
from flask_login import login_user, login_required, logout_user, current_user
from flask_login.config import EXEMPT_METHODS
from werkzeug.utils import redirect



class Loopback:
    loop_back = "sample_text"


class Post_Visibility:
    visibility = [['published', 'Published'], ['private', 'Private']]


class Post_Status:
    status = [['available', 'Available'], ['unavailable', 'Unavailable']]


class Sorting:
    sorting = []


class Avatars:
    avatars = [
        ['user', 'user.png'],
        ['user_1', 'user_1.png'],
        ['user_2', 'user_2.png'],
        ['user_3', 'user_3.png'],
        ['user_4', 'user_4.png'],
        ['user_5', 'user_5.png'],
        ['user_6', 'user_6.png'],
        ['user_7', 'user_7.png'],
        ['user_8', 'user_8.png'],
        ['user_9', 'user_9.png'],
        ['user_10', 'user_10.png']

    ]


