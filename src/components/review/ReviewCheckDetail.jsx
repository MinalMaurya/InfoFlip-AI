import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { CHECK_STATUSES } from '../../types/review.js';

export default function ReviewCheckDetail({ check, dimensionKey }) {
  if (!check) return null;

  const { status, message, details, score } = check;

  const getStatusBadge = () => {
    switch (status) {
      case CHECK_STATUSES.PASS:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            PASS
          </span>
        );
      case CHECK_STATUSES.WARNING:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            WARNING
          </span>
        );
      case CHECK_STATUSES.FAIL:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            FAIL
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
          {dimensionKey.replace(/([A-Z])/g, ' $1').trim()} Evaluation
        </span>
        <div className="flex items-center gap-2">
          {typeof score === 'number' && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Score: {Math.round(score * 100)}%
            </span>
          )}
          {getStatusBadge()}
        </div>
      </div>

      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
        {message}
      </p>

      {/* Render detailed metadata if present */}
      {details && Object.keys(details).length > 0 && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Dimension Telemetry
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {Object.entries(details).map(([key, val]) => {
              if (val === null || val === undefined) return null;
              if (typeof val === 'object') {
                return (
                  <div key={key} className="col-span-full p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px]">
                    <span className="font-semibold text-slate-600 dark:text-slate-300 capitalize">{key}: </span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">{JSON.stringify(val)}</span>
                  </div>
                );
              }
              return (
                <div key={key} className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-600 dark:text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
