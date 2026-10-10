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
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Edit X / Twitter Content
          </label>
          <span className="text-xs text-text-secondary">{text.length} characters</span>
        </div>
        <textarea
          rows={10}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-input-border bg-input-bg text-sm font-sans text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring leading-relaxed"
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
          <span className="text-xs font-bold text-text-primary">
            {displayPosts.length > 1 ? `Thread (${displayPosts.length} Posts)` : 'Single Tweet'}
          </span>
          {displayPosts.length > 1 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-selected text-text-primary border border-border">
              Thread Format
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface border border-border hover:bg-surface-hover text-text-primary transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
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
              className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-2xs relative transition-colors"
            >
              {/* Tweet Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    𝕏
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-text-primary">
                        InfoFlip
                      </span>
                      <span className="text-xs text-text-secondary">@InfoFlipAI</span>
                      <span className="text-xs text-text-secondary">·</span>
                      <span className="text-[11px] text-text-secondary">Post {idx + 1} of {displayPosts.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                    isOverLimit
                      ? 'bg-error-subtle text-error border border-error/30'
                      : 'bg-sidebar-bg text-text-secondary border border-border'
                  }`}>
                    {charCount}/280
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopySingle(postItem, idx)}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    title="Copy this post"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Tweet Text */}
              <div className="text-sm text-text-primary whitespace-pre-line leading-relaxed pl-10 font-sans">
                {postItem}
              </div>

              {/* Tweet Metrics Bar */}
              <div className="pt-3 mt-3 border-t border-divider pl-10 flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1 hover:text-primary dark:hover:text-accent transition-colors cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex items-center gap-1 hover:text-success transition-colors cursor-pointer">
                    <Repeat className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex items-center gap-1 hover:text-error transition-colors cursor-pointer">
                    <Heart className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex items-center gap-1 hover:text-primary dark:hover:text-accent transition-colors cursor-pointer">
                    <Bookmark className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex items-center gap-1 hover:text-primary dark:hover:text-accent transition-colors cursor-pointer">
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
