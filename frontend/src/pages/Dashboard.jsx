import React from 'react';
import { 
  Users, 
  Cpu, 
  Trophy, 
  Palette, 
  Sparkles, 
  Layers, 
  UserX, 
  ArrowRight, 
  PlusCircle, 
  Download,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import VennDiagram from '../components/VennDiagram';
import MathExplainer from '../components/MathExplainer';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

export default function Dashboard({ 
  stats, 
  analysis, 
  onNavigate, 
  onSelectVennRegion,
  onLoadReportDemo 
}) {
  if (!stats || !analysis) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Crunching campus set theoretic data...</p>
        </div>
      </div>
    );
  }

  const uCount = stats.total_students || 0;
  const techCount = stats.technical_count || 0;
  const sportsCount = stats.sports_count || 0;
  const cultCount = stats.cultural_count || 0;
  const uniqueCount = stats.unique_participants || 0;
  const multiCount = stats.multiple_activities || 0;
  const noneCount = stats.not_participating || 0;

  // Comparison Bar Chart data
  const comparisonData = [
    { name: 'Technical (A)', count: techCount, color: '#3b82f6' },
    { name: 'Sports (B)', count: sportsCount, color: '#10b981' },
    { name: 'Cultural (C)', count: cultCount, color: '#8b5cf6' },
    { name: 'Unique Union', count: uniqueCount, color: '#06b6d4' }
  ];

  // Participation vs Non Participation Doughnut data
  const donutData = [
    { name: 'Participating (A ∪ B ∪ C)', value: uniqueCount, color: '#2563eb' },
    { name: 'Non-Participating (None)', value: noneCount, color: '#94a3b8' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30">
                Live Database Active
              </span>
              <span className="text-xs text-slate-400">Jain (Deemed-to-be Univ) Cohort</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              CampusConnect Analytics Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Automated Set Theory and Inclusion-Exclusion engine eliminating duplicated participant counts across Technical, Sports and Cultural campus domains.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('registration')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Student</span>
            </button>
            <button
              onClick={() => onNavigate('analysis')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <span>Set Theory Proofs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 7 Key Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard
          title="Universal Set"
          symbol="|U|"
          value={uCount}
          percentage={100}
          subtitle="All registered students"
          icon={Users}
          color="slate"
          onClick={() => onNavigate('management')}
        />

        <StatCard
          title="Technical"
          symbol="|A|"
          value={techCount}
          percentage={stats.percentages?.technical}
          subtitle="Hackathons, coding"
          icon={Cpu}
          color="blue"
          onClick={() => onNavigate('management')}
        />

        <StatCard
          title="Sports"
          symbol="|B|"
          value={sportsCount}
          percentage={stats.percentages?.sports}
          subtitle="Athletics, tournaments"
          icon={Trophy}
          color="emerald"
          onClick={() => onNavigate('management')}
        />

        <StatCard
          title="Cultural"
          symbol="|C|"
          value={cultCount}
          percentage={stats.percentages?.cultural}
          subtitle="Dance, music, theatre"
          icon={Palette}
          color="purple"
          onClick={() => onNavigate('management')}
        />

        <StatCard
          title="Unique Union"
          symbol="|A∪B∪C|"
          value={uniqueCount}
          percentage={stats.percentages?.unique}
          subtitle="Net distinct students"
          icon={Sparkles}
          color="cyan"
          onClick={() => onNavigate('analysis')}
        />

        <StatCard
          title="Multiple Events"
          symbol="≥ 2 Sets"
          value={multiCount}
          percentage={uCount > 0 ? Math.round((multiCount / uCount) * 100) : 0}
          subtitle="Students in 2 or 3 sets"
          icon={Layers}
          color="amber"
          onClick={() => onNavigate('analysis')}
        />

        <StatCard
          title="Not Participating"
          symbol="|None|"
          value={noneCount}
          percentage={stats.percentages?.none}
          subtitle="Outreach target group"
          icon={UserX}
          color="rose"
          onClick={() => onNavigate('management')}
        />
      </div>

      {/* Main Section: Venn Diagram + Mathematical Model */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3-Set Venn Diagram */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Three-Set Venn Diagram</h3>
              <p className="text-xs text-slate-500">7 mutually exclusive regions + exterior complement</p>
            </div>
            <button
              onClick={() => onNavigate('graphs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Expanded View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <VennDiagram 
            vennData={analysis.venn_regions} 
            onSelectRegion={onSelectVennRegion}
          />
        </div>

        {/* Right: Mathematical Deduplication Explainer + Quick Chart */}
        <div className="lg:col-span-6 space-y-6">
          <MathExplainer analysisData={analysis} />

          {/* Quick Chart Comparison Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Participation Cardinality Comparison
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val) => [`${val} Students (${uCount > 0 ? ((val / uCount) * 100).toFixed(1) : 0}%)`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Student Registrations</h3>
            <p className="text-xs text-slate-500">Live roster updates from database</p>
          </div>
          <button
            onClick={() => onNavigate('management')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>View All {uCount} Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">USN</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-center">Sec</th>
                <th className="py-2.5 px-3 text-center">Technical</th>
                <th className="py-2.5 px-3 text-center">Sports</th>
                <th className="py-2.5 px-3 text-center">Cultural</th>
                <th className="py-2.5 px-3 text-center">Total Activities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats.recent_students || []).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-slate-900">{s.usn}</td>
                  <td className="py-2 px-3 font-medium text-slate-800">{s.full_name}</td>
                  <td className="py-2 px-3 text-slate-600">{s.department}</td>
                  <td className="py-2 px-3 text-center font-mono">{s.section}</td>
                  <td className="py-2 px-3 text-center">
                    {s.participates_technical ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        Tech
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {s.participates_sports ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Sports
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {s.participates_cultural ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                        Cultural
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      {s.activity_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
