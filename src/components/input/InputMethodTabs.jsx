import React from 'react';
import { FileText, UploadCloud, Image as ImageIcon, Video, Sparkles } from 'lucide-react';

export const INPUT_TABS = [
  { id: 'text', label: 'Paste Text', icon: FileText, desc: 'Raw text, articles, advisories' },
  { id: 'file', label: 'Upload File', icon: UploadCloud, desc: 'PDF, DOCX, TXT documents' },
  { id: 'image', label: 'Upload Image', icon: ImageIcon, desc: 'JPG, PNG infographics & charts' },
  { id: 'video', label: 'Video', icon: Video, desc: 'Upcoming Module 1 roadmap', disabled: true, badge: 'Roadmap' },
];

export default function InputMethodTabs({ activeTab, onSelectTab }) {
  const handleKeyDown = (e, index) => {
    const enabledTabs = INPUT_TABS.filter(t => !t.disabled);
    const currentIndex = enabledTabs.findIndex(t => t.id === activeTab);
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % enabledTabs.length;
      onSelectTab(enabledTabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
      onSelectTab(enabledTabs[prevIndex].id);
    }
  };

  return (
    <div className="w-full">
      <div 
        role="tablist" 
        aria-label="Content input method"
        className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80"
      >
        {INPUT_TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isDisabled
                  ? 'opacity-45 cursor-not-allowed text-slate-400 dark:text-slate-500'
                  : isSelected
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${
                isSelected 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-400 dark:text-slate-500'
              }`} />
              
              <span className="truncate">{tab.label}</span>

              {tab.badge && (
                <span className="hidden sm:inline-block ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
