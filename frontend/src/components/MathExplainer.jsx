import React from 'react';
import { CheckCircle2, AlertCircle, Calculator, Sigma } from 'lucide-react';

export default function MathExplainer({ analysisData }) {
  if (!analysisData) return null;

  const {
    universal_set = {},
    individual_sets = {},
    inclusive_intersections = {},
    union_and_complements = {},
    inclusion_exclusion_breakdown = {}
  } = analysisData;

  const uCount = universal_set.count || 0;
  const aCount = individual_sets.set_a?.count || 0;
  const bCount = individual_sets.set_b?.count || 0;
  const cCount = individual_sets.set_c?.count || 0;

  const abCount = inclusive_intersections.a_cap_b?.count || 0;
  const acCount = inclusive_intersections.a_cap_c?.count || 0;
  const bcCount = inclusive_intersections.b_cap_c?.count || 0;
  const abcCount = inclusive_intersections.a_cap_b_cap_c?.count || 0;

  const unionCount = union_and_complements.union?.count || 0;
  const noneCount = union_and_complements.none?.count || 0;
  const isVerified = union_and_complements.union?.is_verified;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Sigma className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Principle of Inclusion-Exclusion (PIE)</h3>
            <p className="text-xs text-slate-500">Rigorous deduplication across three overlapping activity sets</p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {isVerified ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mathematically Verified</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Verification Pending</span>
            </>
          )}
        </div>
      </div>

      {/* Main Formula Card */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white font-mono text-xs overflow-x-auto shadow-inner">
        <div className="text-slate-400 text-[11px] uppercase tracking-wider mb-1 font-sans">Formal Set Theoretic Definition:</div>
        <div className="text-amber-400 font-bold text-sm">
          |A ∪ B ∪ C| = |A| + |B| + |C| - |A ∩ B| - |A ∩ C| - |B ∩ C| + |A ∩ B ∩ C|
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400">Database Substitution:</span>
          <span className="text-emerald-400 font-bold">
            {aCount} + {bCount} + {cCount} - {abCount} - {acCount} - {bcCount} + {abcCount} = {unionCount} students
          </span>
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100">
          <div className="text-blue-600 font-semibold">1. Raw Registrations Sum</div>
          <div className="mt-1 text-lg font-bold text-blue-950 font-mono">
            {aCount + bCount + cCount}
          </div>
          <p className="text-[11px] text-blue-700 mt-0.5">|A| + |B| + |C| (Contains duplicates)</p>
        </div>

        <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100">
          <div className="text-rose-600 font-semibold">2. Pairwise Overlap Deduction</div>
          <div className="mt-1 text-lg font-bold text-rose-950 font-mono">
            - {abCount + acCount + bcCount}
          </div>
          <p className="text-[11px] text-rose-700 mt-0.5">Subtracts all 2-way intersections</p>
        </div>

        <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-100">
          <div className="text-purple-600 font-semibold">3. Triple Overlap Restored</div>
          <div className="mt-1 text-lg font-bold text-purple-950 font-mono">
            + {abcCount}
          </div>
          <p className="text-[11px] text-purple-700 mt-0.5">Adds back |A ∩ B ∩ C| subtracted 3 times</p>
        </div>

        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
          <div className="text-emerald-600 font-semibold">4. Unique Net Participants</div>
          <div className="mt-1 text-lg font-bold text-emerald-950 font-mono">
            {unionCount} <span className="text-xs font-normal text-emerald-700">({inclusion_exclusion_breakdown.raw_double_counted_difference || 0} duplicates purged)</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5">True cardinality of union |A ∪ B ∪ C|</p>
        </div>
      </div>
    </div>
  );
}
