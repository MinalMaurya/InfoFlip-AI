import React from 'react';
import { FileText, UploadCloud, Image as ImageIcon } from 'lucide-react';

export const INPUT_TABS = [
  { id: 'text', label: 'Paste Text', icon: FileText, desc: 'Articles, reports, raw text' },
  { id: 'file', label: 'Upload File', icon: UploadCloud, desc: 'PDF, DOCX, TXT documents' },
  { id: 'image', label: 'Upload Image', icon: ImageIcon, desc: 'PNG, JPG, WEBP infographics' },
];

export default function InputMethodTabs({ activeTab, onSelectTab }) {
  const handleKeyDown = (e, index) => {
    const currentIndex = INPUT_TABS.findIndex(t => t.id === activeTab);
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % INPUT_TABS.length;
      onSelectTab(INPUT_TABS[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + INPUT_TABS.length) % INPUT_TABS.length;
      onSelectTab(INPUT_TABS[prevIndex].id);
    }
  };

  return (
    <div className="w-full">
      <div 
        role="tablist" 
        aria-label="Content input method"
        className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80"
      >
        {INPUT_TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-primary dark:text-accent shadow-xs border border-slate-200/80 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${
                isSelected 
                  ? 'text-primary dark:text-accent' 
                  : 'text-slate-400 dark:text-slate-500'
              }`} />
              
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
