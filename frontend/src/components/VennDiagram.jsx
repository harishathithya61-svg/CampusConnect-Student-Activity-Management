import React, { useState } from 'react';
import { Users, Info, Sparkles } from 'lucide-react';

export default function VennDiagram({ vennData, onSelectRegion, selectedRegionId }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  if (!vennData) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
        Loading Venn Diagram Data...
      </div>
    );
  }

  const {
    a_only = { count: 0, percentage: 0, label: 'Technical Only' },
    b_only = { count: 0, percentage: 0, label: 'Sports Only' },
    c_only = { count: 0, percentage: 0, label: 'Cultural Only' },
    ab_only = { count: 0, percentage: 0, label: 'Technical & Sports Only' },
    ac_only = { count: 0, percentage: 0, label: 'Technical & Cultural Only' },
    bc_only = { count: 0, percentage: 0, label: 'Sports & Cultural Only' },
    all_three = { count: 0, percentage: 0, label: 'All Three Activities' },
    none = { count: 0, percentage: 0, label: 'Outside All Sets (None)' }
  } = vennData;

  const activeId = hoveredRegion || selectedRegionId;

  const handleRegionClick = (regionKey) => {
    if (onSelectRegion) {
      onSelectRegion(vennData[regionKey]);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Interactive SVG Diagram */}
      <div className="relative w-full max-w-[500px] aspect-[5/4] bg-gradient-to-b from-slate-50/50 to-white rounded-2xl border border-slate-200/80 p-3 shadow-inner">
        <svg 
          viewBox="0 0 500 400" 
          className="w-full h-full select-none"
        >
          <defs>
            {/* Circle Definitions */}
            <clipPath id="clip-a">
              <circle cx="185" cy="165" r="115" />
            </clipPath>
            <clipPath id="clip-b">
              <circle cx="315" cy="165" r="115" />
            </clipPath>
            <clipPath id="clip-c">
              <circle cx="250" cy="255" r="115" />
            </clipPath>
            
            {/* Filters for soft glow */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#1e293b" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Universal Set Outer Boundary Box */}
          <rect 
            x="8" y="8" width="484" height="384" rx="14" 
            fill="#f8fafc" 
            stroke="#cbd5e1" 
            strokeWidth="1.5" 
            strokeDasharray="4 4"
          />
          <text x="24" y="32" className="text-xs font-bold font-mono fill-slate-700">
            Universal Set U (Total Registered Students)
          </text>

          {/* Circle A Base (Technical) */}
          <circle 
            cx="185" cy="165" r="115" 
            fill="#3b82f6" 
            fillOpacity={activeId === 'a_only' ? 0.45 : 0.22}
            stroke="#2563eb" 
            strokeWidth="2.5"
            className="transition-all duration-200"
          />

          {/* Circle B Base (Sports) */}
          <circle 
            cx="315" cy="165" r="115" 
            fill="#10b981" 
            fillOpacity={activeId === 'b_only' ? 0.45 : 0.22}
            stroke="#059669" 
            strokeWidth="2.5"
            className="transition-all duration-200"
          />

          {/* Circle C Base (Cultural) */}
          <circle 
            cx="250" cy="255" r="115" 
            fill="#8b5cf6" 
            fillOpacity={activeId === 'c_only' ? 0.45 : 0.22}
            stroke="#7c3aed" 
            strokeWidth="2.5"
            className="transition-all duration-200"
          />

          {/* Set Category Header Labels */}
          <text x="90" y="55" className="text-xs font-black fill-blue-700">Set A: Technical</text>
          <text x="325" y="55" className="text-xs font-black fill-emerald-700">Set B: Sports</text>
          <text x="200" y="388" className="text-xs font-black fill-purple-700">Set C: Cultural</text>

          {/* ---------------- 7 MUTUALLY EXCLUSIVE REGION LABELS & INTERACTIVE HOTSPOTS ---------------- */}

          {/* 1. Region A ONLY */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleRegionClick('a_only')}
            onMouseEnter={() => setHoveredRegion('a_only')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <circle cx="125" cy="145" r="28" fill="white" fillOpacity="0.85" stroke="#2563eb" strokeWidth="1.5" className="group-hover:scale-110 transition-transform origin-center" filter="url(#glow)" />
            <text x="125" y="142" textAnchor="middle" className="text-xs font-black fill-blue-900 font-mono pointer-events-none">
              {a_only.count}
            </text>
            <text x="125" y="156" textAnchor="middle" className="text-[9px] font-bold fill-blue-600 pointer-events-none">
              {a_only.percentage}%
            </text>
          </g>

          {/* 2. Region B ONLY */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleRegionClick('b_only')}
            onMouseEnter={() => setHoveredRegion('b_only')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <circle cx="375" cy="145" r="28" fill="white" fillOpacity="0.85" stroke="#059669" strokeWidth="1.5" className="group-hover:scale-110 transition-transform origin-center" filter="url(#glow)" />
            <text x="375" y="142" textAnchor="middle" className="text-xs font-black fill-emerald-900 font-mono pointer-events-none">
              {b_only.count}
            </text>
            <text x="375" y="156" textAnchor="middle" className="text-[9px] font-bold fill-emerald-600 pointer-events-none">
              {b_only.percentage}%
            </text>
          </g>

          {/* 3. Region C ONLY */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleRegionClick('c_only')}
            onMouseEnter={() => setHoveredRegion('c_only')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <circle cx="250" cy="320" r="28" fill="white" fillOpacity="0.85" stroke="#7c3aed" strokeWidth="1.5" className="group-hover:scale-110 transition-transform origin-center" filter="url(#glow)" />
            <text x="250" y="317" textAnchor="middle" className="text-xs font-black fill-purple-900 font-mono pointer-events-none">
              {c_only.count}
            </text>
            <text x="250" y="331" textAnchor="middle" className="text-[9px] font-bold fill-purple-600 pointer-events-none">
              {c_only.percentage}%
            </text>
          </g>

          {/* 4. Region A & B ONLY (Technical & Sports) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleRegionClick('ab_only')}
            onMouseEnter={() => setHoveredRegion('ab_only')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <circle cx="250" cy="130" r="22" fill="#0284c7" stroke="white" strokeWidth="2" className="group-hover:scale-110 transition-transform origin-center shadow-md" />
            <text x="250" y="128" textAnchor="middle" className="text-xs font-black fill-white font-mono pointer-events-none">
              {ab_only.count}
            </text>
            <text x="250" y="140" textAnchor="middle" className="text-[8px] font-semibold fill-cyan-100 pointer-events-none">
              {ab_only.percentage}%
            </text>
          </g>

          {/* 5. Region A & C ONLY (Technical & Cultural) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleRegionClick('ac_only')}
            onMouseEnter={() => setHoveredRegion('ac_only')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <circle cx="180" cy="240" r="22" fill="#4f46e5" stroke="white" strokeWidth="2" className="group-hover:scale-110 transition-transform origin-center shadow-md" />
            <text x="180" y="238" textAnchor="middle" className="text-xs font-black fill-white font-mono pointer-events-none">
              {ac_only.count}
            </text>
            <text x="180" y="250" textAnchor="middle" className="text-[8px] font-semibold fill-indigo-100 pointer-events-none">
              {ac_only.percentage}%
            </text>
          </g>

          {/* 6. Region B & C ONLY (Sports & Cultural) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleRegionClick('bc_only')}
            onMouseEnter={() => setHoveredRegion('bc_only')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <circle cx="320" cy="240" r="22" fill="#0d9488" stroke="white" strokeWidth="2" className="group-hover:scale-110 transition-transform origin-center shadow-md" />
            <text x="320" y="238" textAnchor="middle" className="text-xs font-black fill-white font-mono pointer-events-none">
              {bc_only.count}
            </text>
            <text x="320" y="250" textAnchor="middle" className="text-[8px] font-semibold fill-teal-100 pointer-events-none">
              {bc_only.percentage}%
            </text>
          </g>

          {/* 7. Region A & B & C (All Three) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleRegionClick('all_three')}
            onMouseEnter={() => setHoveredRegion('all_three')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <circle cx="250" cy="205" r="24" fill="#e11d48" stroke="white" strokeWidth="2.5" className="group-hover:scale-110 transition-transform origin-center shadow-lg" />
            <text x="250" y="202" textAnchor="middle" className="text-xs font-black fill-white font-mono pointer-events-none">
              {all_three.count}
            </text>
            <text x="250" y="215" textAnchor="middle" className="text-[8px] font-semibold fill-rose-100 pointer-events-none">
              {all_three.percentage}%
            </text>
          </g>

          {/* Outside Region: None */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleRegionClick('none')}
            onMouseEnter={() => setHoveredRegion('none')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <rect x="20" y="345" width="130" height="36" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" className="group-hover:fill-slate-300 transition-colors" />
            <text x="85" y="360" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 pointer-events-none">
              Outside Sets (None)
            </text>
            <text x="85" y="373" textAnchor="middle" className="text-[11px] font-mono font-black fill-slate-900 pointer-events-none">
              {none.count} ({none.percentage}%)
            </text>
          </g>
        </svg>
      </div>

      {/* Disjoint Regions Interactive Legend Cards */}
      <div className="w-full mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <button 
          onClick={() => handleRegionClick('a_only')}
          className="p-2 rounded-lg bg-blue-50/80 border border-blue-200 text-left hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-blue-900">Tech Only</span>
            <span className="font-mono font-bold text-blue-700">{a_only.count}</span>
          </div>
          <span className="text-[10px] text-blue-600">{a_only.percentage}%</span>
        </button>

        <button 
          onClick={() => handleRegionClick('b_only')}
          className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 text-left hover:bg-emerald-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-900">Sports Only</span>
            <span className="font-mono font-bold text-emerald-700">{b_only.count}</span>
          </div>
          <span className="text-[10px] text-emerald-600">{b_only.percentage}%</span>
        </button>

        <button 
          onClick={() => handleRegionClick('c_only')}
          className="p-2 rounded-lg bg-purple-50/80 border border-purple-200 text-left hover:bg-purple-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-purple-900">Cultural Only</span>
            <span className="font-mono font-bold text-purple-700">{c_only.count}</span>
          </div>
          <span className="text-[10px] text-purple-600">{c_only.percentage}%</span>
        </button>

        <button 
          onClick={() => handleRegionClick('ab_only')}
          className="p-2 rounded-lg bg-sky-50/80 border border-sky-200 text-left hover:bg-sky-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sky-900">Tech & Sports</span>
            <span className="font-mono font-bold text-sky-700">{ab_only.count}</span>
          </div>
          <span className="text-[10px] text-sky-600">{ab_only.percentage}%</span>
        </button>

        <button 
          onClick={() => handleRegionClick('ac_only')}
          className="p-2 rounded-lg bg-indigo-50/80 border border-indigo-200 text-left hover:bg-indigo-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-indigo-900">Tech & Cultural</span>
            <span className="font-mono font-bold text-indigo-700">{ac_only.count}</span>
          </div>
          <span className="text-[10px] text-indigo-600">{ac_only.percentage}%</span>
        </button>

        <button 
          onClick={() => handleRegionClick('bc_only')}
          className="p-2 rounded-lg bg-teal-50/80 border border-teal-200 text-left hover:bg-teal-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-teal-900">Sports & Cultural</span>
            <span className="font-mono font-bold text-teal-700">{bc_only.count}</span>
          </div>
          <span className="text-[10px] text-teal-600">{bc_only.percentage}%</span>
        </button>

        <button 
          onClick={() => handleRegionClick('all_three')}
          className="p-2 rounded-lg bg-rose-50/80 border border-rose-200 text-left hover:bg-rose-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-rose-900">All Three</span>
            <span className="font-mono font-bold text-rose-700">{all_three.count}</span>
          </div>
          <span className="text-[10px] text-rose-600">{all_three.percentage}%</span>
        </button>

        <button 
          onClick={() => handleRegionClick('none')}
          className="p-2 rounded-lg bg-slate-100 border border-slate-300 text-left hover:bg-slate-200 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">None (Outside)</span>
            <span className="font-mono font-bold text-slate-700">{none.count}</span>
          </div>
          <span className="text-[10px] text-slate-500">{none.percentage}%</span>
        </button>
      </div>

      <div className="mt-3 text-center text-[11px] text-slate-400 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span>Click any region or card above to inspect the exact student cohort.</span>
      </div>
    </div>
  );
}
