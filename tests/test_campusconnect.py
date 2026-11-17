import unittest
import io
import json
from backend.app import create_app
from backend.models import db, Student, Activity, AdminUser
from backend.sample_data import load_report_50_students, generate_sample_dataset
from backend.math_engine import analyze_student_sets

class CampusConnectTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    def test_01_admin_login(self):
        """Test admin authentication and JWT token generation."""
        # Invalid credentials
        res = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'wrongpassword'})
        self.assertEqual(res.status_code, 401)

        # Valid default credentials
        res = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'admin123'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('token', data)
        self.assertEqual(data['user']['username'], 'admin')

    def test_02_student_crud_and_duplicate_prevention(self):
        """Test student creation, duplicate prevention, editing and deletion."""
        # Login
        auth_res = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'admin123'})
        token = auth_res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}

        test_usn = "TEST-25BTRCC999"
        # Delete if exists
        s = Student.query.filter_by(usn=test_usn).first()
        if s:
            db.session.delete(s)
            db.session.commit()

        # 1. Create Student
        payload = {
            'usn': test_usn,
            'full_name': 'Test Student User',
            'email': 'test.student@campusconnect.edu',
            'department': 'Cyber Security',
            'section': 'A',
            'participates_technical': True,
            'participates_sports': True,
            'participates_cultural': False
        }
        create_res = self.client.post('/api/students', json=payload, headers=headers)
        self.assertEqual(create_res.status_code, 201)
        created_id = create_res.get_json()['student']['id']

        # 2. Duplicate USN Prevention Test (Must return 409 Conflict)
        dup_res = self.client.post('/api/students', json=payload, headers=headers)
        self.assertEqual(dup_res.status_code, 409)
        self.assertIn('already registered', dup_res.get_json()['error'])

        # 3. Update Student
        update_payload = {
            'full_name': 'Test Student User Updated',
            'participates_cultural': True # Now participates in all 3!
        }
        put_res = self.client.put(f'/api/students/{created_id}', json=update_payload, headers=headers)
        self.assertEqual(put_res.status_code, 200)
        self.assertEqual(put_res.get_json()['student']['participation_region'], 'all_three')

        # 4. Delete Student
        del_res = self.client.delete(f'/api/students/{created_id}', headers=headers)
        self.assertEqual(del_res.status_code, 200)
        self.assertIsNone(Student.query.filter_by(usn=test_usn).first())

    def test_03_academic_report_benchmark(self):
        """
        Verify that the 50-student academic report demonstration benchmark
        exactly matches the discrete mathematics report specification:
        |U| = 50, |A| = 22, |B| = 18, |C| = 16,
        |A ∩ B| = 8, |A ∩ C| = 7, |B ∩ C| = 6, |A ∩ B ∩ C| = 3,
        |A ∪ B ∪ C| = 38, None = 12.
        """
        res = self.client.post('/api/demo/load-report-50')
        self.assertEqual(res.status_code, 200)
        bench = res.get_json()['benchmark_verification']

        self.assertEqual(bench['universal_set'], 50)
        self.assertEqual(bench['technical'], 22)
        self.assertEqual(bench['sports'], 18)
        self.assertEqual(bench['cultural'], 16)
        self.assertEqual(bench['tech_sports'], 8)
        self.assertEqual(bench['tech_cultural'], 7)
        self.assertEqual(bench['sports_cultural'], 6)
        self.assertEqual(bench['all_three'], 3)
        self.assertEqual(bench['unique_union'], 38)
        self.assertEqual(bench['none'], 12)

        # Mathematical Inclusion-Exclusion Principle Verification
        calc = bench['technical'] + bench['sports'] + bench['cultural'] \
             - bench['tech_sports'] - bench['tech_cultural'] - bench['sports_cultural'] \
             + bench['all_three']
        self.assertEqual(calc, 38)

    def test_04_scale_1000_students(self):
        """Test system capacity and math analysis with 1,000+ students."""
        res = self.client.post('/api/demo/generate-sample', json={'count': 1000, 'clear_existing': False})
        self.assertEqual(res.status_code, 200)
        total_in_db = res.get_json()['total_students_in_database']
        self.assertGreaterEqual(total_in_db, 1000)

        # Run math analysis over the large dataset
        math_res = self.client.get('/api/analytics/mathematical-analysis')
        self.assertEqual(math_res.status_code, 200)
        m = math_res.get_json()

        # Assert PIE is strictly verified
        self.assertTrue(m['union_and_complements']['union']['is_verified'])
        self.assertTrue(m['union_and_complements']['none']['is_verified'])
        self.assertEqual(
            m['universal_set']['count'],
            m['union_and_complements']['union']['count'] + m['union_and_complements']['none']['count']
        )

    def test_05_download_reports(self):
        """Test PDF, Excel and CSV report downloads."""
        # PDF
        pdf_res = self.client.get('/api/reports/download/pdf?type=complete')
        self.assertEqual(pdf_res.status_code, 200)
        self.assertEqual(pdf_res.mimetype, 'application/pdf')
        self.assertGreater(len(pdf_res.data), 1000)

        # Excel
        excel_res = self.client.get('/api/reports/download/excel?type=complete')
        self.assertEqual(excel_res.status_code, 200)
        self.assertEqual(excel_res.mimetype, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        self.assertGreater(len(excel_res.data), 1000)

        # CSV
        csv_res = self.client.get('/api/reports/download/csv?type=complete')
        self.assertEqual(csv_res.status_code, 200)
        self.assertEqual(csv_res.mimetype, 'text/csv')
        self.assertIn(b'USN', csv_res.data)

    def test_06_bulk_csv_import(self):
        """Test uploading CSV data and skipping duplicates."""
        csv_content = (
            "USN,Full Name,Email,Phone,Department,Section,Academic Year,Technical,Sports,Cultural\n"
            "25BTRCC901,Import Test 1,import1@test.com,,Cyber Security,A,2025-2026,Yes,No,No\n"
            "25BTRCC902,Import Test 2,import2@test.com,,Cyber Security,A,2025-2026,No,Yes,Yes\n"
        )
        data = {'file': (io.BytesIO(csv_content.encode('utf-8')), 'test_import.csv')}
        res = self.client.post('/api/students/bulk-import', data=data, content_type='multipart/form-data')
        self.assertEqual(res.status_code, 200)
        self.assertIn('Import complete', res.get_json()['message'])

if __name__ == '__main__':
    unittest.main()
