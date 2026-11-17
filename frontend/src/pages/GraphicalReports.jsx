import React, { useState, useEffect } from 'react';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  Info,
  Calendar,
  Building2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import VennDiagram from '../components/VennDiagram';
import { apiClient } from '../api/client';

export default function GraphicalReports({ 
  analysis, 
  onRefresh, 
  onSelectVennRegion 
}) {
  const [timelineData, setTimelineData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    setLoadingExtras(true);
    Promise.all([
      apiClient.getTimeline(),
      apiClient.getDepartmentBreakdown()
    ])
      .then(([timelineRes, deptRes]) => {
        setTimelineData(timelineRes.timeline || []);
        setDepartmentData(deptRes.breakdown || []);
      })
      .catch(console.error)
      .finally(() => setLoadingExtras(false));
  }, []);

  if (!analysis) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-sm">
        Loading Graphical Visualizations...
      </div>
    );
  }

  const {
    universal_set = {},
    individual_sets = {},
    inclusive_intersections = {},
    union_and_complements = {},
    venn_regions = {},
    participation_categories = {}
  } = analysis;

  const uCount = universal_set.count || 0;
  const aCount = individual_sets.set_a?.count || 0;
  const bCount = individual_sets.set_b?.count || 0;
  const cCount = individual_sets.set_c?.count || 0;
  const unionCount = union_and_complements.union?.count || 0;
  const noneCount = union_and_complements.none?.count || 0;

  // Chart 2: Bar Chart comparing Technical, Sports, Cultural and Unique Union
  const barComparisonData = [
    { name: 'Technical (Set A)', count: aCount, percentage: individual_sets.set_a?.percentage, color: '#3b82f6' },
    { name: 'Sports (Set B)', count: bCount, percentage: individual_sets.set_b?.percentage, color: '#10b981' },
    { name: 'Cultural (Set C)', count: cCount, percentage: individual_sets.set_c?.percentage, color: '#8b5cf6' },
    { name: 'Unique (A ∪ B ∪ C)', count: unionCount, percentage: union_and_complements.union?.percentage, color: '#06b6d4' }
  ];

  // Chart 3: Pie Chart showing Activity Participation Distribution across Disjoint Regions
  const pieDisjointData = [
    { name: 'Technical Only', value: venn_regions.a_only?.count || 0, color: '#3b82f6' },
    { name: 'Sports Only', value: venn_regions.b_only?.count || 0, color: '#10b981' },
    { name: 'Cultural Only', value: venn_regions.c_only?.count || 0, color: '#8b5cf6' },
    { name: 'Tech & Sports Only', value: venn_regions.ab_only?.count || 0, color: '#0284c7' },
    { name: 'Tech & Cultural Only', value: venn_regions.ac_only?.count || 0, color: '#6366f1' },
    { name: 'Sports & Cultural Only', value: venn_regions.bc_only?.count || 0, color: '#0d9488' },
    { name: 'All Three Activities', value: venn_regions.all_three?.count || 0, color: '#e11d48' },
  ].filter(d => d.value > 0);

  // Chart 4: Doughnut Chart (Participating vs Not Participating)
  const donutEngagementData = [
    { name: 'Participating in ≥ 1 Activity', value: unionCount, percentage: union_and_complements.union?.percentage, color: '#2563eb' },
    { name: 'Not Participating (None)', value: noneCount, percentage: union_and_complements.none?.percentage, color: '#94a3b8' }
  ];

  // Chart 7: Comparison Chart (Exactly 1, Exactly 2, All 3 Activities)
  const partitionData = [
    {
      category: 'Exactly One Activity',
      count: participation_categories.exactly_one?.count || 0,
      percentage: participation_categories.exactly_one?.percentage || 0,
      color: '#3b82f6'
    },
    {
      category: 'Exactly Two Activities',
      count: participation_categories.exactly_two?.count || 0,
      percentage: participation_categories.exactly_two?.percentage || 0,
      color: '#f59e0b'
    },
    {
      category: 'All Three Activities',
      count: participation_categories.all_three?.count || 0,
      percentage: participation_categories.all_three?.percentage || 0,
      color: '#e11d48'
    },
    {
      category: 'No Activities (None)',
      count: participation_categories.none?.count || 0,
      percentage: participation_categories.none?.percentage || 0,
      color: '#64748b'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Graphical Analytics & Visualization Suite</h2>
            <p className="text-xs text-slate-500">
              Seven canonical mathematical visualizations computed directly from live database records.
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Graphs</span>
        </button>
      </div>

      {/* Row 1: Venn Diagram & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRAPH 1: Three-Set Venn Diagram */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">Graph 1 of 7</span>
            <h3 className="font-bold text-slate-900 text-sm">Three-Set Venn Diagram (All 7 Regions)</h3>
            <p className="text-xs text-slate-500">Displays all 7 mutually exclusive partitions + outside complement</p>
          </div>

          <VennDiagram 
            vennData={venn_regions} 
            onSelectRegion={onSelectVennRegion}
          />
        </div>

        {/* GRAPH 2: Bar Chart comparing Technical, Sports, Cultural and Unique */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">Graph 2 of 7</span>
            <h3 className="font-bold text-slate-900 text-sm">Activity Participation Cardinality Comparison</h3>
            <p className="text-xs text-slate-500">Comparing raw activity enrollments vs net unique union |A ∪ B ∪ C|</p>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name, item) => [
                    `${val} Students (${item.payload.percentage}% of cohort)`,
                    'Participants'
                  ]}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {barComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Deduplication Impact:</span>
            <span className="font-mono font-bold text-slate-900">
              {aCount + bCount + cCount} Gross → {unionCount} Net Unique Students
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Distribution Pie & Doughnut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRAPH 3: Pie Chart of Disjoint Partition Distribution */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">Graph 3 of 7</span>
            <h3 className="font-bold text-slate-900 text-sm">Disjoint Partition Distribution</h3>
            <p className="text-xs text-slate-500">Proportional breakdown of participants in the 7 distinct Venn regions</p>
          </div>

          <div className="h-64 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDisjointData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={25}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieDisjointData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} Students`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-600 mt-2">
            {pieDisjointData.map((d, i) => (
              <span key={i} className="inline-flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        {/* GRAPH 4: Doughnut Chart (Participating vs Non-Participating) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">Graph 4 of 7</span>
            <h3 className="font-bold text-slate-900 text-sm">Cohort Engagement Ratio</h3>
            <p className="text-xs text-slate-500">Unique participants |A ∪ B ∪ C| vs Non-participants |None|</p>
          </div>

          <div className="h-64 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutEngagementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
                >
                  {donutEngagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name, item) => [`${val} Students (${item.payload.percentage}%)`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
              <span className="text-blue-700 font-semibold block">Participating</span>
              <span className="text-base font-black text-blue-950 font-mono">{unionCount} Students</span>
              <span className="text-[10px] text-blue-600 block">{union_and_complements.union?.percentage}% of U</span>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-semibold block">Not Participating</span>
              <span className="text-base font-black text-slate-800 font-mono">{noneCount} Students</span>
              <span className="text-[10px] text-slate-500 block">{union_and_complements.none?.percentage}% of U</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Registrations Timeline (Line Chart) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">Graph 5 of 7</span>
            <h3 className="font-bold text-slate-900 text-sm">Student Registrations Longitudinal Timeline</h3>
            <p className="text-xs text-slate-500">Daily registration volume and cumulative growth trajectory</p>
          </div>
          <Calendar className="w-5 h-5 text-slate-400" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(val, name) => [val, name === 'cumulative' ? 'Cumulative Students' : 'Registrations']} />
              <Area type="monotone" dataKey="cumulative" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorCumulative)" name="Cumulative Total" />
              <Bar dataKey="registrations" fill="#06b6d4" barSize={10} name="Daily New" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Department-wise Participation & Category Partitions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GRAPH 6: Department-wise Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-4">
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">Graph 6 of 7</span>
            <h3 className="font-bold text-slate-900 text-sm">Department-Wise Activity Participation</h3>
            <p className="text-xs text-slate-500">Cross-departmental breakdown of Technical, Sports and Cultural involvement</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" angle={-15} textAnchor="end" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="technical" fill="#3b82f6" name="Technical (A)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sports" fill="#10b981" name="Sports (B)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cultural" fill="#8b5cf6" name="Cultural (C)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 7: Comparison of Exactly 1, 2, 3 Activities */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">Graph 7 of 7</span>
            <h3 className="font-bold text-slate-900 text-sm">Activity Commitment Partition</h3>
            <p className="text-xs text-slate-500">Comparison of students participating in exactly 1, 2, or all 3 activities</p>
          </div>

          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partitionData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={(val, name, item) => [`${val} Students (${item.payload.percentage}%)`, 'Students']} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {partitionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
            {partitionData.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">{p.category}:</span>
                <span className="font-mono font-bold text-slate-900">{p.count} ({p.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
