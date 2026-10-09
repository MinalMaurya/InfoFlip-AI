import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { GENERAL_DISCLAIMER_TEXT, EMERGENCY_ADVISORY_NOTICE } from '../../types/contentConfidence.js';

/**
 * Reusable General Disclaimer component for AI-generated and transformed content.
 * 
 * Accessible, readable in light/dark themes, responsive, non-intrusive.
 * Includes contextual warning for emergency content to consult official local advisories.
 */
export default function GeneralDisclaimerNotice({
  className = '',
  compact = false,
  isEmergency = false
}) {
  return (
    <div
      role="note"
      aria-label="Content verification notice"
      className={`rounded-2xl border transition-all ${
        compact ? 'p-2.5 sm:p-3 text-[11px]' : 'p-3.5 sm:p-4 text-xs'
      } ${
        isEmergency 
          ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200' 
          : 'bg-slate-50/90 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-300'
      } shadow-2xs flex items-start gap-2.5 ${className}`}
    >
      <AlertCircle
        className={`${
          compact ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
        } ${isEmergency ? 'text-amber-600 dark:text-amber-400' : 'text-amber-600 dark:text-amber-400'} shrink-0 mt-0.5`}
        aria-hidden="true"
      />
      <div className="flex-1 leading-relaxed">
        <span className="font-semibold text-slate-800 dark:text-slate-200 mr-1.5">
          Important Transparency Notice:
        </span>
        <span className={isEmergency ? 'text-amber-900 dark:text-amber-200' : 'text-slate-600 dark:text-slate-300'}>
          {GENERAL_DISCLAIMER_TEXT}
        </span>
        {isEmergency && (
          <div className="mt-1.5 font-medium text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
            <span>⚠️ {EMERGENCY_ADVISORY_NOTICE}</span>
          </div>
        )}
      </div>
    </div>
  );
}
