import React from 'react';
import { Share2, Hash, ArrowUpRight, Check, Copy } from 'lucide-react';

export default function LinkedInPreview({
  content,
  isEditing,
  onUpdateContent,
  audience,
  tone,
  language
}) {
  if (!content) return null;

  const text = typeof content === 'string' ? content : content.text || '';
  const headline = content.headline || '';
  const hashtags = Array.isArray(content.hashtags) ? content.hashtags : [];
  const cta = content.cta || '';

  const handleTextChange = (e) => {
    if (typeof content === 'string') {
      onUpdateContent(e.target.value);
    } else {
      onUpdateContent({
        ...content,
        text: e.target.value
      });
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Edit LinkedIn Post Text:
        </label>
        <textarea
          rows={12}
          value={text}
          onChange={handleTextChange}
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
          placeholder="Enter LinkedIn post content..."
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* LinkedIn Post Header Simulation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            in
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Official Broadcast Feed
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900">
                {language}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Targeted for {audience} • {tone} Tone
            </p>
          </div>
        </div>
      </div>

      {/* Headline / Hook */}
      {headline && (
        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-200">
          {headline}
        </div>
      )}

      {/* Main Post Body */}
      <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans space-y-2">
        {text}
      </div>

      {/* Hashtag Bar */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {hashtags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
            >
              <Hash className="w-3 h-3" />
              <span>{tag.replace(/^#/, '')}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
