import random
from datetime import datetime, timedelta, timezone
from .models import db, Student, Activity, StudentActivity, AdminUser

DEFAULT_ACTIVITIES = [
    # Technical
    {"name": "Hackathon 2026", "category": "Technical", "description": "24-hour rapid prototyping and AI hackathon"},
    {"name": "CodeSprint Contest", "category": "Technical", "description": "Algorithmic competitive programming contest"},
    {"name": "Robotics & IoT Expo", "category": "Technical", "description": "Autonomous hardware and sensor systems exhibition"},
    {"name": "CyberSecurity CTF", "category": "Technical", "description": "Capture-The-Flag defensive and offensive security challenge"},
    {"name": "Web3 & Cloud Summit", "category": "Technical", "description": "Decentralized applications and cloud computing workshop"},
    
    # Sports
    {"name": "Inter-Department Cricket Cup", "category": "Sports", "description": "Annual 20-over cricket championship"},
    {"name": "Campus Football League", "category": "Sports", "description": "11-a-side inter-college football tournament"},
    {"name": "Badminton Masters", "category": "Sports", "description": "Singles and doubles indoor badminton championship"},
    {"name": "Basketball Premier League", "category": "Sports", "description": "5-on-5 varsity basketball tournament"},
    {"name": "Annual Athletics Meet", "category": "Sports", "description": "Track, sprint, and field athletics events"},
    
    # Cultural
    {"name": "Rhythm Dance Fest", "category": "Cultural", "description": "Classical, contemporary, and street dance fest"},
    {"name": "Symphony Music Night", "category": "Cultural", "description": "Vocal, instrumental, and acoustic music showcase"},
    {"name": "Campus Theatre & Drama", "category": "Cultural", "description": "Theatrical stage drama and street play enactments"},
    {"name": "Fine Arts & Painting Gala", "category": "Cultural", "description": "Live sketch, oil painting, and digital art showcase"},
    {"name": "Literary & Debate Conclave", "category": "Cultural", "description": "Parliamentary debate, poetry slam, and extempore"}
]

FIRST_NAMES = [
    "Harish", "Monika", "Kevin", "Aarav", "Ananya", "Rohan", "Priya", "Vikram",
    "Sneha", "Aditya", "Neha", "Rahul", "Kavya", "Arjun", "Divya", "Siddharth",
    "Pooja", "Varun", "Ishaan", "Riya", "Gaurav", "Meera", "Abhishek", "Tanvi",
    "Karthik", "Swati", "Nikhil", "Shreya", "Akash", "Deepika", "Manish", "Bhavya",
    "Tarun", "Rashmi", "Vishal", "Shruti", "Pranav", "Anjali", "Suresh", "Lakshmi"
]

LAST_NAMES = [
    "Athithya", "Jayapal", "Luke", "Sharma", "Nair", "Patil", "Rao", "Iyer",
    "Verma", "Krishnan", "Reddy", "Gupta", "Menon", "Bhat", "Deshmukh", "Kulkarni",
    "Shetty", "Chopra", "Joshi", "Das", "Singh", "Murthy", "Pillai", "Hegde"
]

DEPARTMENTS = [
    {"name": "Cyber Security", "code": "CC"},
    {"name": "Computer Science & Engineering", "code": "CS"},
    {"name": "Artificial Intelligence & Data Science", "code": "AI"},
    {"name": "Information Science & Engineering", "code": "IS"},
    {"name": "Electronics & Communication", "code": "EC"}
]

def seed_activities():
    """Ensure standard default activities exist in the database."""
    created = 0
    for act_data in DEFAULT_ACTIVITIES:
        existing = Activity.query.filter_by(name=act_data['name']).first()
        if not existing:
            act = Activity(
                name=act_data['name'],
                category=act_data['category'],
                description=act_data['description']
            )
            db.session.add(act)
            created += 1
    if created > 0:
        db.session.commit()
    return Activity.query.all()


def seed_default_admin():
    """Ensure default admin account exists."""
    admin = AdminUser.query.filter_by(username='admin').first()
    if not admin:
        admin = AdminUser(
            username='admin',
            full_name='System Administrator',
            email='admin@campusconnect.edu',
            role='superadmin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
    return admin


def load_report_50_students():
    """
    Loads the exact 50 students specified in the academic project report:
    U = 50, S01 to S50.
    A only: 10 (S01-S10)
    B only: 7 (S11-S17)
    C only: 6 (S18-S23)
    A & B only: 5 (S24-S28)
    A & C only: 4 (S29-S32)
    B & C only: 3 (S33-S35)
    A, B & C: 3 (S36-S38)
    None: 12 (S39-S50)
    """
    seed_activities()
    tech_act = Activity.query.filter_by(category='Technical').first()
    sports_act = Activity.query.filter_by(category='Sports').first()
    cultural_act = Activity.query.filter_by(category='Cultural').first()

    # Clear existing demo students or previous 50 cohort
    demo_students = Student.query.filter_by(is_demo=True).all()
    for s in demo_students:
        db.session.delete(s)
    db.session.commit()

    # Predefined distribution from report page 6
    allocations = [
        # (range_start, range_end, tech, sports, cultural, desc)
        (1, 10, True, False, False, "Technical Only"),
        (11, 17, False, True, False, "Sports Only"),
        (18, 23, False, False, True, "Cultural Only"),
        (24, 28, True, True, False, "Technical and Sports Only"),
        (29, 32, True, False, True, "Technical and Cultural Only"),
        (33, 35, False, True, True, "Sports and Cultural Only"),
        (36, 38, True, True, True, "Technical, Sports and Cultural (All Three)"),
        (39, 50, False, False, False, "None of A, B or C")
    ]

    base_time = datetime.now(timezone.utc) - timedelta(days=30)
    students_created = []

    for start_idx, end_idx, t, sp, c, group_name in allocations:
        for idx in range(start_idx, end_idx + 1):
            usn = f"25BTRCC-S{idx:02d}"
            
            # Map report authors to exact USNs if matching
            if idx == 24:
                full_name = "Harish Athithya"
            elif idx == 33:
                full_name = "Monika Jayapal"
            elif idx == 42:
                full_name = "Kevin Luke"
            else:
                full_name = f"Student S{idx:02d} ({group_name})"

            student = Student(
                usn=usn,
                full_name=full_name,
                email=f"s{idx:02d}.demo@campusconnect.edu",
                phone=f"+91 98450 {10000 + idx}",
                department="Cyber Security",
                branch="Cyber Security",
                section="A" if idx <= 25 else "B",
                academic_year="2025-2026",
                participates_technical=t,
                participates_sports=sp,
                participates_cultural=c,
                is_demo=True,
                created_at=base_time + timedelta(hours=idx * 4)
            )
            db.session.add(student)
            students_created.append((student, t, sp, c))

    db.session.commit()

    # Add specific activity mappings
    for student, t, sp, c in students_created:
        if t and tech_act:
            db.session.add(StudentActivity(student_id=student.id, activity_id=tech_act.id))
        if sp and sports_act:
            db.session.add(StudentActivity(student_id=student.id, activity_id=sports_act.id))
        if c and cultural_act:
            db.session.add(StudentActivity(student_id=student.id, activity_id=cultural_act.id))

    db.session.commit()
    return len(students_created)


def generate_sample_dataset(count=100, clear_existing_non_demo=False):
    """
    Generates realistic student records for scalability testing (100 to 1,000+ students).
    """
    seed_activities()
    tech_activities = Activity.query.filter_by(category='Technical').all()
    sports_activities = Activity.query.filter_by(category='Sports').all()
    cultural_activities = Activity.query.filter_by(category='Cultural').all()

    if clear_existing_non_demo:
        Student.query.filter_by(is_demo=False).delete()
        db.session.commit()

    existing_usns = {s.usn for s in Student.query.with_entities(Student.usn).all()}
    
    current_count = len(existing_usns)
    now = datetime.now(timezone.utc)
    
    new_students = []
    student_activities = []
    
    for i in range(1, count + 1):
        dept_info = random.choice(DEPARTMENTS)
        dept_name = dept_info['name']
        dept_code = dept_info['code']
        
        serial_no = current_count + i
        usn = f"25BTR{dept_code}{serial_no:03d}"
        
        while usn in existing_usns:
            serial_no += 1
            usn = f"25BTR{dept_code}{serial_no:03d}"
        existing_usns.add(usn)
        
        fname = random.choice(FIRST_NAMES)
        lname = random.choice(LAST_NAMES)
        full_name = f"{fname} {lname}"
        email = f"{fname.lower()}.{lname.lower()}{serial_no}@jainuniversity.ac.in"
        phone = f"+91 {random.randint(7000000000, 9999999999)}"
        section = random.choice(["A", "B", "C", "D"])
        
        # Realistic participation probability
        # ~45% Tech, ~35% Sports, ~30% Cultural, ~20% None
        p_roll = random.random()
        if p_roll < 0.18:
            # None
            t, sp, c = False, False, False
        elif p_roll < 0.40:
            # Only Technical
            t, sp, c = True, False, False
        elif p_roll < 0.55:
            # Only Sports
            t, sp, c = False, True, False
        elif p_roll < 0.68:
            # Only Cultural
            t, sp, c = False, False, True
        elif p_roll < 0.80:
            # Tech & Sports
            t, sp, c = True, True, False
        elif p_roll < 0.89:
            # Tech & Cultural
            t, sp, c = True, False, True
        elif p_roll < 0.95:
            # Sports & Cultural
            t, sp, c = False, True, True
        else:
            # All Three
            t, sp, c = True, True, True

        reg_date = now - timedelta(days=random.randint(1, 90), hours=random.randint(1, 23))
        
        student = Student(
            usn=usn,
            full_name=full_name,
            email=email,
            phone=phone,
            department=dept_name,
            branch=dept_name,
            section=section,
            academic_year="2025-2026",
            participates_technical=t,
            participates_sports=sp,
            participates_cultural=c,
            is_demo=False,
            created_at=reg_date
        )
        new_students.append(student)

    # Bulk insert students
    db.session.bulk_save_objects(new_students)
    db.session.commit()

    # Query back inserted students to associate specific activities
    inserted_students = Student.query.filter(Student.usn.in_([s.usn for s in new_students])).all()
    
    for s in inserted_students:
        if s.participates_technical and tech_activities:
            act = random.choice(tech_activities)
            student_activities.append(StudentActivity(student_id=s.id, activity_id=act.id))
        if s.participates_sports and sports_activities:
            act = random.choice(sports_activities)
            student_activities.append(StudentActivity(student_id=s.id, activity_id=act.id))
        if s.participates_cultural and cultural_activities:
            act = random.choice(cultural_activities)
            student_activities.append(StudentActivity(student_id=s.id, activity_id=act.id))

    if student_activities:
        db.session.bulk_save_objects(student_activities)
        db.session.commit()

    return len(new_students)
