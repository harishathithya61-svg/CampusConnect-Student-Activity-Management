import React, { useState } from 'react';
import { 
  DownloadCloud, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  CheckCircle2, 
  Filter, 
  Sparkles,
  Eye
} from 'lucide-react';
import { apiClient } from '../api/client';

const REPORT_TYPES = [
  { id: 'complete', title: 'Complete Student Registration Report', desc: 'Full student roster with all demographic, academic and 3-domain participation attributes.' },
  { id: 'technical', title: 'Technical Activity Report (Set A)', desc: 'Students enrolled in Hackathons, CTFs, Coding Competitions and Tech Symposia.' },
  { id: 'sports', title: 'Sports Activity Report (Set B)', desc: 'Athletes and participants in Cricket, Football, Badminton, and varsity championships.' },
  { id: 'cultural', title: 'Cultural Activity Report (Set C)', desc: 'Performers in Dance, Music, Campus Theatre, Drama and Literary Debate clubs.' },
  { id: 'overlap', title: 'Student Overlap Analysis Report (≥ 2 Sets)', desc: 'Multi-activity participants requiring schedule conflict coordination and engagement recognition.' },
  { id: 'department', title: 'Department-Wise Participation Report', desc: 'Aggregated analytics broken down across CSE, Cyber Security, AI & ML, ECE, ISE.' },
  { id: 'mathematical', title: 'Complete Mathematical Analysis Report', desc: 'Formal Set Theory report featuring PIE formula substitution, disjoint Venn partitions and proofs.' }
];

const DEPARTMENTS = [
  'All',
  'Cyber Security',
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Science & Engineering',
  'Electronics & Communication'
];

export default function DownloadReports({ analysis, totalStudents }) {
  const [selectedType, setSelectedType] = useState('complete');
  const [department, setDepartment] = useState('All');
  const [section, setSection] = useState('All');

  const currentReport = REPORT_TYPES.find(r => r.id === selectedType) || REPORT_TYPES[0];

  const handleDownload = (format) => {
    const params = {
      type: selectedType,
      department: department !== 'All' ? department : '',
      section: section !== 'All' ? section : ''
    };
    const url = apiClient.getDownloadUrl(format, params);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <DownloadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Official Report Generation & Export Center</h2>
            <p className="text-xs text-slate-500">
              Generate publication-ready PDF documents, formatted Excel spreadsheets (.xlsx), and raw CSV datasets.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Universal Set</span>
          <span className="font-mono font-bold text-sm text-slate-900">{totalStudents} Records</span>
        </div>
      </div>

      {/* Grid: Left Report Type Selection, Right Filters and Download Formats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7 Report Types */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
            1. Select Report Category (7 Types)
          </h3>

          <div className="space-y-2.5">
            {REPORT_TYPES.map((rep) => {
              const isSelected = rep.id === selectedType;
              return (
                <button
                  key={rep.id}
                  onClick={() => setSelectedType(rep.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {rep.title}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{rep.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Filters & Download Action Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Filter Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Optional Data Scope Filters</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="All">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
          </div>

          {/* Download Action Triggers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              3. Generate & Download
            </h3>

            {/* PDF Button */}
            <button
              onClick={() => handleDownload('pdf')}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold text-xs flex items-center justify-between hover:from-rose-500 hover:to-rose-600 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <span>Download Formal PDF Report</span>
                  <span className="block text-[10px] text-rose-200 font-normal">ReportLab compiled with mathematical proofs</span>
                </div>
              </div>
              <DownloadCloud className="w-4 h-4 shrink-0" />
            </button>

            {/* Excel Button */}
            <button
              onClick={() => handleDownload('excel')}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs flex items-center justify-between hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5" />
                <div className="text-left">
                  <span>Download Formatted Excel (XLSX)</span>
                  <span className="block text-[10px] text-emerald-200 font-normal">Multi-sheet workbook with formulas</span>
                </div>
              </div>
              <DownloadCloud className="w-4 h-4 shrink-0" />
            </button>

            {/* CSV Button */}
            <button
              onClick={() => handleDownload('csv')}
              className="w-full p-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-between hover:bg-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-500" />
                <span>Export Raw CSV Dataset</span>
              </div>
              <DownloadCloud className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Academic Stamp */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs">
            <span className="font-bold block mb-1">Accredited Academic Format</span>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              PDF reports include JAIN (Deemed-to-be University) metadata, course code 25BSMA10, and PIE validation tables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
