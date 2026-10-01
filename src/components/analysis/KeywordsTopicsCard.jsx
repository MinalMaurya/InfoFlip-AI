import React from 'react';
import { Tag, Hash, Bookmark } from 'lucide-react';

export default function KeywordsTopicsCard({ keywords, topics = [] }) {
  const hasKeywords = keywords && (keywords.primary?.length > 0 || keywords.secondary?.length > 0);
  const hasTopics = Array.isArray(topics) && topics.length > 0;

  if (!hasKeywords && !hasTopics) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Keywords, Topics & Semantic Tags
          </h3>
        </div>
      </div>

      <div className="space-y-3.5">
        
        {/* Topics */}
        {hasTopics && (
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1.5">
              Major Topics
            </span>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((top, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center gap-1"
                >
                  <Bookmark className="w-3 h-3 text-indigo-500" />
                  <span>{top}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Primary & Secondary Keywords */}
        {hasKeywords && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {keywords.primary && keywords.primary.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1.5">
                  Primary Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.primary.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {keywords.secondary && keywords.secondary.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1.5">
                  Secondary Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.secondary.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
