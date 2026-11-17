// CampusConnect API Client
const BASE_URL = '/api';

export const apiClient = {
  // Auth Token handling
  getToken() {
    return localStorage.getItem('campusconnect_token');
  },
  setToken(token) {
    if (token) localStorage.setItem('campusconnect_token', token);
    else localStorage.removeItem('campusconnect_token');
  },
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  },

  // Auth endpoints
  async login(username, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token) this.setToken(data.token);
    return data;
  },

  async getCurrentUser() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Session invalid');
    return res.json();
  },

  logout() {
    this.setToken(null);
  },

  // System & Stats
  async getHealth() {
    const res = await fetch(`${BASE_URL}/system/health`);
    return res.json();
  },

  async getDashboardStats() {
    const res = await fetch(`${BASE_URL}/analytics/dashboard-stats`);
    if (!res.ok) throw new Error('Failed to load dashboard stats');
    return res.json();
  },

  async getMathematicalAnalysis(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/mathematical-analysis?${query}`);
    if (!res.ok) throw new Error('Failed to load mathematical analysis');
    return res.json();
  },

  async getDepartmentBreakdown() {
    const res = await fetch(`${BASE_URL}/analytics/department-breakdown`);
    return res.json();
  },

  async getTimeline() {
    const res = await fetch(`${BASE_URL}/analytics/timeline`);
    return res.json();
  },

  // Students
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/students?${query}`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async createStudent(studentData) {
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(studentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create student');
    return data;
  },

  async updateStudent(id, studentData) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(studentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update student');
    return data;
  },

  async deleteStudent(id) {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete student');
    return data;
  },

  async bulkImportStudents(formData) {
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/students/bulk-import`, {
      method: 'POST',
      headers,
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Import failed');
    return data;
  },

  // Activities
  async getActivities() {
    const res = await fetch(`${BASE_URL}/activities`);
    return res.json();
  },

  async createActivity(activityData) {
    const res = await fetch(`${BASE_URL}/activities`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(activityData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create activity');
    return data;
  },

  async deleteActivity(id) {
    const res = await fetch(`${BASE_URL}/activities/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.json();
  },

  // Demo Controls
  async loadReport50Cohort() {
    const res = await fetch(`${BASE_URL}/demo/load-report-50`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  },

  async generateSampleStudents(count = 100, clearExisting = false) {
    const res = await fetch(`${BASE_URL}/demo/generate-sample`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ count, clear_existing: clearExisting })
    });
    return res.json();
  },

  async clearDatabase(type = 'all') {
    const res = await fetch(`${BASE_URL}/demo/clear`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ type })
    });
    return res.json();
  },

  // Download URL builder
  getDownloadUrl(format, params = {}) {
    const query = new URLSearchParams(params).toString();
    return `${BASE_URL}/reports/download/${format}?${query}`;
  }
};
