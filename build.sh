#!/usr/bin/env bash
# Exit on error
set -o errexit

# 1. Build frontend React static bundle
cd frontend
npm install
npm run build
cd ..

# 2. Install Python backend requirements
pip install -r backend/requirements.txt

# 3. Initialize database
python init_db.py
