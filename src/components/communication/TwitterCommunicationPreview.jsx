import React, { useState } from 'react';
import { MessageSquare, Copy, Check, Heart, Repeat, Bookmark, Share } from 'lucide-react';

export default function TwitterCommunicationPreview({
  content,
  structuredData,
  isEditing,
  onUpdateContent
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const text = typeof content === 'string' ? content : content?.content || '';

  // Extract thread posts if formatted with --- or stored in structuredData
  const posts = structuredData?.posts && Array.isArray(structuredData.posts)
    ? structuredData.posts
    : text.includes('\n\n---\n\n')
    ? text.split('\n\n---\n\n').map(p => p.trim()).filter(Boolean)
    : text.split(/(?=\n\d+\/\d+)/).map(p => p.trim()).filter(Boolean);

  const displayPosts = posts.length > 0 ? posts : [text];

  const handleCopySingle = async (postText, index) => {
    try {
      await navigator.clipboard.writeText(postText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy tweet:', err);
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy full thread:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Edit X / Twitter Content
          </label>
          <span className="text-xs text-slate-500">{text.length} characters</span>
        </div>
        <textarea
          rows={10}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-slate-900 text-sm font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
          placeholder="Enter X / Twitter posts (use '---' between thread posts)..."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header bar with thread count and copy all */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {displayPosts.length > 1 ? `Thread (${displayPosts.length} Posts)` : 'Single Tweet'}
          </span>
          {displayPosts.length > 1 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Thread Format
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copiedAll ? 'Thread Copied!' : 'Copy Entire Thread'}</span>
        </button>
      </div>

      {/* Posts list with thread connectors */}
      <div className="space-y-3">
        {displayPosts.map((postItem, idx) => {
          const charCount = postItem.length;
          const isOverLimit = charCount > 280;

          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs relative"
            >
              {/* Tweet Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                    𝕏
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        InfoFlip
                      </span>
                      <span className="text-xs text-slate-400">@InfoFlipAI</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-[11px] text-slate-400">Post {idx + 1} of {displayPosts.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                    isOverLimit
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {charCount}/280
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopySingle(postItem, idx)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Copy this post"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Tweet Text */}
              <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed pl-10 font-sans">
                {postItem}
              </div>

              {/* Tweet Metrics Bar */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 pl-10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1 hover:text-sky-500 transition-colors cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex items-center gap-1 hover:text-emerald-500 transition-colors cursor-pointer">
                    <Repeat className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer">
                    <Heart className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex items-center gap-1 hover:text-sky-500 transition-colors cursor-pointer">
                    <Bookmark className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex items-center gap-1 hover:text-sky-500 transition-colors cursor-pointer">
                    <Share className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
