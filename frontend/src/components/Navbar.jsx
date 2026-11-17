import React from 'react';
import { Sparkles, Database, User, LogOut, CheckCircle2 } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: { title: 'Executive Dashboard', subtitle: 'Real-time overview of student registrations and set theoretic analytics' },
  registration: { title: 'Student Registration System', subtitle: 'Enroll students and classify participation across Technical, Sports & Cultural activities' },
  management: { title: 'Student Directory & Records', subtitle: 'Search, filter, edit, delete, and bulk import/export student participation data' },
  activities: { title: 'Activity Catalog Management', subtitle: 'Manage campus clubs, tournaments, hackathons and cultural events' },
  analysis: { title: 'Set Theory & Mathematical Model', subtitle: 'Inclusion-Exclusion Principle verification, Venn regions and cardinality calculations' },
  graphs: { title: 'Graphical Analytics & Visualizations', subtitle: 'Dynamic 3-set Venn diagram, distribution charts and longitudinal trends' },
  reports: { title: 'Download Official Reports', subtitle: 'Generate certified PDF, Excel (XLSX) and CSV reports with mathematical proofs' },
  settings: { title: 'System Administration & Benchmark Tools', subtitle: 'Generate large-scale datasets (1,000+ students) or load academic demo data' },
};

export default function Navbar({ 
  activePage, 
  studentCount, 
  currentUser, 
  onLogout, 
  onLoadReportDemo,
  isDemoActive 
}) {
  const pageMeta = PAGE_TITLES[activePage] || { title: 'CampusConnect', subtitle: '' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {pageMeta.title}
          {isDemoActive && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Report 50-Student Benchmark Active
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-500 font-normal">{pageMeta.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Benchmark Button */}
        <button
          onClick={onLoadReportDemo}
          title="Reset & load the exact 50-student academic report demonstration dataset"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Load Report Demo (50 Students)</span>
        </button>

        {/* Database Count Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>{studentCount.toLocaleString()} Students</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Database connected"></span>
        </div>

        {/* Admin User Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
            {currentUser?.username ? currentUser.username[0].toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-slate-900 block leading-tight">
              {currentUser?.full_name || 'Admin'}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {currentUser?.username || 'admin'}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
