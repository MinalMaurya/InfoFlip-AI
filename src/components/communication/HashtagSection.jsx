import React, { useState } from 'react';
import { Hash, Copy, Check, Sparkles } from 'lucide-react';

export default function HashtagSection({
  content,
  structuredData,
  isEditing,
  onUpdateContent
}) {
  const [copiedTag, setCopiedTag] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const text = typeof content === 'string' ? content : content?.content || '';

  // Extract tags from structuredData or regex match hashtags from text
  const tags = structuredData?.tags && Array.isArray(structuredData.tags)
    ? structuredData.tags
    : (text.match(/#[a-zA-Z0-9_\u0900-\u097F]+/g) || []);

  const handleCopyTag = async (tag) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(null), 2000);
    } catch (err) {
      console.error('Failed to copy hashtag:', err);
    }
  };

  const handleCopyAll = async () => {
    try {
      const allText = tags.length > 0 ? tags.join(' ') : text;
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy all hashtags:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Edit Hashtag Suggestions
          </label>
          <span className="text-xs text-slate-500">{text.length} characters</span>
        </div>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-white dark:bg-slate-900 text-sm font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed font-mono"
          placeholder="Enter hashtags (e.g. #Topic #Important)..."
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Topic-Grounded Hashtag Suggestions
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tags.length} hashtags generated strictly from source topics, entities, and category.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copiedAll ? 'All Copied!' : 'Copy All Tags'}</span>
        </button>
      </div>

      {/* Hashtag Cloud */}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2.5 pt-2">
          {tags.map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleCopyTag(tag)}
              className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/60 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-xs font-bold transition-all shadow-2xs active:scale-95"
              title="Click to copy this hashtag"
            >
              <Hash className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span>{tag.replace(/^#/, '')}</span>
              {copiedTag === tag ? (
                <Check className="w-3 h-3 text-emerald-600 ml-1" />
              ) : (
                <Copy className="w-3 h-3 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
          {text}
        </div>
      )}
    </div>
  );
}
