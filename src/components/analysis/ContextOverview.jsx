import React from 'react';
import { Compass, Layers, Target, Languages, Sliders, ShieldCheck } from 'lucide-react';

export default function ContextOverview({ analysis }) {
  if (!analysis) return null;

  const topic = analysis.overview?.mainTopic;
  const domain = analysis.overview?.category;
  const intent = analysis.intent?.primary;
  const language = analysis.language?.name || 'English';
  const tone = analysis.tone?.primary;

  const items = [
    { label: 'Topic', value: topic, icon: Compass, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50' },
    { label: 'Domain', value: domain, icon: Layers, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/50' },
    { label: 'Intent', value: intent, icon: Target, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/50' },
    { label: 'Language', value: language, icon: Languages, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50' },
    { label: 'Tone', value: tone, icon: Sliders, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50' },
  ].filter(i => Boolean(i.value));

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Context Overview
        </span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Source Attributes
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${item.bg} flex flex-col justify-between transition-colors`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate" title={item.value}>
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
