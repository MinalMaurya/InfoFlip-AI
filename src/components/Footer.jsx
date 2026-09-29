import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer({ onReset }) {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800">
            InfoFlip<span className="text-indigo-600">-AI</span>
          </span>
          <span className="text-slate-300">|</span>
          <span>Gen AI Platform for Automated Content Transformation</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>Smart India Hackathon (SIH) Prototype</span>
          <span className="text-slate-300">•</span>
          <button
            onClick={onReset}
            className="text-indigo-600 hover:underline font-semibold"
          >
            Reset Workspace
          </button>
        </div>

      </div>
    </footer>
  );
}
