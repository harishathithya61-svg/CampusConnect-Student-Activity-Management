import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  CalendarCheck, 
  Binary, 
  PieChart, 
  DownloadCloud, 
  Settings,
  GraduationCap
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
  { id: 'registration', label: 'Student Registration', icon: UserPlus },
  { id: 'management', label: 'Student Management', icon: Users },
  { id: 'activities', label: 'Activity Management', icon: CalendarCheck },
  { id: 'analysis', label: 'Participation Analysis', icon: Binary },
  { id: 'graphs', label: 'Graphical Reports', icon: PieChart },
  { id: 'reports', label: 'Download Reports', icon: DownloadCloud },
  { id: 'settings', label: 'Admin Settings', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage, studentCount }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-white block">CampusConnect</span>
          <span className="text-[10px] text-blue-400 font-medium tracking-wider uppercase block">Set Theory & Overlap</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {item.id === 'management' && studentCount > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                  isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-300'
                }`}>
                  {studentCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Academic Citation Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300">Experiential Learning (25BSMA10)</p>
          <p className="text-slate-400">Discrete Math & Graph Theory</p>
          <p className="text-blue-400 font-mono text-[10px] mt-1">JAIN (Deemed-to-be Univ)</p>
        </div>
      </div>
    </aside>
  );
}
