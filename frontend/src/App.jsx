import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StudentRegistration from './pages/StudentRegistration';
import StudentManagement from './pages/StudentManagement';
import ActivityManagement from './pages/ActivityManagement';
import ParticipationAnalysis from './pages/ParticipationAnalysis';
import GraphicalReports from './pages/GraphicalReports';
import DownloadReports from './pages/DownloadReports';
import AdminSettings from './pages/AdminSettings';
import Login from './pages/Login';
import { apiClient } from './api/client';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  // Core Data States
  const [stats, setStats] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [selectedVennRegion, setSelectedVennRegion] = useState(null);

  // Check auth session on startup
  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      apiClient.getCurrentUser()
        .then(res => {
          setCurrentUser(res.user);
        })
        .catch(() => {
          apiClient.logout();
          setCurrentUser(null);
        })
        .finally(() => setAuthChecked(true));
    } else {
      // For immediate ease of use in demo / local inspection, if no token, allow bypass or prompt
      // We can default to logged-in admin or allow fast login
      setAuthChecked(true);
    }
  }, []);

  const refreshCoreData = useCallback(async () => {
    try {
      const [statsData, mathData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getMathematicalAnalysis()
      ]);
      setStats(statsData);
      setAnalysis(mathData);
      setStudentCount(statsData.total_students || 0);

      // Check if current data is 50-student demo cohort
      if (statsData.total_students === 50 && statsData.technical_count === 22 && statsData.sports_count === 18) {
        setIsDemoActive(true);
      } else {
        setIsDemoActive(false);
      }
    } catch (err) {
      console.error('Error fetching core dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshCoreData();
    }
  }, [currentUser, refreshCoreData]);

  const handleLoadReportDemo = async () => {
    try {
      const res = await apiClient.loadReport50Cohort();
      await refreshCoreData();
      alert(`Loaded 50-student academic report demonstration dataset.\nUnique union |A ∪ B ∪ C| = 38 students, None = 12 students.`);
    } catch (err) {
      alert(`Failed to load report benchmark: ${err.message}`);
    }
  };

  const handleSelectVennRegion = (region) => {
    setSelectedVennRegion(region);
    setActivePage('analysis');
  };

  const handleLogout = () => {
    apiClient.logout();
    setCurrentUser(null);
  };

  // If not logged in, show Login screen
  if (authChecked && !currentUser) {
    return <Login onLoginSuccess={(user) => { setCurrentUser(user); }} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      {/* Fixed Left Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        studentCount={studentCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activePage={activePage}
          studentCount={studentCount}
          currentUser={currentUser}
          onLogout={handleLogout}
          onLoadReportDemo={handleLoadReportDemo}
          isDemoActive={isDemoActive}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activePage === 'dashboard' && (
              <Dashboard
                stats={stats}
                analysis={analysis}
                onNavigate={setActivePage}
                onSelectVennRegion={handleSelectVennRegion}
                onLoadReportDemo={handleLoadReportDemo}
              />
            )}

            {activePage === 'registration' && (
              <StudentRegistration
                onSuccess={refreshCoreData}
                onNavigate={setActivePage}
              />
            )}

            {activePage === 'management' && (
              <StudentManagement
                onNavigate={setActivePage}
              />
            )}

            {activePage === 'activities' && (
              <ActivityManagement />
            )}

            {activePage === 'analysis' && (
              <ParticipationAnalysis
                analysis={analysis}
                onRefresh={refreshCoreData}
                selectedRegion={selectedVennRegion}
                setSelectedRegion={setSelectedVennRegion}
              />
            )}

            {activePage === 'graphs' && (
              <GraphicalReports
                analysis={analysis}
                onRefresh={refreshCoreData}
                onSelectVennRegion={handleSelectVennRegion}
              />
            )}

            {activePage === 'reports' && (
              <DownloadReports
                analysis={analysis}
                totalStudents={studentCount}
              />
            )}

            {activePage === 'settings' && (
              <AdminSettings
                onRefreshAll={refreshCoreData}
                totalStudents={studentCount}
                isDemoActive={isDemoActive}
                onLoadReportDemo={handleLoadReportDemo}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
