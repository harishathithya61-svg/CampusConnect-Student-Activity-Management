"""
CampusConnect - Dataset Generator Script
Usage:
    python generate_data.py --count 100
    python generate_data.py --count 1000
    python generate_data.py --benchmark
"""
import argparse
from backend.app import create_app
from backend.models import Student
from backend.sample_data import load_report_50_students, generate_sample_dataset
from backend.math_engine import analyze_student_sets

def main():
    parser = argparse.ArgumentParser(description="CampusConnect Dataset Generator")
    parser.add_argument("--count", type=int, default=100, help="Number of realistic student records to generate (e.g. 100 or 1000)")
    parser.add_argument("--benchmark", action="store_true", help="Load the exact 50-student academic report demonstration dataset")
    parser.add_argument("--clear", action="store_true", help="Clear existing non-demo records before generating")
    args = parser.parse_args()

    app = create_app()
    with app.app_context():
        if args.benchmark:
            print("Loading 50-student academic report benchmark...")
            c = load_report_50_students()
            print(f"[OK] Benchmark loaded with {c} students.")
        else:
            print(f"Generating {args.count} realistic student records...")
            c = generate_sample_dataset(count=args.count, clear_existing_non_demo=args.clear)
            print(f"[OK] Generated {c} students.")

        total = Student.query.count()
        print(f"Total students in database: {total}")
        students = Student.query.all()
        res = analyze_student_sets(students)
        print("--- Mathematical Set Theory Verification ---")
        print(f"Universal Set |U| = {res['universal_set']['count']}")
        print(f"Technical |A| = {res['individual_sets']['set_a']['count']}")
        print(f"Sports |B| = {res['individual_sets']['set_b']['count']}")
        print(f"Cultural |C| = {res['individual_sets']['set_c']['count']}")
        print(f"Unique Union |A U B U C| = {res['union_and_complements']['union']['count']}")
        print(f"Non-Participants |None| = {res['union_and_complements']['none']['count']}")
        print(f"Principle of Inclusion-Exclusion Formula: {res['inclusion_exclusion_breakdown']['substituted']}")
        print(f"Verified: {res['union_and_complements']['union']['is_verified']}")

if __name__ == '__main__':
    main()
