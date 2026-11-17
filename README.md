# CampusConnect – Student Activity Participation and Overlap Analysis System

> **Discrete Mathematics and Graph Theory (25BSMA10) Experiential Learning Project**  
> **Faculty of Engineering & Technology, School of Computer Science and Engineering**  
> **JAIN (Deemed-to-be University)**

[![Python Version](https://img.shields.io/badge/Python-3.14%2B-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-black.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Executive Summary

**CampusConnect** is an advanced, full-stack student activity management and analytical web application engineered to solve multi-club registration duplication using **Set Theory** and the **Principle of Inclusion-Exclusion (PIE)**.

When students participate across multiple campus domains—**Technical events**, **Sports tournaments**, and **Cultural programs**—naive summation of individual club registers inevitably double- and triple-counts active students. CampusConnect represents each participant cohort as a formal mathematical set, rigorously calculating disjoint partitions, inclusive intersections, and unique union cardinality ($|A \cup B \cup C|$) with real-time database-driven graphical representations and multi-format report exports.

---

## 📐 Mathematical Model & Set Theoretic Formulation

The analytical engine directly reflects the academic report specifications for discrete mathematics:

### Set Definitions
* **$U$ (Universal Set):** All registered students in the institution / cohort ($|U| = N$).
* **Set $A$:** Students participating in at least one **Technical** activity.
* **Set $B$:** Students participating in at least one **Sports** activity.
* **Set $C$:** Students participating in at least one **Cultural** activity.

### Inclusive Intersections
* $|A \cap B|$ = Students active in both Technical and Sports
* $|A \cap C|$ = Students active in both Technical and Cultural
* $|B \cap C|$ = Students active in both Sports and Cultural
* $|A \cap B \cap C|$ = Students participating in all three activity categories

### Principle of Inclusion-Exclusion (PIE)
To measure true unique campus involvement without duplicate counting:

$$\mathbf{|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|}$$

$$\mathbf{\text{Students in None} = |U| - |A \cup B \cup C|}$$

### Seven Mutually Exclusive (Disjoint) Venn Regions
1. **Technical Only:** $A - (B \cup C)$
2. **Sports Only:** $B - (A \cup C)$
3. **Cultural Only:** $C - (A \cup B)$
4. **Technical & Sports Only:** $(A \cap B) - C$
5. **Technical & Cultural Only:** $(A \cap C) - B$
6. **Sports & Cultural Only:** $(B \cap C) - A$
7. **All Three Domains:** $A \cap B \cap C$
8. **Exterior Non-Participants:** $U - (A \cup B \cup C)$

### Verification Identity
$$\sum_{k=1}^7 \text{Region}_k \equiv |A \cup B \cup C| \quad \text{and} \quad |A \cup B \cup C| + |\text{None}| \equiv |U|$$

---

## 🎯 Academic Report 50-Student Reference Benchmark

The system includes a pre-configured 1-click demonstration dataset replicating the exact numbers from the academic project report:

| Metric / Region | Notation | Benchmark Count | Cohort % |
| :--- | :---: | :---: | :---: |
| **Universal Set** | $|U|$ | **50** | 100.0% |
| **Technical Activities** | $|A|$ | **22** | 44.0% |
| **Sports Activities** | $|B|$ | **18** | 36.0% |
| **Cultural Activities** | $|C|$ | **16** | 32.0% |
| **Tech & Sports** | $|A \cap B|$ | **8** | 16.0% |
| **Tech & Cultural** | $|A \cap C|$ | **7** | 14.0% |
| **Sports & Cultural** | $|B \cap C|$ | **6** | 12.0% |
| **All Three Domains** | $|A \cap B \cap C|$ | **3** | 6.0% |
| **Unique Participants** | $\mathbf{\|A \cup B \cup C\|}$ | $\mathbf{38}$ | **76.0%** |
| **Non-Participants** | $\|None\|$ | **12** | 24.0% |

$$\text{PIE Validation: } 22 + 18 + 16 - 8 - 7 - 6 + 3 = 38 \quad (\text{Exact Match})$$

---

## 🚀 Key Features

* **High Scalability (1,000+ Students):** Optimized database queries and batch bulk processing support 1,000 to 50,000+ records seamlessly.
* **Student Registration System:** Real-time form validation, duplicate USN prevention (409 Conflict rejection), and instant live Venn region prediction forecast.
* **Student Management Table:** High-performance searchable, sortable, and filterable data table with custom pagination (10, 25, 50, 100 records).
* **Interactive 3-Set Venn Diagram:** High-resolution SVG rendering displaying all 7 disjoint internal partitions with hover percentages and student drill-down inspection.
* **7 Comprehensive Graphical Dashboards:**
  1. Interactive 3-Set Venn Diagram
  2. Participation Cardinality Comparison (Bar Chart)
  3. Disjoint Partition Distribution (Pie Chart)
  4. Engagement Ratio: Participating vs None (Doughnut Chart)
  5. Longitudinal Registration Trajectory (Line & Area Chart)
  6. Department-Wise Activity Breakdown (Grouped Bar Chart)
  7. Activity Commitment Partition: Exactly 1, Exactly 2, All 3 (Horizontal Bar Chart)
* **Downloadable Reporting System:**
  * **Formal PDF Report** generated via ReportLab with institutional headers, Set Theory formula breakdown, and tabular roster.
  * **Formatted Excel Spreadsheet (.xlsx)** via openpyxl with multiple styled sheets and formula headers.
  * **Raw CSV Datasets** for external analytics.
* **Bulk CSV Import & Export:** Drag-and-drop CSV upload with duplicate handling and sample template download.
* **Role-Based Security:** Admin JWT authentication, bcrypt password hashing, and protected endpoints.

---

## 🛠 Technology Stack

### Backend
* **Language:** Python 3.14+
* **Framework:** Flask 3.1 (REST API, CORS enabled)
* **Database & ORM:** SQLite (local development) / PostgreSQL ready via SQLAlchemy 2.0
* **Security & Auth:** PyJWT, Werkzeug Security (pbkdf2:sha256 password hashing)
* **Report Compilers:** ReportLab (PDF), openpyxl (Excel XLSX), standard csv

### Frontend
* **Core:** React 19, Vite 8
* **Styling & Theme:** Tailwind CSS v4 (Modern SaaS Dark Blue & Clean White palette)
* **Visualizations:** Recharts 3.11, Custom Interactive SVG Venn Engine
* **Icons:** Lucide React

---

## 📂 Project Directory Structure

```text
CampusConnect-Student-Activity-Management/
├── backend/
│   ├── __init__.py
│   ├── app.py                   # Flask Application, CORS, REST API routes
│   ├── config.py                # Environment & Database Configuration
│   ├── models.py                # SQLAlchemy Models (Student, Activity, AdminUser)
│   ├── math_engine.py           # Set Theory & Inclusion-Exclusion Engine
│   ├── report_generator.py      # PDF (ReportLab), Excel (openpyxl), CSV generator
│   ├── sample_data.py           # 50-Student Benchmark & 1,000+ Generator
│   ├── requirements.txt         # Python Package Requirements
│   ├── .env.example
│   └── database/
│       └── campusconnect.db     # SQLite Database
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              # Main App Controller & Router
│       ├── index.css            # Tailwind CSS configuration
│       ├── api/
│       │   └── client.js        # API Client & Token Management
│       ├── components/
│       │   ├── Sidebar.jsx      # Navigation Sidebar
│       │   ├── Navbar.jsx       # Header & Quick Actions
│       │   ├── VennDiagram.jsx  # Interactive SVG 3-Set Venn Diagram
│       │   ├── StatCard.jsx     # Reusable Metric Card
│       │   ├── MathExplainer.jsx# PIE Formula Breakdown
│       │   ├── StudentModal.jsx # Student Edit Modal
│       │   └── BulkImportModal.jsx # CSV Bulk Import Modal
│       └── pages/
│           ├── Dashboard.jsx            # Page 1: Home Dashboard
│           ├── StudentRegistration.jsx  # Page 2: Student Registration
│           ├── StudentManagement.jsx    # Page 3: Student Management Table
│           ├── ActivityManagement.jsx   # Page 4: Activity Catalog
│           ├── ParticipationAnalysis.jsx# Page 5: Set Theory Math Analysis
│           ├── GraphicalReports.jsx     # Page 6: 7 Dynamic Graphs
│           ├── DownloadReports.jsx      # Page 7: PDF / Excel / CSV Reports
│           ├── AdminSettings.jsx        # Page 8: Admin & Scale Controls
│           └── Login.jsx                # Admin Authentication Screen
├── tests/
│   └── test_campusconnect.py    # Automated Integration Test Suite
├── init_db.py                   # Database Initialization Script
├── generate_data.py             # CLI Sample Data Generator
├── run_backend.py               # Standalone Backend Server Runner
├── start-backend.bat            # Windows Backend Launcher
├── start-frontend.bat           # Windows Frontend Launcher
├── run_all.ps1                  # PowerShell Dual Launcher
├── .gitignore
└── README.md
```

---

## ⚡ Installation & Setup Instructions

### Prerequisites
* **Python 3.10+** (Tested on Python 3.14)
* **Node.js 18+** & **npm** (Tested on Node v24)
* **Git**

---

### Step 1: Clone or Navigate to Project Directory
```powershell
cd CampusConnect-Student-Activity-Management
```

---

### Step 2: Backend Setup & Database Initialization

Open a terminal in the project root:

```powershell
# 1. Create a Python Virtual Environment
python -m venv venv

# 2. Activate the Virtual Environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows Command Prompt:
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# 4. Initialize Database and seed standard activities + demo benchmark
python init_db.py
```

---

### Step 3: Frontend Setup

Open a second terminal:

```powershell
cd frontend

# Install Node dependencies
npm install

# Verify build
npm run build
```

---

### Step 4: Running in Visual Studio Code

#### Terminal 1 (Flask REST API Server):
```powershell
.\venv\Scripts\Activate.ps1
python run_backend.py
```
> Backend runs at: `http://127.0.0.1:5000`

#### Terminal 2 (Vite React Client):
```powershell
cd frontend
npm run dev
```
> Frontend runs at: `http://localhost:5173`

*(Alternatively, run `.\run_all.ps1` in PowerShell to launch both servers simultaneously with one command!)*

---

## 🔑 Default Administrator Credentials

| Field | Value |
| :--- | :--- |
| **Username** | `admin` |
| **Password** | `admin123` |

*(Can be customized via the Admin Settings page at any time)*

---

## 🧪 Running Automated Tests

Run the complete integration test suite:

```powershell
.\venv\Scripts\Activate.ps1
python -m unittest tests/test_campusconnect.py
```

### Verified Test Cases:
* `test_01_admin_login`: Admin authentication & JWT token generation.
* `test_02_student_crud_and_duplicate_prevention`: Student creation, 409 duplicate rejection, editing, and deletion.
* `test_03_academic_report_benchmark`: 50-student academic report benchmark accuracy ($|U|=50, |A \cup B \cup C|=38$).
* `test_04_scale_1000_students`: Scale test with 1,000+ student records and real-time Set Theory verification.
* `test_05_download_reports`: Validation of PDF, Excel (.xlsx), and CSV binary document exports.
* `test_06_bulk_csv_import`: CSV file upload and duplicate parsing.

---

## 🌐 Preparing for GitHub Public Repository

To push this repository to GitHub:

```bash
git init
git add .
git commit -m "Initial CampusConnect project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

---

## 👥 Academic Project Attribution

* **Course:** Discrete Mathematics and Graph Theory (`25BSMA10`)
* **Department:** School of Computer Science and Engineering (Cyber Security)
* **Institution:** JAIN (Deemed-to-be University)
* **Faculty Guide:** Mrs. Lakshmi C, Assistant Professor, Department of Mathematics
* **Authors:**
  * Harish Athithya (`25BTRCC024`) — Mathematical Model, Backend Architecture, Set Theory Engine
  * Monika Jayapal (`25BTRCC033`) — Data Specification, Venn Diagram Visualization
  * Kevin Luke (`25BTRCC042`) — Inclusion-Exclusion Formulation, Deduplication Validation

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
