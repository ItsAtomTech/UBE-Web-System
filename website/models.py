from . import db
from flask_login import UserMixin
from sqlalchemy.sql import func
from datetime import datetime
import pytz

def manila_time():
    return datetime.now(pytz.timezone("Asia/Manila"))


class Users(db.Model, UserMixin):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50))
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    status = db.Column(db.String(50))
    avatar = db.Column(db.String(50))
    type = db.Column(db.Integer, db.ForeignKey('user_type.type_id'))   
    misc = db.Column(db.String(1024))
    date = db.Column(db.DateTime(timezone=True), default=manila_time)
    
    def get_id(self):
        return str(self.user_id)  # Flask-Login will use user_id instead of default

class UserType(db.Model):
    type_id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))# e.g. instructor, dean, associate_dean



class StudentTable(db.Model):
    student_id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject_code.subject_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id')) # Entry Creator
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.user_id')) # Assigned Instructor
    student_name = db.Column(db.String(50))
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'))
    student_number = db.Column(db.Integer)
    progress = db.Column(db.String(100)) # possible values: currently_taking, completed, on_review
    status = db.Column(db.String(50)) # possible values: failed,passed,none 
    reason = db.Column(db.String(1000))
    remarks = db.Column(db.String(1000))
    sem_year = db.Column(db.Integer) # Current Year, like 2026 etc.
    semester = db.Column(db.Integer) # Semester like 1, 2 etc.
    date = db.Column(db.DateTime(timezone=True), default=manila_time)

class InstructorTable(db.Model):
    instructor_id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject_code.subject_id'))
    instructor_name = db.Column(db.String(100))

class SubjectCode(db.Model):
    subject_id = db.Column(db.Integer, primary_key=True)
    subject_name = db.Column(db.String(100))
    subject_code = db.Column(db.String(20))
    units = db.Column(db.Integer)




# =========================
# Other Essential Stuffs
# =========================

class College(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True)       # e.g., CAS, COE, CME
    name = db.Column(db.String(255))                   # Full name of the college
    date = db.Column(db.DateTime(timezone=True), default=manila_time)

    # Relationship
    departments = db.relationship('Department', backref='college', lazy=True)


class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    college_id = db.Column(db.Integer, db.ForeignKey('college.id'))
    name = db.Column(db.String(255))                   # e.g. Mathematics, Social Science, HM/TM
    date = db.Column(db.DateTime(timezone=True), default=manila_time)

