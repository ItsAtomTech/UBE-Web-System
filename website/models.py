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
    avatar = db.Column(db.String(50))
    type = db.Column(db.String(50))   # e.g. student, teacher, admin
    status = db.Column(db.String(50))
    misc = db.Column(db.String(1024))
    date = db.Column(db.DateTime(timezone=True), default=manila_time)
    
    def get_id(self):
        return str(self.user_id)  # Flask-Login will use user_id instead of default

class Student_Table(db.Model):
    student_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    student_number = db.Column(db.String(50))
    current_section = db.Column(db.String(50))
    year_level = db.Column(db.String(50))
    program = db.Column(db.String(50))
    date = db.Column(db.DateTime(timezone=True), default=manila_time)

class Status_Record(db.Model):
    record_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_table.student_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    status_id = db.Column(db.Integer, db.ForeignKey('academic_status.status_id'))
    reason = db.Column(db.String(100))
    date = db.Column(db.DateTime(timezone=True), default=manila_time)

class Academic_Status(db.Model):
    status_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_table.student_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    academic_status = db.Column(db.String(50))
    date = db.Column(db.DateTime(timezone=True), default=manila_time)




