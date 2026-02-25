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
from .models import Users, StudentTable, SubjectCode


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
# Users Section
# ================================
@api_handles.route('/user_list', methods=['POST', 'GET'])
def list_users():
    try:
        current_page = int(request.form.get("page") or 1)
    except ValueError:
        current_page = 1

    token = request.form.get("token") or 0
    per_page = 40
    query = Users.query

    # Require login or valid token

    # Filters
    filters_raw = request.form.get("filters")
    if filters_raw:
        try:
            filters = json.loads(filters_raw)

            if 'status' in filters and filters['status']:
                query = query.filter(Users.status == filters['status'])

            if 'level' in filters and str(filters['level']).isdigit():
                query = query.filter(Users.level == int(filters['level']))

            if 'type' in filters and filters['type']:
                query = query.filter(Users.type == filters['type'])

        except json.JSONDecodeError:
            pass

    # Search (name/email)
    search = request.form.get("search")
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                Users.username.ilike(search_term),
                Users.email.ilike(search_term),
                Users.type.ilike(search_term),
                Users.user_id.ilike(search_term),
                Users.status.ilike(search_term)
            )
        )

    # Sorting
    sortby = request.form.get("sort") or None
    order = request.form.get("order_by", "asc").lower() or None

    if sortby and hasattr(Users, sortby):
        sort_column = getattr(Users, sortby)
        if order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(Users.user_id.asc())

    # Pagination
    pagination = query.paginate(page=current_page, per_page=per_page, error_out=False)
    users = pagination.items
    total_pages = pagination.pages
    total_results = pagination.total

    user_list = []
    for u in users:
        user_list.append({
            'user_id': u.user_id,
            'username': getattr(u, 'username', None),
            'email': u.email,
            'type': u.type,
            'status': getattr(u, 'status', None),
            'level': getattr(u, 'level', None),
            'date': u.date.isoformat() if u.date else None
        })

    return {
        "type": "success",
        "users": user_list,
        "pagination_data": {
            "current_page": current_page,
            "total_pages": total_pages,
            "total_results": total_results
        }
    }


@api_handles.route('/save_user', methods=['POST'])
@login_required
def save_user():
    if not is_admin(True):
        return jsonify({"type": "error", "message": "No permission to perform this action"})

    try:
        user_data = request.form.get("user_data")

        if not user_data:
            return {"type": "error", "message": "Missing user data"}

        data = json.loads(user_data)

        # Check required fields
        if not data.get("username") or not data.get("email") or not data.get("password"):
            return {"type": "error", "message": "Missing required fields"}

        if data.get("password") != data.get("repassword"):
            return {"type": "error", "message": "Passwords do not match"}

        # Optional: check if email already exists
        existing_user = Users.query.filter_by(email=data.get("email")).first()
        if existing_user:
            return {"type": "error", "message": "Email already exists"}

        new_user = Users(
            username=data.get("username"),
            email=data.get("email"),
            type=data.get("type", "student"),
            password=generate_password_hash(data.get("password"), method="sha256"),
            status="pending",
            avatar="user",
            level="",
            date=func.now()
        )

        db.session.add(new_user)
        db.session.commit()

        return {"type": "success", "message": "User saved successfully!"}

    except Exception as e:
        return {"type": "error", "message": str(e)}



@api_handles.route('/remove_user', methods=['POST'])
@login_required
def remove_user():
    # --- Ensure only admins can perform this action ---
    if not is_admin():
        return jsonify({"type": "error", "message": "No permission to perform this action"})

    try:
        user_id = request.form.get("user_id")

        if not user_id:
            return {"type": "error", "message": "Missing user_id"}

        user = Users.query.get(int(user_id))
        if not user:
            return {"type": "error", "message": "User not found"}

        # --- Prevent deleting self ---
        if user.user_id == current_user.user_id:
            return {"type": "error", "message": "You cannot remove your own account"}

        # --- Prevent deleting admin accounts ---
        if user.type and user.type.lower() == "admin":
            return {"type": "error", "message": "You cannot delete another admin account"}

        db.session.delete(user)
        db.session.commit()

        return {"type": "success", "message": f"User '{user.username}' removed successfully!"}

    except Exception as e:
        db.session.rollback()
        return {"type": "error", "message": str(e)}




@api_handles.route('/get_user_by_id', methods=['POST'])
@login_required
def get_user_by_id():

    try:
        user_id = request.form.get("user_id")

        if not user_id:
            return {"type": "error", "message": "Missing user_id"}

        user = Users.query.get(int(user_id))
        if not user:
            return {"type": "error", "message": "User not found"}

        user_data = {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "type": user.type,
            "status": user.status,
            "avatar": user.avatar,
            "misc": user.misc,
            "date": user.date.strftime("%Y-%m-%d %H:%M:%S") if user.date else None
        }

        return {"type": "success", "user": user_data}

    except Exception as e:
        return {"type": "error", "message": str(e)}



@api_handles.route('/save_user_update', methods=['POST'])
@login_required
def save_user_update():
    if not is_admin():
        return jsonify({"type": "error", "message": "No permission to perform this action"})

    try:
        user_data = request.form.get("user_data")

        if not user_data:
            return {"type": "error", "message": "Missing user data"}

        data = json.loads(user_data)

        user_id = request.form.get("user_id")
        if not user_id:
            return {"type": "error", "message": "Missing user_id"}

        user = Users.query.get(int(user_id))
        if not user:
            return {"type": "error", "message": "User not found"}

        if user.user_id == current_user.user_id:
            return {"type": "error", "message": "You cannot modify your own account in here"}

        # Update fields
        if data.get("username"):
            user.username = data["username"]

        if data.get("type"):
            user.type = data["type"]

        if data.get("email") and data["email"] != user.email:
            # If email changes, also set status to "pending"
            user.email = data["email"]
            user.status = "pending"

        db.session.commit()

        return {"type": "success", "message": "User updated successfully!"}

    except Exception as e:
        return {"type": "error", "message": str(e)}



@api_handles.route("/update_my_email", methods=["POST"])
@login_required
def update_my_email():
    new_email = request.form.get("email")

    if not new_email:
        return jsonify({"type": "error", "message": "Email is required."})

    # Only allow updates if user status is pending
    if current_user.status.lower() != "pending":
        return jsonify({
            "type": "error",
            "message": "Email updates are only allowed while your account status is 'pending'."
        })
    
    if current_user.email == new_email:
        return jsonify({
            "type": "error",
            "message": "The Email is the same as your current"
        })
    
    # Check if the new email is already used by another user
    existing_user = Users.query.filter_by(email=new_email).first()
    if existing_user:
        return jsonify({"type": "error", "message": "This email is already in use."})

    # Proceed with email update
    current_user.email = new_email
    db.session.commit()


    return jsonify({
        "type": "success",
        "message": f"Your email has been successfully updated to '{new_email}'."
    })


# ================================
# Users Section End
# ================================



# ================================
#  User Forms API
# ================================

@api_handles.route('/get_instructors', methods=['POST','GET'])
@login_required
def get_instructors():
    try:
        instructors = Users.query.filter_by(type=1).all()

        if not instructors:
            return {"type": "error", "message": "No instructors found"}

        instructor_list = []

        for user in instructors:
            instructor_list.append({
                "user_id": user.user_id,
                "instructor_name": user.username
            })

        return {"type": "success", "instructors": instructor_list}

    except Exception as e:
        return {"type": "error", "message": str(e)}





# add adding a student to prob. list
@api_handles.route('/save_student', methods=['POST'])
@login_required
def save_student():
    try:
        student_data = request.form.get("student_data")

        if not student_data:
            return {"type": "error", "message": "Missing student_data"}

        data = json.loads(student_data)

        student_name = data.get("student_name")
        student_number = data.get("student_number")
        subject_id = data.get("subject_id")
        instructor_id = data.get("instructor_id")

        if not all([student_name, student_number, subject_id, instructor_id]):
            return {"type": "error", "message": "Incomplete student data"}

        new_student = StudentTable(
            student_name=student_name,
            student_number=student_number,
            subject_id=subject_id,
            instructor_id=instructor_id,
            user_id=current_user.user_id,  # Entry creator
            progress="on_probation",
            status=""
        )

        db.session.add(new_student)
        db.session.commit()

        return {"type": "success", "message": "Student saved successfully"}

    except Exception as e:
        db.session.rollback()
        return {"type": "error", "message": str(e)}




@api_handles.route('/get_student_by_id', methods=['POST'])
@login_required
def get_student_by_id():

    try:
        student_id = request.form.get("student_id")

        if not student_id:
            return {"type": "error", "message": "Missing student_id"}

        student = StudentTable.query.get(int(student_id))
        if not student:
            return {"type": "error", "message": "Student not found"}

        student_data = {
            "student_id": student.student_id,
            "subject_id": student.subject_id,
            "user_id": student.user_id,
            "instructor_id": student.instructor_id,
            "student_name": student.student_name,
            "student_number": student.student_number,
            "progress": student.progress,
            "status": student.status,
            "reason": student.reason,
            "date": student.date.strftime("%Y-%m-%d %H:%M:%S") if student.date else None
        }

        return {"type": "success", "student": student_data}

    except Exception as e:
        return {"type": "error", "message": str(e)}



@api_handles.route('/get_student_info_all', methods=['POST'])
@login_required
def get_student_info_all():
    try:
        student_id = request.form.get("student_id")

        if not student_id:
            return {"type": "error", "message": "Missing student_id"}

        result = db.session.query(
            StudentTable,
            Users.username.label("instructor_name")
        ).join(
            Users, StudentTable.instructor_id == Users.user_id
        ).filter(
            StudentTable.student_id == int(student_id)
        ).first()

        if not result:
            return {"type": "error", "message": "Student not found"}

        student, instructor_name = result

        student_data = {
            "student_id": student.student_id,
            "subject_id": student.subject_id,
            "user_id": student.user_id,
            "instructor_id": student.instructor_id,
            "instructor_name": instructor_name,
            "student_name": student.student_name,
            "student_number": student.student_number,
            "progress": student.progress,
            "status": student.status,
            "reason": student.reason,
            "date": student.date.strftime("%Y-%m-%d %H:%M:%S") if student.date else None
        }

        return {"type": "success", "student": student_data}

    except Exception as e:
        return {"type": "error", "message": str(e)}



@api_handles.route('/save_student_update', methods=['POST'])
@login_required
def save_student_update():

    try:
        student_data = request.form.get("student_data")
        if not student_data:
            return {"type": "error", "message": "Missing student data"}

        data = json.loads(student_data)

        student_id = request.form.get("student_id")
        if not student_id:
            return {"type": "error", "message": "Missing student_id"}

        student = StudentTable.query.get(int(student_id))
        if not student:
            return {"type": "error", "message": "Student not found"}

        # Check ownership
        if student.user_id != current_user.user_id:
            return {"type": "error", "message": "You do not have permission to modify this record"}

        # Only allow update if status is 'none'
        if student.status != "" :
            return {"type": "error", "message": "This student record can no longer be modified"}

        # Update allowed fields
        if data.get("student_number") is not None:
            student.student_number = data["student_number"]

        if data.get("student_name"):
            student.student_name = data["student_name"]

        if data.get("instructor_id"):
            student.instructor_id = data["instructor_id"]

        if data.get("subject_id"):
            student.subject_id = data["subject_id"]

        db.session.commit()

        return {"type": "success", "message": "Student updated successfully!"}

    except Exception as e:
        return {"type": "error", "message": str(e)}


@api_handles.route('/remove_student_record', methods=['POST'])
@login_required
def remove_student_record():

    try:
        student_id = request.form.get("student_id")
        if not student_id:
            return {"type": "error", "message": "Missing student_id"}

        student = StudentTable.query.get(int(student_id))
        if not student:
            return {"type": "error", "message": "Student not found"}

        # Check ownership
        if student.user_id != current_user.user_id:
            return {"type": "error", "message": "You do not have permission to remove this record"}

        # Allow removal only if status is empty or None
        if student.status not in (None, ""):
            return {"type": "error", "message": "This student record cannot be removed"}

        db.session.delete(student)
        db.session.commit()

        return {"type": "success", "message": "Student record removed successfully!"}

    except Exception as e:
        return {"type": "error", "message": str(e)}


# ================================
# User Forms API End
# ================================



# ================================
# Student List and Tables 
# ================================
@api_handles.route('/student_list', methods=['POST', 'GET'])
@login_required
def list_students():
    try:
        current_page = int(request.form.get("page") or 1)
    except ValueError:
        current_page = 1

    per_page = 40

    query = db.session.query(
        StudentTable,
        SubjectCode.subject_name,
        Users.username.label("instructor_name")
    ).join(
        SubjectCode, StudentTable.subject_id == SubjectCode.subject_id
    ).join(
        Users, StudentTable.instructor_id == Users.user_id
    )
    
    
    # Filters
    filters_raw = request.form.get("filters")
    if filters_raw:
        try:
            filters = json.loads(filters_raw)

            if 'subject_id' in filters and filters['subject_id']:
                query = query.filter(StudentTable.subject_id == filters['subject_id'])


        except json.JSONDecodeError:
            pass
    
    # Search
    search = request.form.get("search")
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                StudentTable.student_name.ilike(search_term),
                SubjectCode.subject_name.ilike(search_term),
                Users.username.ilike(search_term),
                StudentTable.status.ilike(search_term)
            )
        )

    # Sorting
    sortby = request.form.get("sort")
    order = request.form.get("order_by", "asc").lower()

    sortable_columns = {
        "student_name": StudentTable.student_name,
        "student_number": StudentTable.student_number,
        "subject_name": SubjectCode.subject_name,
        "instructor_name": Users.username,
        "status": StudentTable.status,
        "date": StudentTable.date
    }

    if sortby in sortable_columns:
        sort_column = sortable_columns[sortby]
        if order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(StudentTable.student_id.asc())

    # Pagination
    pagination = query.paginate(page=current_page, per_page=per_page, error_out=False)

    results = pagination.items
    total_pages = pagination.pages
    total_results = pagination.total

    student_list = []

    for student, subject_name, instructor_name in results:
        student_list.append({
            "student_id": student.student_id,
            "student_name": student.student_name,
            "student_number": student.student_number,
            "subject_id": student.subject_id,
            "subject_name": subject_name,
            "instructor_id": student.instructor_id,
            "instructor_name": instructor_name,
            "progress": student.progress,
            "status": student.status,
            "reason": student.reason,
            "date": student.date.isoformat() if student.date else None
        })

    return {
        "type": "success",
        "students": student_list,
        "pagination_data": {
            "current_page": current_page,
            "total_pages": total_pages,
            "total_results": total_results
        }
    }




@api_handles.route('/tracking_list', methods=['POST', 'GET'])
@login_required
def tracking_list():
    try:
        current_page = int(request.form.get("page") or 1)
    except ValueError:
        current_page = 1

    per_page = 40

    query = db.session.query(
        StudentTable,
        SubjectCode.subject_name,
        Users.username.label("instructor_name")
    ).join(
        SubjectCode, StudentTable.subject_id == SubjectCode.subject_id
    ).join(
        Users, StudentTable.instructor_id == Users.user_id
    ).filter(
        StudentTable.instructor_id == current_user.user_id
    )
    
    
    # Filters
    filters_raw = request.form.get("filters")
    if filters_raw:
        try:
            filters = json.loads(filters_raw)

            if 'subject_id' in filters and filters['subject_id']:
                query = query.filter(StudentTable.subject_id == filters['subject_id'])


        except json.JSONDecodeError:
            pass
    
    # Search
    search = request.form.get("search")
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                StudentTable.student_name.ilike(search_term),
                SubjectCode.subject_name.ilike(search_term),
                Users.username.ilike(search_term),
                StudentTable.status.ilike(search_term)
            )
        )

    # Sorting
    sortby = request.form.get("sort")
    order = request.form.get("order_by", "asc").lower()

    sortable_columns = {
        "student_name": StudentTable.student_name,
        "student_number": StudentTable.student_number,
        "subject_name": SubjectCode.subject_name,
        "instructor_name": Users.username,
        "status": StudentTable.status,
        "date": StudentTable.date
    }

    if sortby in sortable_columns:
        sort_column = sortable_columns[sortby]
        if order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(StudentTable.student_id.asc())

    # Pagination
    pagination = query.paginate(page=current_page, per_page=per_page, error_out=False)

    results = pagination.items
    total_pages = pagination.pages
    total_results = pagination.total

    student_list = []

    for student, subject_name, instructor_name in results:
        student_list.append({
            "student_id": student.student_id,
            "student_name": student.student_name,
            "student_number": student.student_number,
            "subject_id": student.subject_id,
            "subject_name": subject_name,
            "instructor_id": student.instructor_id,
            "instructor_name": instructor_name,
            "progress": student.progress,
            "status": student.status,
            "reason": student.reason,
            "date": student.date.isoformat() if student.date else None
        })

    return {
        "type": "success",
        "students": student_list,
        "pagination_data": {
            "current_page": current_page,
            "total_pages": total_pages,
            "total_results": total_results
        }
    }



# Updating the Status of Student Entry

@api_handles.route('/update_student_status', methods=['POST'])
@login_required
def update_student_status():

    try:
        student_id = request.form.get("student_id")
        progress = request.form.get("progress")
        status = request.form.get("status")
        reason = request.form.get("reason")

        if not student_id:
            return {"type": "error", "message": "Missing student_id"}

        student = StudentTable.query.get(int(student_id))
        if not student:
            return {"type": "error", "message": "Student not found"}

        # Ownership check
        # if student.user_id != current_user.user_id:
        #     return {"type": "error", "message": "You do not have permission to update this record"}

        # Update fields if provided
        if progress is not None:
            student.progress = progress

        if status is not None:
            student.status = status

        if reason is not None:
            student.reason = reason

        db.session.commit()

        return {"type": "success", "message": "Student status updated successfully!"}

    except Exception as e:
        return {"type": "error", "message": str(e)}


# ================================
# Dashboard Statistics
# ================================
@api_handles.route('/dashboard_stats', methods=['GET', 'POST'])
@login_required
def get_dashboard_stats():
    try:
        # Get probation count (students with progress = 'on_probation')
        probation_count = StudentTable.query.filter_by(progress='on_probation').count()
        
        # Get tracking count (students assigned to current instructor with progress = 'currently_taking')
        tracking_count = StudentTable.query.filter(
            StudentTable.instructor_id == current_user.user_id,
            StudentTable.progress == 'currently_taking'
        ).count()
        
        # Get failed count (students with status = 'failed')
        failed_count = StudentTable.query.filter_by(status='failed').count()
        
        # Get passed count (students with status = 'passed')
        passed_count = StudentTable.query.filter_by(status='passed').count()
        
        # Get recent students on probation (last 5)
        recent_probation = db.session.query(
            StudentTable.student_name,
            StudentTable.student_number,
            SubjectCode.subject_name,
            StudentTable.date
        ).join(
            SubjectCode, StudentTable.subject_id == SubjectCode.subject_id
        ).filter(
            StudentTable.progress == 'on_probation'
        ).order_by(
            StudentTable.date.desc()
        ).limit(5).all()
        
        recent_probation_list = [
            {
                'student_name': r[0],
                'student_number': r[1],
                'subject_name': r[2],
                'date': r[3].isoformat() if r[3] else None
            }
            for r in recent_probation
        ]
        
        return {
            "type": "success",
            "stats": {
                "probation": probation_count,
                "tracking": tracking_count,
                "failed": failed_count,
                "passed": passed_count
            },
            "recent_probation": recent_probation_list
        }
        
    except Exception as e:
        return {"type": "error", "message": str(e)}

# ================================
# Student Table End
# ================================






# ================================
# Other Section
# ================================
def is_admin(silent=False):
    if current_user.type == 4 or current_user.type == '4':
        return 1
    else:
        return 0

# ================================
# Other Section End
# ================================



# ================================
# Some Section
# ================================


# ================================
# Some Section End
# ================================

