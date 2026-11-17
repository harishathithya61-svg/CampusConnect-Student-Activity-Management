#!/usr/bin/env bash
set -o errexit

echo "=== [1/3] Building React Frontend Production Bundle ==="
cd frontend
npm install
npm run build
cd ..

echo "=== [2/3] Installing Python Backend Dependencies ==="
if command -v pip3 &> /dev/null; then
    pip3 install -r backend/requirements.txt
else
    pip install -r backend/requirements.txt
fi

echo "=== [3/3] Initializing Database & Seed Data ==="
if command -v python3 &> /dev/null; then
    python3 init_db.py
else
    python init_db.py
fi

echo "=== CampusConnect Build Succeeded ==="
