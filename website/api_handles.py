import os, json, re
from operator import or_, and_
from typing import Union

from flask import Blueprint, render_template, request, flash, jsonify, Flask, url_for, session, current_app, send_from_directory, Response
from flask_login import login_required, current_user
from sqlalchemy import asc, desc, distinct, table, func, case, cast, Integer
from sqlalchemy.orm import aliased
from werkzeug.security import generate_password_hash, check_password_hash

import random, string, requests
import pytz
from werkzeug.utils import secure_filename

manila_tz = pytz.timezone("Asia/Manila")
from dotenv import load_dotenv

from . import db
from datetime import datetime, timedelta
from .models import Users


plt = ""  # empty this var when on live website
post_per_page = 1000

api_handles = Blueprint('api_handles', __name__)

app = Flask(__name__)

CONFIG_DATA = {}  # Stores Global Config Data
load_dotenv()


@api_handles.route('/dummy', methods=['GET', 'POST'])
def dum():
    return {"type": "success", "message": "Message test" } 
    page = 'home'
    




# ================================
# Some Section
# ================================


# ================================
# Some Section End
# ================================

