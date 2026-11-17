import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Cpu, 
  Trophy, 
  Palette,
  Info
} from 'lucide-react';
import { apiClient } from '../api/client';

const DEPARTMENTS = [
  'Cyber Security',
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering'
];

export default function StudentRegistration({ onSuccess, onNavigate }) {
  const [formData, setFormData] = useState({
    full_name: '',
    usn: '',
    department: 'Cyber Security',
    branch: 'Cyber Security',
    section: 'A',
    academic_year: '2025-2026',
    email: '',
    phone: '',
    participates_technical: false,
    participates_sports: false,
    participates_cultural: false,
    selected_activities: []
  });

  const [availableActivities, setAvailableActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Fetch available activities for optional specific event linking
    apiClient.getActivities()
      .then(res => setAvailableActivities(res.activities || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'department') {
      setFormData(prev => ({ ...prev, department: value, branch: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleReset = () => {
    setFormData({
      full_name: '',
      usn: '',
      department: 'Cyber Security',
      branch: 'Cyber Security',
      section: 'A',
      academic_year: '2025-2026',
      email: '',
      phone: '',
      participates_technical: false,
      participates_sports: false,
      participates_cultural: false,
      selected_activities: []
    });
    setError(null);
    setSuccess(null);
  };

  // Compute live Venn region prediction
  const getPredictedRegion = () => {
    const t = formData.participates_technical;
    const s = formData.participates_sports;
    const c = formData.participates_cultural;
    if (t && s && c) return { id: 'all_three', name: 'All Three Activities (A ∩ B ∩ C)', desc: 'Student participates in Technical, Sports and Cultural domains', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    if (t && s) return { id: 'ab_only', name: 'Technical & Sports Only ((A ∩ B) - C)', desc: 'Pairwise overlap between Technical and Sports', color: 'bg-sky-100 text-sky-800 border-sky-300' };
    if (t && c) return { id: 'ac_only', name: 'Technical & Cultural Only ((A ∩ C) - B)', desc: 'Pairwise overlap between Technical and Cultural', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    if (s && c) return { id: 'bc_only', name: 'Sports & Cultural Only ((B ∩ C) - A)', desc: 'Pairwise overlap between Sports and Cultural', color: 'bg-teal-100 text-teal-800 border-teal-300' };
    if (t) return { id: 'a_only', name: 'Technical Only (A - (B ∪ C))', desc: 'Single-domain participation in Technical activities', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (s) return { id: 'b_only', name: 'Sports Only (B - (A ∪ C))', desc: 'Single-domain participation in Sports activities', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (c) return { id: 'c_only', name: 'Cultural Only (C - (A ∪ B))', desc: 'Single-domain participation in Cultural activities', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    return { id: 'none', name: 'Outside All Sets (None)', desc: 'Student is not yet enrolled in any of the 3 activity categories', color: 'bg-slate-100 text-slate-700 border-slate-300' };
  };

  const predictedRegion = getPredictedRegion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Front-end validations
    if (!formData.usn.trim()) {
      setError('USN / Student ID is required.');
      return;
    }
    if (!formData.full_name.trim()) {
      setError('Student Full Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        usn: formData.usn.trim().toUpperCase(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      const res = await apiClient.createStudent(payload);
      setSuccess(res.message || 'Student successfully enrolled and permanently stored in database.');
      if (onSuccess) onSuccess();
      
      // Auto-clear USN, Name, Email, Phone so consecutive registrations are easy
      setFormData(prev => ({
        ...prev,
        full_name: '',
        usn: '',
        email: '',
        phone: ''
      }));
    } catch (err) {
      setError(err.message || 'Registration failed. Check network or server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student Enrollment & Activity Classification</h2>
            <p className="text-xs text-slate-500">
              Register students with permanent persistence in SQLite/PostgreSQL database and automatic Set Theory categorization.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold block">Registration Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">Registration Successful</span>
              <span>{success}</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('management')}
            className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 text-xs shadow-2xs"
          >
            View in Student Directory
          </button>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Section 1: Academic & Personal Info */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            1. Student Academic & Identification Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                USN / Student ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="usn"
                value={formData.usn}
                onChange={handleChange}
                placeholder="e.g. 25BTRCC024"
                required
                className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Unique identifier. Duplicate USNs are strictly blocked.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Harish Athithya"
                required
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="e.g. Cyber Security"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section <span className="text-rose-500">*</span></label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@jainuniversity.ac.in"
                  required
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98450 XXXXX"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Activity Categories Participation Selection */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>2. Activity Domain Participation (Sets A, B, C)</span>
            <span className="text-[11px] font-normal text-slate-500">Select one, two, or all three</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {/* Technical */}
            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.participates_technical
                ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className={`w-5 h-5 ${formData.participates_technical ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Set A: Technical</span>
                    <span className="text-[10px] text-slate-500">Hackathons, CTFs, Coding</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="participates_technical"
                  checked={formData.participates_technical}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
            </label>

            {/* Sports */}
            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.participates_sports
                ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className={`w-5 h-5 ${formData.participates_sports ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Set B: Sports</span>
                    <span className="text-[10px] text-slate-500">Cricket, Football, Athletics</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="participates_sports"
                  checked={formData.participates_sports}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </label>

            {/* Cultural */}
            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.participates_cultural
                ? 'bg-purple-50/80 border-purple-500 shadow-xs'
                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className={`w-5 h-5 ${formData.participates_cultural ? 'text-purple-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Set C: Cultural</span>
                    <span className="text-[10px] text-slate-500">Dance, Music, Drama, Lit</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="participates_cultural"
                  checked={formData.participates_cultural}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Live Mathematical Prediction Indicator */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Live Venn Partition Forecast:</span>
              <span className="text-xs font-bold text-slate-900">{predictedRegion.name}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">{predictedRegion.desc}</p>
            </div>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${predictedRegion.color}`}>
            {predictedRegion.id.toUpperCase()}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Registering...' : 'Register Student'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
