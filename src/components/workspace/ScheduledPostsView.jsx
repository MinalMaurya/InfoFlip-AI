import React from 'react';
import { CalendarClock, ShieldAlert, Clock, ArrowLeft, Info } from 'lucide-react';

/**
 * ScheduledPostsView — Informative "Coming soon" Placeholder for V0.1.0
 *
 * Strictly adheres to Section 3D & Section 9:
 * - Clearly displays "Coming soon"
 * - Explains future platform authorization and scheduling concept without making false promises
 * - Does not implement fake scheduling controls, background jobs, or simulated scheduled records
 */
export default function ScheduledPostsView({ onBackToChat }) {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-app-bg px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-2xs space-y-5">
          {/* Top badge & icon */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="w-11 h-11 rounded-xl bg-surface-selected border border-primary/20 flex items-center justify-center text-primary dark:text-accent">
              <CalendarClock className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              <Clock className="w-3.5 h-3.5" />
              Coming soon
            </span>
          </div>

          {/* Heading & Description */}
          <div className="space-y-2">
            <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
              Scheduled Posts — Coming Soon
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Scheduled publishing is not enabled in InfoFlip-AI V0.1.0. In a future release, this section is intended to let you select approved content from your Library, connect supported publishing accounts, choose a target date and time, and queue deliveries where platform APIs and permissions allow.
            </p>
          </div>

          {/* Planned Capability Scope (Informational Only) */}
          <div className="rounded-xl bg-sidebar-bg border border-border p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
              <Info className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
              <span>Planned Architecture for Future Phases</span>
            </div>
            <ul className="text-xs text-text-secondary space-y-1.5 list-disc list-inside">
              <li>Select human-approved outputs from your conversation history or Content Library.</li>
              <li>Authorize supported destination accounts using official platform OAuth flows.</li>
              <li>Configure target delivery dates and timezones where supported by platform APIs.</li>
            </ul>
          </div>

          {/* Honest Prototype Disclosure */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="leading-relaxed">
              No external platform connections, background jobs, or scheduled deliveries are active in this prototype. To distribute content now, use the copy or download export actions inside your conversation or Content Library.
            </p>
          </div>

          {onBackToChat && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onBackToChat}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Conversation Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
