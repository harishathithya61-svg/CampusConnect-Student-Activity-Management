import os
import csv
import io
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import Flask, request, jsonify, send_file, Response, send_from_directory
from flask_cors import CORS
from sqlalchemy import or_, desc, asc

from .config import Config
from .models import db, Student, Activity, StudentActivity, AdminUser
from .math_engine import analyze_student_sets
from .sample_data import (
    seed_activities, seed_default_admin, 
    load_report_50_students, generate_sample_dataset
)
from .report_generator import generate_csv_report, generate_excel_report, generate_pdf_report

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for all routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize DB
    db.init_app(app)
    
    with app.app_context():
        # Ensure database folder exists
        os.makedirs(os.path.dirname(app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')), exist_ok=True)
        db.create_all()
        seed_activities()
        seed_default_admin()

    # JWT Authentication Helper
    def generate_token(admin):
        payload = {
            'sub': admin.id,
            'username': admin.username,
            'role': admin.role,
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }
        return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
            if not token:
                return jsonify({'error': 'Authentication token is missing'}), 401
            try:
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
                current_admin = AdminUser.query.get(data['sub'])
                if not current_admin:
                    return jsonify({'error': 'Invalid or expired session'}), 401
            except Exception as e:
                return jsonify({'error': 'Token verification failed', 'details': str(e)}), 401
            return f(current_admin, *args, **kwargs)
        return decorated

    # =========================================================================
    # HEALTH & SYSTEM ROUTES
    # =========================================================================
    @app.route('/api/system/health', methods=['GET'])
    def health_check():
        student_count = Student.query.count()
        activity_count = Activity.query.count()
        return jsonify({
            'status': 'healthy',
            'application': 'CampusConnect Backend API',
            'version': '1.0.0',
            'database': 'SQLite (PostgreSQL-ready)' if 'sqlite' in app.config['SQLALCHEMY_DATABASE_URI'] else 'PostgreSQL',
            'students_count': student_count,
            'activities_count': activity_count,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })

    # =========================================================================
    # AUTHENTICATION ROUTES
    # =========================================================================
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json() or {}
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        admin = AdminUser.query.filter_by(username=username).first()
        if not admin or not admin.check_password(password):
            return jsonify({'error': 'Invalid administrator credentials'}), 401

        token = generate_token(admin)
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': admin.to_dict()
        })

    @app.route('/api/auth/me', methods=['GET'])
    @token_required
    def get_current_user(current_admin):
        return jsonify({'user': current_admin.to_dict()})

    @app.route('/api/auth/change-password', methods=['POST'])
    @token_required
    def change_password(current_admin):
        data = request.get_json() or {}
        old_pwd = data.get('old_password', '')
        new_pwd = data.get('new_password', '')
        
        if not current_admin.check_password(old_pwd):
            return jsonify({'error': 'Current password does not match'}), 400
        if len(new_pwd) < 6:
            return jsonify({'error': 'New password must be at least 6 characters'}), 400

        current_admin.set_password(new_pwd)
        db.session.commit()
        return jsonify({'message': 'Password updated successfully'})

    # =========================================================================
    # STUDENT CRUD & SEARCH ROUTES
    # =========================================================================
    @app.route('/api/students', methods=['GET'])
    def list_students():
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 25, type=int)
        search = request.args.get('search', '').strip()
        department = request.args.get('department', '').strip()
        section = request.args.get('section', '').strip()
        activity_category = request.args.get('activity_category', '').strip()
        sort_by = request.args.get('sort_by', 'created_at')
        order = request.args.get('order', 'desc')

        query = Student.query

        if search:
            search_fmt = f"%{search}%"
            query = query.filter(
                or_(
                    Student.usn.ilike(search_fmt),
                    Student.full_name.ilike(search_fmt),
                    Student.email.ilike(search_fmt),
                    Student.phone.ilike(search_fmt)
                )
            )

        if department and department != 'All':
            query = query.filter(Student.department == department)

        if section and section != 'All':
            query = query.filter(Student.section == section)

        if activity_category:
            if activity_category == 'Technical':
                query = query.filter(Student.participates_technical.is_(True))
            elif activity_category == 'Sports':
                query = query.filter(Student.participates_sports.is_(True))
            elif activity_category == 'Cultural':
                query = query.filter(Student.participates_cultural.is_(True))
            elif activity_category == 'Multiple':
                # At least two categories
                query = query.filter(
                    (Student.participates_technical.cast(db.Integer) + 
                     Student.participates_sports.cast(db.Integer) + 
                     Student.participates_cultural.cast(db.Integer)) >= 2
                )
            elif activity_category == 'None':
                query = query.filter(
                    Student.participates_technical.is_(False),
                    Student.participates_sports.is_(False),
                    Student.participates_cultural.is_(False)
                )

        # Sorting
        sort_col = getattr(Student, sort_by, Student.created_at)
        query = query.order_by(desc(sort_col) if order == 'desc' else asc(sort_col))

        total = query.count()
        students_page = query.offset((page - 1) * limit).limit(limit).all()

        return jsonify({
            'students': [s.to_dict() for s in students_page],
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit if limit > 0 else 1
        })

    @app.route('/api/students', methods=['POST'])
    def create_student():
        data = request.get_json() or {}
        usn = data.get('usn', '').strip().upper()
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').strip().lower()
        department = data.get('department', '').strip()
        section = data.get('section', 'A').strip().upper()
        academic_year = data.get('academic_year', '2025-2026').strip()
        phone = data.get('phone', '').strip()
        branch = data.get('branch', department).strip()

        # Validation
        if not usn or not full_name or not email or not department:
            return jsonify({'error': 'USN, Full Name, Email, and Department are required fields.'}), 400

        # Duplicate USN check
        existing = Student.query.filter_by(usn=usn).first()
        if existing:
            return jsonify({'error': f"Duplicate Student Registration: USN '{usn}' is already registered for {existing.full_name}."}), 409

        p_tech = bool(data.get('participates_technical', False))
        p_sports = bool(data.get('participates_sports', False))
        p_cult = bool(data.get('participates_cultural', False))

        new_student = Student(
            usn=usn,
            full_name=full_name,
            email=email,
            phone=phone,
            department=department,
            branch=branch,
            section=section,
            academic_year=academic_year,
            participates_technical=p_tech,
            participates_sports=p_sports,
            participates_cultural=p_cult,
            is_demo=False
        )
        db.session.add(new_student)
        db.session.flush()

        # Link any selected activities
        activity_ids = data.get('activity_ids', [])
        for act_id in activity_ids:
            act = Activity.query.get(act_id)
            if act:
                db.session.add(StudentActivity(student_id=new_student.id, activity_id=act.id))
                if act.category == 'Technical': new_student.participates_technical = True
                elif act.category == 'Sports': new_student.participates_sports = True
                elif act.category == 'Cultural': new_student.participates_cultural = True

        db.session.commit()
        return jsonify({
            'message': f"Student {full_name} ({usn}) registered successfully.",
            'student': new_student.to_dict()
        }), 201

    @app.route('/api/students/<int:id>', methods=['GET'])
    def get_student(id):
        student = Student.query.get_or_404(id)
        return jsonify({'student': student.to_dict()})

    @app.route('/api/students/<int:id>', methods=['PUT'])
    def update_student(id):
        student = Student.query.get_or_404(id)
        data = request.get_json() or {}

        new_usn = data.get('usn', student.usn).strip().upper()
        if new_usn != student.usn:
            existing = Student.query.filter_by(usn=new_usn).first()
            if existing and existing.id != student.id:
                return jsonify({'error': f"USN '{new_usn}' is already registered to another student."}), 409
            student.usn = new_usn

        student.full_name = data.get('full_name', student.full_name).strip()
        student.email = data.get('email', student.email).strip().lower()
        student.phone = data.get('phone', student.phone)
        student.department = data.get('department', student.department).strip()
        student.branch = data.get('branch', student.branch)
        student.section = data.get('section', student.section).strip().upper()
        student.academic_year = data.get('academic_year', student.academic_year)
        
        if 'participates_technical' in data:
            student.participates_technical = bool(data['participates_technical'])
        if 'participates_sports' in data:
            student.participates_sports = bool(data['participates_sports'])
        if 'participates_cultural' in data:
            student.participates_cultural = bool(data['participates_cultural'])

        # Update specific activities if provided
        if 'activity_ids' in data:
            StudentActivity.query.filter_by(student_id=student.id).delete()
            for act_id in data['activity_ids']:
                act = Activity.query.get(act_id)
                if act:
                    db.session.add(StudentActivity(student_id=student.id, activity_id=act.id))
                    if act.category == 'Technical': student.participates_technical = True
                    elif act.category == 'Sports': student.participates_sports = True
                    elif act.category == 'Cultural': student.participates_cultural = True

        db.session.commit()
        return jsonify({
            'message': f"Student {student.full_name} updated successfully.",
            'student': student.to_dict()
        })

    @app.route('/api/students/<int:id>', methods=['DELETE'])
    def delete_student(id):
        student = Student.query.get_or_404(id)
        name = student.full_name
        usn = student.usn
        db.session.delete(student)
        db.session.commit()
        return jsonify({'message': f"Student {name} ({usn}) deleted successfully."})

    # Bulk CSV Import
    @app.route('/api/students/bulk-import', methods=['POST'])
    def bulk_import_students():
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request.'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file.'}), 400

        try:
            stream = io.StringIO(file.stream.read().decode("utf-8-sig"), newline=None)
            reader = csv.DictReader(stream)
            
            existing_usns = {s.usn for s in Student.query.with_entities(Student.usn).all()}
            imported = 0
            duplicates = 0
            errors = []

            for row_idx, row in enumerate(reader, start=2):
                # Clean keys
                cleaned_row = {k.strip().lower(): (v.strip() if v else '') for k, v in row.items() if k}
                usn = cleaned_row.get('usn', '').upper()
                name = cleaned_row.get('full name', '') or cleaned_row.get('name', '')
                email = cleaned_row.get('email', '') or cleaned_row.get('email address', '')
                dept = cleaned_row.get('department', 'Computer Science')
                sec = cleaned_row.get('section', 'A').upper()
                year = cleaned_row.get('academic year', '2025-2026') or cleaned_row.get('year', '2025-2026')
                phone = cleaned_row.get('phone', '') or cleaned_row.get('phone number', '')

                if not usn or not name:
                    errors.append(f"Row {row_idx}: Missing required USN or Name.")
                    continue

                if usn in existing_usns:
                    duplicates += 1
                    continue

                is_tech = cleaned_row.get('technical', 'no').lower() in ['yes', 'true', '1', 'y']
                is_sports = cleaned_row.get('sports', 'no').lower() in ['yes', 'true', '1', 'y']
                is_cultural = cleaned_row.get('cultural', 'no').lower() in ['yes', 'true', '1', 'y']

                new_s = Student(
                    usn=usn,
                    full_name=name,
                    email=email or f"{usn.lower()}@campusconnect.edu",
                    phone=phone,
                    department=dept,
                    branch=dept,
                    section=sec,
                    academic_year=year,
                    participates_technical=is_tech,
                    participates_sports=is_sports,
                    participates_cultural=is_cultural,
                    is_demo=False
                )
                db.session.add(new_s)
                existing_usns.add(usn)
                imported += 1

            db.session.commit()
            return jsonify({
                'message': f"Import complete: {imported} students successfully registered, {duplicates} duplicates skipped.",
                'imported_count': imported,
                'duplicates_skipped': duplicates,
                'errors': errors
            })
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f"Failed to process CSV file: {str(e)}"}), 500

    # =========================================================================
    # ACTIVITY MANAGEMENT ROUTES
    # =========================================================================
    @app.route('/api/activities', methods=['GET'])
    def list_activities():
        activities = Activity.query.all()
        return jsonify({'activities': [a.to_dict() for a in activities]})

    @app.route('/api/activities', methods=['POST'])
    def create_activity():
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        category = data.get('category', '').strip()
        description = data.get('description', '').strip()

        if not name or category not in ['Technical', 'Sports', 'Cultural']:
            return jsonify({'error': "Name and valid category ('Technical', 'Sports', 'Cultural') are required."}), 400

        if Activity.query.filter_by(name=name).first():
            return jsonify({'error': f"Activity '{name}' already exists."}), 409

        act = Activity(name=name, category=category, description=description)
        db.session.add(act)
        db.session.commit()
        return jsonify({'message': f"Activity '{name}' created.", 'activity': act.to_dict()}), 201

    @app.route('/api/activities/<int:id>', methods=['DELETE'])
    def delete_activity(id):
        act = Activity.query.get_or_404(id)
        name = act.name
        db.session.delete(act)
        db.session.commit()
        return jsonify({'message': f"Activity '{name}' deleted."})

    # =========================================================================
    # MATHEMATICAL SET THEORY & ANALYTICS ROUTES
    # =========================================================================
    @app.route('/api/analytics/mathematical-analysis', methods=['GET'])
    def get_mathematical_analysis():
        dept = request.args.get('department', '').strip()
        sec = request.args.get('section', '').strip()
        year = request.args.get('academic_year', '').strip()

        query = Student.query
        if dept and dept != 'All':
            query = query.filter(Student.department == dept)
        if sec and sec != 'All':
            query = query.filter(Student.section == sec)
        if year and year != 'All':
            query = query.filter(Student.academic_year == year)

        students = query.all()
        analysis = analyze_student_sets(students)
        return jsonify(analysis)

    @app.route('/api/analytics/dashboard-stats', methods=['GET'])
    def get_dashboard_stats():
        students = Student.query.all()
        analysis = analyze_student_sets(students)
        
        # Recent 8 registrations
        recent = Student.query.order_by(desc(Student.created_at)).limit(8).all()

        return jsonify({
            'total_students': analysis['universal_set']['count'],
            'technical_count': analysis['individual_sets']['set_a']['count'],
            'sports_count': analysis['individual_sets']['set_b']['count'],
            'cultural_count': analysis['individual_sets']['set_c']['count'],
            'unique_participants': analysis['union_and_complements']['union']['count'],
            'multiple_activities': analysis['participation_categories']['at_least_two']['count'],
            'not_participating': analysis['union_and_complements']['none']['count'],
            'percentages': {
                'technical': analysis['individual_sets']['set_a']['percentage'],
                'sports': analysis['individual_sets']['set_b']['percentage'],
                'cultural': analysis['individual_sets']['set_c']['percentage'],
                'unique': analysis['union_and_complements']['union']['percentage'],
                'none': analysis['union_and_complements']['none']['percentage'],
            },
            'pie_formula': analysis['inclusion_exclusion_breakdown']['formula'],
            'pie_substituted': analysis['inclusion_exclusion_breakdown']['substituted'],
            'recent_students': [s.to_dict() for s in recent]
        })

    @app.route('/api/analytics/department-breakdown', methods=['GET'])
    def get_department_breakdown():
        departments = db.session.query(Student.department).distinct().all()
        dept_list = [d[0] for d in departments if d[0]]
        
        breakdown = []
        for d in sorted(dept_list):
            students = Student.query.filter_by(department=d).all()
            analysis = analyze_student_sets(students)
            breakdown.append({
                'department': d,
                'total': analysis['universal_set']['count'],
                'technical': analysis['individual_sets']['set_a']['count'],
                'sports': analysis['individual_sets']['set_b']['count'],
                'cultural': analysis['individual_sets']['set_c']['count'],
                'unique': analysis['union_and_complements']['union']['count'],
                'none': analysis['union_and_complements']['none']['count']
            })

        return jsonify({'breakdown': breakdown})

    @app.route('/api/analytics/timeline', methods=['GET'])
    def get_registration_timeline():
        students = Student.query.order_by(asc(Student.created_at)).all()
        # Group by date YYYY-MM-DD
        counts_by_date = {}
        for s in students:
            if s.created_at:
                d_str = s.created_at.strftime('%Y-%m-%d')
                counts_by_date[d_str] = counts_by_date.get(d_str, 0) + 1

        timeline = []
        cumulative = 0
        for d in sorted(counts_by_date.keys()):
            cumulative += counts_by_date[d]
            timeline.append({
                'date': d,
                'registrations': counts_by_date[d],
                'cumulative': cumulative
            })

        return jsonify({'timeline': timeline})

    # =========================================================================
    # REPORT GENERATION & DOWNLOAD ROUTES
    # =========================================================================
    @app.route('/api/reports/download/<fmt>', methods=['GET'])
    def download_report(fmt):
        fmt = fmt.lower()
        report_type = request.args.get('type', 'complete').lower()
        dept = request.args.get('department', '').strip()
        sec = request.args.get('section', '').strip()

        query = Student.query
        if dept and dept != 'All':
            query = query.filter(Student.department == dept)
        if sec and sec != 'All':
            query = query.filter(Student.section == sec)

        # Activity specific filtering if report_type is technical/sports/cultural
        if report_type == 'technical':
            query = query.filter(Student.participates_technical.is_(True))
        elif report_type == 'sports':
            query = query.filter(Student.participates_sports.is_(True))
        elif report_type == 'cultural':
            query = query.filter(Student.participates_cultural.is_(True))
        elif report_type == 'overlap':
            query = query.filter(
                (Student.participates_technical.cast(db.Integer) + 
                 Student.participates_sports.cast(db.Integer) + 
                 Student.participates_cultural.cast(db.Integer)) >= 2
            )

        students = query.order_by(Student.usn).all()
        math_analysis = analyze_student_sets(students)
        timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')

        if fmt == 'pdf':
            pdf_bytes = generate_pdf_report(students, math_analysis, report_type)
            return Response(
                pdf_bytes,
                mimetype='application/pdf',
                headers={'Content-Disposition': f'attachment; filename=CampusConnect_{report_type}_{timestamp}.pdf'}
            )
        elif fmt in ['excel', 'xlsx']:
            excel_bytes = generate_excel_report(students, math_analysis, report_type)
            return Response(
                excel_bytes,
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                headers={'Content-Disposition': f'attachment; filename=CampusConnect_{report_type}_{timestamp}.xlsx'}
            )
        elif fmt == 'csv':
            csv_bytes = generate_csv_report(students, report_type)
            return Response(
                csv_bytes,
                mimetype='text/csv; charset=utf-8',
                headers={'Content-Disposition': f'attachment; filename=CampusConnect_{report_type}_{timestamp}.csv'}
            )
        else:
            return jsonify({'error': 'Invalid format. Use pdf, excel, or csv.'}), 400

    # =========================================================================
    # DEMO & SAMPLE DATA GENERATION ROUTES
    # =========================================================================
    @app.route('/api/demo/load-report-50', methods=['POST'])
    def load_academic_report_cohort():
        count = load_report_50_students()
        demo_students = Student.query.filter_by(is_demo=True).all()
        analysis = analyze_student_sets(demo_students)
        return jsonify({
            'message': "50-Student Academic Demonstration Cohort loaded successfully from report specification.",
            'count': count,
            'is_demo_badge': "Simulated Academic Demonstration Data",
            'benchmark_verification': {
                'universal_set': analysis['universal_set']['count'], # Expected: 50
                'technical': analysis['individual_sets']['set_a']['count'], # Expected: 22
                'sports': analysis['individual_sets']['set_b']['count'], # Expected: 18
                'cultural': analysis['individual_sets']['set_c']['count'], # Expected: 16
                'tech_sports': analysis['inclusive_intersections']['a_cap_b']['count'], # Expected: 8
                'tech_cultural': analysis['inclusive_intersections']['a_cap_c']['count'], # Expected: 7
                'sports_cultural': analysis['inclusive_intersections']['b_cap_c']['count'], # Expected: 6
                'all_three': analysis['inclusive_intersections']['a_cap_b_cap_c']['count'], # Expected: 3
                'unique_union': analysis['union_and_complements']['union']['count'], # Expected: 38
                'none': analysis['union_and_complements']['none']['count'] # Expected: 12
            }
        })

    @app.route('/api/demo/generate-sample', methods=['POST'])
    def generate_sample_students_endpoint():
        data = request.get_json() or {}
        count = int(data.get('count', 100))
        clear_non_demo = bool(data.get('clear_existing', False))
        
        # Limit to 2000 per request for safety
        count = min(max(count, 1), 2000)
        
        generated = generate_sample_dataset(count=count, clear_existing_non_demo=clear_non_demo)
        total_students = Student.query.count()
        return jsonify({
            'message': f"Successfully generated {generated} realistic student records.",
            'generated_count': generated,
            'total_students_in_database': total_students
        })

    @app.route('/api/demo/clear', methods=['POST'])
    def clear_database_records():
        data = request.get_json() or {}
        clear_type = data.get('type', 'all')
        
        if clear_type == 'demo_only':
            deleted = Student.query.filter_by(is_demo=True).delete()
        elif clear_type == 'sample_only':
            deleted = Student.query.filter_by(is_demo=False).delete()
        else:
            deleted = Student.query.delete()
            
        db.session.commit()
        return jsonify({
            'message': f"Cleared {deleted} student records from database.",
            'remaining_count': Student.query.count()
        })

    # =========================================================================
    # STATIC FRONTEND SERVING (For Unified Production Hosting)
    # =========================================================================
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api/'):
            return jsonify({'error': 'Endpoint not found'}), 404
        if path != "" and os.path.exists(os.path.join(dist_dir, path)):
            return send_from_directory(dist_dir, path)
        if os.path.exists(os.path.join(dist_dir, 'index.html')):
            return send_from_directory(dist_dir, 'index.html')
        return jsonify({
            'application': 'CampusConnect API Server',
            'status': 'online',
            'message': 'API is live. Access /api/system/health for health check.'
        })

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=True)
