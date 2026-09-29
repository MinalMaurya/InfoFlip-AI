import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Target, 
  Flame, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function ContextIntentCard({ contextSummary }) {
  const [expanded, setExpanded] = useState(false);

  if (!contextSummary) return null;

  const { domain, intent, urgency, audience, tone, language, keyAction } = contextSummary;

  const getUrgencyBadge = (lvl) => {
    switch (lvl) {
      case 'High':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-slate-50 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Cognitive Pipeline Extracted
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-indigo-200 text-indigo-700 shadow-2xs">
                Context & Intent Grounded
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {domain}
            </h3>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-slate-800">Intent:</span>
            <span>{intent}</span>
          </div>

          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold shadow-2xs ${getUrgencyBadge(urgency)}`}>
            <Flame className="w-3 h-3" />
            <span>{urgency} Priority</span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
            title="Toggle details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Expanded Semantic Diagnostics */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-indigo-100/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs animate-fade-in">
          <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Audience Filter
            </span>
            <span className="font-semibold text-slate-800">{audience}</span>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Calibrated Tone
            </span>
            <span className="font-semibold text-slate-800">{tone}</span>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Output Language
            </span>
            <span className="font-semibold text-slate-800">{language}</span>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Core Call to Action
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {keyAction}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
