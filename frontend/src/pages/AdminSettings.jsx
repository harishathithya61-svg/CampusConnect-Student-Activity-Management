import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Sparkles, 
  Users, 
  Trash2, 
  KeyRound, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Server
} from 'lucide-react';
import { apiClient } from '../api/client';

export default function AdminSettings({ 
  onRefreshAll, 
  totalStudents, 
  isDemoActive, 
  onLoadReportDemo 
}) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [notification, setNotification] = useState(null);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleGenerateSample = async (count) => {
    setLoadingAction(`generate_${count}`);
    setNotification(null);
    try {
      const res = await apiClient.generateSampleStudents(count);
      setNotification({
        type: 'success',
        message: `${res.message || `Successfully generated ${count} sample student records.`}`
      });
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to generate sample data.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClearData = async (type) => {
    const confirmMsg = type === 'all' 
      ? "Are you sure you want to completely purge ALL student records from the database? This cannot be undone."
      : "Remove simulated sample student records?";

    if (window.confirm(confirmMsg)) {
      setLoadingAction(`clear_${type}`);
      setNotification(null);
      try {
        const res = await apiClient.clearDatabase(type);
        setNotification({ type: 'success', message: res.message || 'Database records cleared.' });
        if (onRefreshAll) onRefreshAll();
      } catch (err) {
        setNotification({ type: 'error', message: err.message || 'Failed to clear records.' });
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setNotification({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setNotification({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setPwdLoading(true);
    setNotification(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: apiClient.getHeaders(),
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed.');

      setNotification({ type: 'success', message: 'Admin password successfully updated.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">System Administration & Dataset Controls</h2>
            <p className="text-xs text-slate-500">
              Manage database capacity, scale generation (1,000+ students), benchmark simulations, and security.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between animate-in fade-in ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Section 1: Academic Report Benchmark & Scale Testing */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Dataset Generation & Benchmarks</h3>
            <p className="text-xs text-slate-500">Switch between exact academic report data and high-volume test cohorts</p>
          </div>
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            {totalStudents.toLocaleString()} Active Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Option 1: 50-Student Academic Report Benchmark */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>50-Student Academic Benchmark</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Loads the exact 50 students from the project report (|U|=50, |A|=22, |B|=18, |C|=16, |A∪B∪C|=38, None=12).
              </p>
            </div>
            <button
              onClick={onLoadReportDemo}
              disabled={loadingAction === 'demo'}
              className="mt-4 w-full py-2 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-2xs"
            >
              {loadingAction === 'demo' ? 'Loading...' : 'Load Report Benchmark (50)'}
            </button>
          </div>

          {/* Option 2: 100 Sample Students */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>100 Sample Students</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Generates 100 realistic student records across 5 engineering departments with balanced participation.
              </p>
            </div>
            <button
              onClick={() => handleGenerateSample(100)}
              disabled={loadingAction === 'generate_100'}
              className="mt-4 w-full py-2 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs"
            >
              {loadingAction === 'generate_100' ? 'Generating...' : 'Generate 100 Students'}
            </button>
          </div>

          {/* Option 3: 1,000+ Students High-Scale */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs mb-1">
                <Server className="w-4 h-4 text-purple-600" />
                <span>1,000+ Students Stress-Test</span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Simulates large-scale university deployment (&gt;1,000 records) verifying instant Set Theory computation.
              </p>
            </div>
            <button
              onClick={() => handleGenerateSample(1000)}
              disabled={loadingAction === 'generate_1000'}
              className="mt-4 w-full py-2 px-3 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-2xs"
            >
              {loadingAction === 'generate_1000' ? 'Generating 1,000...' : 'Generate 1,000 Students'}
            </button>
          </div>
        </div>

        {/* Database Purge Options */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Database Maintenance & Purge:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleClearData('sample_only')}
              disabled={loadingAction?.startsWith('clear')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Clear Sample Records Only
            </button>
            <button
              onClick={() => handleClearData('all')}
              disabled={loadingAction?.startsWith('clear')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Admin Password Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-blue-600" />
          <span>Security & Administrator Password</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password *</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 chars"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
          >
            {pwdLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Section 3: Academic Attribution Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <GraduationCap className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="font-bold text-sm">CampusConnect Project Attribution</h3>
            <p className="text-xs text-slate-400">Discrete Mathematics and Graph Theory (25BSMA10) Experiential Learning</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div>
            <span className="font-bold text-white block mb-1">Student Contributors:</span>
            <ul className="space-y-1 font-mono text-[11px]">
              <li>• Harish Athithya (25BTRCC024) — Model, Python, Analysis</li>
              <li>• Monika Jayapal (25BTRCC033) — Data source, Set definitions, Venn diagram</li>
              <li>• Kevin Luke (25BTRCC042) — Inclusion-exclusion, Calculations, Validation</li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-white block mb-1">Academic Mentorship:</span>
            <p className="text-[11px] leading-relaxed">
              <b>Mrs. Lakshmi C</b>, Assistant Professor<br/>
              Department of Mathematics<br/>
              Faculty of Engineering & Technology, <b>JAIN (Deemed-to-be University)</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
