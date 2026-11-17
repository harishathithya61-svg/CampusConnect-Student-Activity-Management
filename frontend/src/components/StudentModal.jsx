import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const DEPARTMENTS = [
  'Cyber Security',
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Science & Engineering',
  'Electronics & Communication'
];

export default function StudentModal({ student, isOpen, onClose, onSave }) {
  if (!isOpen || !student) return null;

  const [formData, setFormData] = useState({
    usn: student.usn || '',
    full_name: student.full_name || '',
    email: student.email || '',
    phone: student.phone || '',
    department: student.department || 'Cyber Security',
    branch: student.branch || 'Cyber Security',
    section: student.section || 'A',
    academic_year: student.academic_year || '2025-2026',
    participates_technical: !!student.participates_technical,
    participates_sports: !!student.participates_sports,
    participates_cultural: !!student.participates_cultural,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        usn: student.usn || '',
        full_name: student.full_name || '',
        email: student.email || '',
        phone: student.phone || '',
        department: student.department || 'Cyber Security',
        branch: student.branch || student.department || 'Cyber Security',
        section: student.section || 'A',
        academic_year: student.academic_year || '2025-2026',
        participates_technical: !!student.participates_technical,
        participates_sports: !!student.participates_sports,
        participates_cultural: !!student.participates_cultural,
      });
      setError(null);
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSave(student.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update student profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Edit Student Profile</h3>
            <p className="text-xs text-slate-400">Modify information for USN: {student.usn}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">USN / Student ID *</label>
              <input
                type="text"
                name="usn"
                value={formData.usn}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Activity Category Participation */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-900 mb-2">Activity Participation Categories</label>
            <div className="grid grid-cols-3 gap-2">
              <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                formData.participates_technical ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <input
                  type="checkbox"
                  name="participates_technical"
                  checked={formData.participates_technical}
                  onChange={handleChange}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs">Technical (Set A)</span>
              </label>

              <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                formData.participates_sports ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <input
                  type="checkbox"
                  name="participates_sports"
                  checked={formData.participates_sports}
                  onChange={handleChange}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs">Sports (Set B)</span>
              </label>

              <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                formData.participates_cultural ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <input
                  type="checkbox"
                  name="participates_cultural"
                  checked={formData.participates_cultural}
                  onChange={handleChange}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs">Cultural (Set C)</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
