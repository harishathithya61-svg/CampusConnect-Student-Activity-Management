from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(128), default='System Administrator')
    email = db.Column(db.String(128), default='admin@campusconnect.edu')
    role = db.Column(db.String(32), default='admin')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Activity(db.Model):
    __tablename__ = 'activities'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False, unique=True)
    category = db.Column(db.String(32), nullable=False, index=True)  # 'Technical', 'Sports', 'Cultural'
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    registrations = db.relationship('StudentActivity', back_populates='activity', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'participant_count': len(self.registrations),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    usn = db.Column(db.String(64), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(128), nullable=False, index=True)
    email = db.Column(db.String(128), nullable=False)
    phone = db.Column(db.String(32), nullable=True)
    department = db.Column(db.String(128), nullable=False, index=True)
    branch = db.Column(db.String(128), nullable=True)
    section = db.Column(db.String(16), nullable=False, default='A')
    academic_year = db.Column(db.String(32), nullable=False, default='2025-2026')
    
    # Category level participation flags
    participates_technical = db.Column(db.Boolean, default=False, nullable=False)
    participates_sports = db.Column(db.Boolean, default=False, nullable=False)
    participates_cultural = db.Column(db.Boolean, default=False, nullable=False)
    
    is_demo = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    activity_registrations = db.relationship('StudentActivity', back_populates='student', cascade='all, delete-orphan')

    @property
    def activity_count(self):
        count = 0
        if self.participates_technical: count += 1
        if self.participates_sports: count += 1
        if self.participates_cultural: count += 1
        return count

    @property
    def participation_region(self):
        t = self.participates_technical
        s = self.participates_sports
        c = self.participates_cultural
        if t and s and c:
            return 'all_three'
        elif t and s:
            return 'tech_sports_only'
        elif t and c:
            return 'tech_cultural_only'
        elif s and c:
            return 'sports_cultural_only'
        elif t:
            return 'technical_only'
        elif s:
            return 'sports_only'
        elif c:
            return 'cultural_only'
        else:
            return 'none'

    def sync_categories_from_activities(self):
        """Sync boolean flags if specific activity registrations exist."""
        cats = {reg.activity.category for reg in self.activity_registrations if reg.activity}
        if 'Technical' in cats:
            self.participates_technical = True
        if 'Sports' in cats:
            self.participates_sports = True
        if 'Cultural' in cats:
            self.participates_cultural = True

    def to_dict(self):
        categories = []
        if self.participates_technical: categories.append('Technical')
        if self.participates_sports: categories.append('Sports')
        if self.participates_cultural: categories.append('Cultural')
        
        return {
            'id': self.id,
            'usn': self.usn,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone or '',
            'department': self.department,
            'branch': self.branch or self.department,
            'section': self.section,
            'academic_year': self.academic_year,
            'participates_technical': self.participates_technical,
            'participates_sports': self.participates_sports,
            'participates_cultural': self.participates_cultural,
            'activity_categories': categories,
            'activity_count': self.activity_count,
            'participation_region': self.participation_region,
            'is_demo': self.is_demo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'activities': [reg.activity.name for reg in self.activity_registrations if reg.activity]
        }


class StudentActivity(db.Model):
    __tablename__ = 'student_activities'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activities.id', ondelete='CASCADE'), nullable=False)
    registered_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    student = db.relationship('Student', back_populates='activity_registrations')
    activity = db.relationship('Activity', back_populates='registrations')
    
    __table_args__ = (
        db.UniqueConstraint('student_id', 'activity_id', name='uq_student_activity'),
    )
