import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Trash2, 
  Users, 
  Cpu, 
  Trophy, 
  Palette, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { apiClient } from '../api/client';

export default function ActivityManagement() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: '',
    category: 'Technical',
    description: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getActivities();
      setActivities(res.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.createActivity(newActivity);
      setSuccess(`Activity '${newActivity.name}' created successfully.`);
      setIsCreateOpen(false);
      setNewActivity({ name: '', category: 'Technical', description: '' });
      fetchActivities();
    } catch (err) {
      setError(err.message || 'Failed to create activity.');
    }
  };

  const handleDelete = async (act) => {
    if (window.confirm(`Are you sure you want to delete activity '${act.name}'?`)) {
      try {
        await apiClient.deleteActivity(act.id);
        setSuccess(`Activity '${act.name}' removed.`);
        fetchActivities();
      } catch (err) {
        setError(err.message || 'Failed to delete activity.');
      }
    }
  };

  const filteredActivities = categoryFilter === 'All' 
    ? activities 
    : activities.filter(a => a.category === categoryFilter);

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'Technical': return { icon: Cpu, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'Sports': return { icon: Trophy, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'Cultural': return { icon: Palette, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      default: return { icon: CalendarCheck, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold underline">Dismiss</button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Campus Activities Catalog</h2>
          <p className="text-xs text-slate-500">
            Organized into 3 canonical mathematical sets: Technical (A), Sports (B), and Cultural (C).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
            {['All', 'Technical', 'Sports', 'Cultural'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Activity</span>
          </button>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.map((act) => {
          const meta = getCategoryMeta(act.category);
          const Icon = meta.icon;
          return (
            <div 
              key={act.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl border ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Set {act.category === 'Technical' ? 'A' : act.category === 'Sports' ? 'B' : 'C'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-3">{act.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {act.description || 'No detailed description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{act.participant_count} Registered</span>
                </div>

                <button
                  onClick={() => handleDelete(act)}
                  title="Delete activity"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Activity Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Campus Activity</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Name *</label>
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. AI Hackathon 2026"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Set Category *</label>
                <select
                  value={newActivity.category}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Technical">Technical (Set A)</option>
                  <option value="Sports">Sports (Set B)</option>
                  <option value="Cultural">Cultural (Set C)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief details about schedule, eligibility, rules..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Create Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
