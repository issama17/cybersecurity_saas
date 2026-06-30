from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    points = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)
    
    submissions = db.relationship('Submission', backref='user', lazy='dynamic')
    notes = db.relationship('StudyNote', backref='author', lazy='dynamic')

class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    category = db.Column(db.String(64), nullable=False) # e.g. "Web", "Cryptography", "OSINT"
    description = db.Column(db.Text, nullable=False)
    points = db.Column(db.Integer, nullable=False)
    difficulty = db.Column(db.String(32), nullable=False) # e.g. "Easy", "Medium", "Hard"
    flag = db.Column(db.String(128), nullable=False)
    hint = db.Column(db.Text)
    vulnerable_code = db.Column(db.Text)
    secure_code = db.Column(db.Text)
    
    submissions = db.relationship('Submission', backref='challenge', lazy='dynamic')

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenge.id'), nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_correct = db.Column(db.Boolean, nullable=False)
    submitted_flag = db.Column(db.String(128), nullable=False)

class StudyNote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(128), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
