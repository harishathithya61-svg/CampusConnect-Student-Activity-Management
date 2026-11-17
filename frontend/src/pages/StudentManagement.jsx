import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { apiClient } from '../api/client';
import StudentModal from '../components/StudentModal';
import BulkImportModal from '../components/BulkImportModal';

const DEPARTMENTS = [
  'All',
  'Cyber Security',
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Science & Engineering',
  'Electronics & Communication'
];

export default function StudentManagement({ onNavigate }) {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [section, setSection] = useState('All');
  const [activityCategory, setActivityCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  // Modals state
  const [editingStudent, setEditingStudent] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getStudents({
        page,
        limit,
        search,
        department,
        section,
        activity_category: activityCategory,
        sort_by: sortBy,
        order
      });
      setStudents(res.students || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, department, section, activityCategory, sortBy, order]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleEditSave = async (id, updatedData) => {
    try {
      const res = await apiClient.updateStudent(id, updatedData);
      setNotification({ type: 'success', message: res.message || 'Student updated successfully.' });
      fetchStudents();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to permanently delete student ${student.full_name} (${student.usn})? This action cannot be undone.`)) {
      try {
        const res = await apiClient.deleteStudent(student.id);
        setNotification({ type: 'success', message: res.message || 'Student deleted.' });
        fetchStudents();
      } catch (err) {
        setNotification({ type: 'error', message: err.message || 'Failed to delete student.' });
      }
    }
  };

  const handleExportCSV = () => {
    const url = apiClient.getDownloadUrl('csv', {
      department: department !== 'All' ? department : '',
      section: section !== 'All' ? section : '',
      type: 'complete'
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between animate-in fade-in ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Control Bar: Search & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by student name, USN, or email..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('registration')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Department:
            </span>
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Section:</span>
            <select
              value={section}
              onChange={(e) => { setSection(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Activity:</span>
            <select
              value={activityCategory}
              onChange={(e) => { setActivityCategory(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
            >
              <option value="">All Categories</option>
              <option value="Technical">Technical (Set A)</option>
              <option value="Sports">Sports (Set B)</option>
              <option value="Cultural">Cultural (Set C)</option>
              <option value="Multiple">Multiple (≥ 2 Activities)</option>
              <option value="None">None (0 Activities)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="font-semibold text-slate-500">Rows:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">
              Showing {students.length} of {total.toLocaleString()} Students
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Page {page} of {totalPages}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-bold">
                <th className="py-3 px-4">USN</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-3 text-center">Sec</th>
                <th className="py-3 px-3 text-center">Technical</th>
                <th className="py-3 px-3 text-center">Sports</th>
                <th className="py-3 px-3 text-center">Cultural</th>
                <th className="py-3 px-3 text-center">Venn Region</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading student records...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No matching student records found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {s.usn}
                      {s.is_demo && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-sans font-bold bg-amber-100 text-amber-800">
                          Demo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{s.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{s.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{s.department}</td>
                    <td className="py-3 px-3 text-center font-mono font-semibold">{s.section}</td>
                    <td className="py-3 px-3 text-center">
                      {s.participates_technical ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          Yes
                        </span>
                      ) : <span className="text-slate-300 font-bold">—</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {s.participates_sports ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Yes
                        </span>
                      ) : <span className="text-slate-300 font-bold">—</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {s.participates_cultural ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          Yes
                        </span>
                      ) : <span className="text-slate-300 font-bold">—</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {s.participation_region.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingStudent(s)}
                          title="Edit student"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          title="Delete student"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Page {page} of {totalPages} ({total} total records)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-bold text-slate-700">{page}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      <StudentModal
        student={editingStudent}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleEditSave}
      />

      {/* Bulk CSV Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchStudents();
          setNotification({ type: 'success', message: 'Bulk CSV import completed successfully.' });
        }}
      />
    </div>
  );
}
