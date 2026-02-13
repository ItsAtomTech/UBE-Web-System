import os, json

from flask import Blueprint, render_template, request, flash, jsonify, Flask, url_for, session, send_from_directory
from flask_login import login_required, current_user
from sqlalchemy import asc, desc, distinct, table, func
from werkzeug.utils import redirect


from . import db
from datetime import datetime,timedelta
from .global_vars import Post_Visibility, Sorting, Post_Status
from .models import Users

plt = ""  # empty this var when on live website
post_per_page = 100
sorting = Sorting.sorting

views = Blueprint('views', __name__)

app = Flask(__name__)


@views.route('/', methods=['GET', 'POST'])
def home():
    page = 'home'
    
    if not current_user.is_authenticated:
        return render_template("landing_page.html", user=current_user, page=page)
    
    if current_user.status != 'confirmed':
        flash(category="warning",message="Please Activate your Account Email")
    
    
    return render_template("home.html", user=current_user, page=page)




@views.route('/soon', methods=['GET', 'POST'])
def soon():
    page = 'under'

    return render_template("under.html", user=current_user, page=page)




# =======================
# User Section
# =======================







# =======================
# Forms Section
# =======================
@views.route('/status_editor', methods=['GET', 'POST'])
def user_new_editor():
    page = 'new_status_editor'

    return render_template("acads_form_editor.html", user=current_user, page=page)

# =======================
# Forms Section End
# =======================




# =======================
# Other Section Start
# =======================



@views.route('/set_theme', methods=['POST'])
def themes():
    theme = request.form.get("theme")

    if 'theme' not in session:
        session['theme'] = theme

    session['theme'] = theme

    return theme




@views.route('/emoticons/<path:path>')
def get_upl(path):
    workingdir = os.path.abspath(os.getcwd())
    print(workingdir)

    filepath = 'static' + '/emoticons'

    print(filepath)
    return send_from_directory(filepath, path)



def is_admin():
    if current_user.type == 'admin':
        return 1
    else:
        return 0
