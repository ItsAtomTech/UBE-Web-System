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
        return render_template("login.html", user=current_user, page=page)
    
    if current_user.status != 'confirmed':
        flash(category="warning",message="Please Activate your Account Email")
    
    
    return render_template("dashboard.html", user=current_user, page=page)

@views.route('/about', methods=['GET', 'POST'])
def about():
    page = 'about'

    return render_template("about.html", user=current_user, page=page)



@views.route('/preview', methods=['GET', 'POST'])
def prev_dash():
    page = 'preview'

    return render_template("dashboard.html", user=current_user, page=page)
    



@views.route('/soon', methods=['GET', 'POST'])
def soon():
    page = 'under'

    return render_template("under.html", user=current_user, page=page)
    





# =======================
# User Section
# =======================



@views.route('/user_table', methods=['GET', 'POST'])
@login_required
def user_tables():
    page = 'users'
    if current_user.status != 'confirmed':
        return redirect(url_for('user_control.show_profile'))

    return render_template("users_table.html", user=current_user, page=page)


@views.route('/new_user_editor', methods=['GET', 'POST'])
def user_new_editor():
    page = 'new_user'

    return render_template("user_editor.html", user=current_user, page=page)



@views.route('/update_user_editor', methods=['GET', 'POST'])
def user_update_editor():
    page = 'edit_user'

    return render_template("user_editor.html", user=current_user, page=page)




# =======================
# Forms Section
# =======================
@views.route('/status_editor', methods=['GET', 'POST'])
def status_new_editor():
    page = 'new_status_editor'

    return render_template("acads_form_editor.html", user=current_user, page=page)
    
    
    
@views.route('/add_student', methods=['GET', 'POST'])
@login_required
def add_student_editor():
    page = 'add_student'

    return render_template("add_student_form.html", user=current_user, page=page)
    
    
@views.route('/update_student_editor', methods=['GET', 'POST'])
@login_required
def update_student_editor():
    page = 'edit_student'

    return render_template("add_student_form.html", user=current_user, page=page)

# =======================
# Forms Section End
# =======================







# =======================
# Student Listing Section
# =======================
@views.route('/student_table', methods=['GET', 'POST'])
@login_required
def student_tables():
    page = 'onprob'
    if current_user.status != 'confirmed':
        return redirect(url_for('user_control.show_profile'))

    return render_template("student_table.html", user=current_user, page=page)




@views.route('/track_student_table', methods=['GET', 'POST'])
@login_required
def tracking_student():
    page = 'tracking'
    if current_user.status != 'confirmed':
        return redirect(url_for('user_control.show_profile'))

    return render_template("student_tracking_table.html", user=current_user, page=page)




@views.route('/review_student_table', methods=['GET', 'POST'])
@login_required
def review_student_table():
    page = 'tracking'
    if current_user.status != 'confirmed':
        return redirect(url_for('user_control.show_profile'))

    return render_template("student_review_table.html", user=current_user, page=page)



@views.route('/assess_student_table', methods=['GET', 'POST'])
@login_required
def assess_student_table():
    page = 'tracking'
    if current_user.status != 'confirmed':
        return redirect(url_for('user_control.show_profile'))

    return render_template("student_assessment_table.html", user=current_user, page=page)




# =======================
# Student Listing Section End
# =======================





# =======================
# Other Section Start
# =======================
@views.route('/subject_table', methods=['GET', 'POST'])
@login_required
def subject_table():
    page = 'subject_table'
    if current_user.status != 'confirmed':
        return redirect(url_for('user_control.show_profile'))

    return render_template("subject_table.html", user=current_user, page=page)





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
