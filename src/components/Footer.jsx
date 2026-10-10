import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer({ onReset }) {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 mt-16 text-slate-500 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md overflow-hidden border border-primary/40 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-2xs">
            <img 
              src="/infoflip-logo.png" 
              alt="InfoFlip-AI" 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            InfoFlip<span className="text-primary dark:text-accent">-AI</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>Gen AI Platform for Automated Content Transformation</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>SIH Prototype • Problem Statement: SIH26154</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            onClick={onReset}
            className="text-primary dark:text-accent hover:underline font-semibold"
          >
            Reset Workspace
          </button>
        </div>

      </div>
    </footer>
  );
}
