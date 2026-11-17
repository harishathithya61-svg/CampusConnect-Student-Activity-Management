"""
CampusConnect - Database Initialization Script
Initializes SQLite / PostgreSQL database tables, default admin, and default activity catalog.
"""
from backend.app import create_app
from backend.models import db, AdminUser, Activity, Student
from backend.sample_data import seed_activities, seed_default_admin, load_report_50_students

def init_database():
    app = create_app()
    with app.app_context():
        print("Initializing CampusConnect Database...")
        db.create_all()
        admin = seed_default_admin()
        print(f"[OK] Default Admin: {admin.username} (Password: admin123)")
        
        acts = seed_activities()
        print(f"[OK] Seeded {len(acts)} campus activities across Technical, Sports and Cultural domains.")
        
        # Load initial academic report 50-student demonstration benchmark
        count = load_report_50_students()
        print(f"[OK] Loaded {count}-student Academic Report Demonstration Benchmark.")
        print("[SUCCESS] Database initialization complete!")

if __name__ == '__main__':
    init_database()
