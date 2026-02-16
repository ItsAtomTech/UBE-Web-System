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
    instructor_id = db.Column(db.Integer, db.ForeignKey('instructor_table.instructor_id'))
    student_name = db.Column(db.String(50))
    student_number = db.Column(db.Integer)
    progress = db.Column(db.String(100))
    status = db.Column(db.String(50))
    reason = db.Column(db.String(1000))
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




