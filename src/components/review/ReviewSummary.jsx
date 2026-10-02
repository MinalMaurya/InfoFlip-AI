import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  ThumbsUp, 
  FileText 
} from 'lucide-react';

export default function ReviewSummary({ summary, onFilterChange, activeFilter = 'ALL' }) {
  if (!summary) return null;

  const cards = [
    {
      id: 'ALL',
      label: 'Total Outputs',
      count: summary.totalOutputs || 0,
      icon: FileText,
      color: 'indigo',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
    },
    {
      id: 'PASS',
      label: 'Passed Checks',
      count: summary.passed || 0,
      icon: CheckCircle2,
      color: 'emerald',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
    },
    {
      id: 'WARNING',
      label: 'Warnings',
      count: summary.warnings || 0,
      icon: AlertTriangle,
      color: 'amber',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
    },
    {
      id: 'FAIL',
      label: 'Failed Checks',
      count: summary.failed || 0,
      icon: XCircle,
      color: 'rose',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
    },
    {
      id: 'NEEDS_REVIEW',
      label: 'Needs Review',
      count: summary.needsHumanReview || 0,
      icon: Clock,
      color: 'purple',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
    },
    {
      id: 'APPROVED',
      label: 'Approved',
      count: summary.approved || 0,
      icon: ThumbsUp,
      color: 'teal',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onFilterChange && onFilterChange(card.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${card.badgeBg} ${
              isSelected ? 'ring-2 ring-indigo-500 shadow-md scale-[1.02]' : 'hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                {card.label}
              </span>
              <Icon className="w-4 h-4 opacity-80" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight">
              {card.count}
            </div>
          </button>
        );
      })}
    </div>
  );
}
