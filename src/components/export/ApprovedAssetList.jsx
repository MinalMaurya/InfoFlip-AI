import React, { useState } from 'react';
import ExportAssetCard from './ExportAssetCard.jsx';
import { Filter } from 'lucide-react';

export default function ApprovedAssetList({ exportPackage }) {
  const [activeChannel, setActiveChannel] = useState('ALL');

  if (!exportPackage || !exportPackage.approvedOutputs) {
    return null;
  }

  const items = exportPackage.approvedOutputs;
  const channels = Array.from(new Set(items.map(i => i.channelId)));

  const filteredItems = activeChannel === 'ALL'
    ? items
    : items.filter(i => i.channelId === activeChannel);

  return (
    <div className="space-y-4">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Approved Communication Deliverables</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {items.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Certified channel assets ready for multi-format download or dispatch.
          </p>
        </div>

        {/* Channel Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveChannel('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              activeChannel === 'ALL'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All ({items.length})
          </button>

          {channels.map(ch => (
            <button
              key={ch}
              type="button"
              onClick={() => setActiveChannel(ch)}
              className={`capitalize px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeChannel === ch
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map(item => (
          <ExportAssetCard
            key={item.exportItemId || item.outputId}
            item={item}
            exportPackage={exportPackage}
          />
        ))}
      </div>
    </div>
  );
}
