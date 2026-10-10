import React, { useState } from 'react';
import { Hash, Copy, Check } from 'lucide-react';

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
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Edit Hashtag Suggestions
          </label>
          <span className="text-xs text-text-secondary">{text.length} characters</span>
        </div>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="w-full p-4 rounded-2xl border border-input-border bg-input-bg text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring leading-relaxed"
          placeholder="Enter hashtags (e.g. #Topic #Important)..."
        />
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-2xs space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-divider">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xs">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">
              Topic-Grounded Hashtag Suggestions
            </h4>
            <p className="text-xs text-text-secondary">
              {tags.length} hashtags generated strictly from source topics, entities, and category.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sidebar-bg hover:bg-surface-hover text-text-primary border border-border transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {copiedAll ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
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
              className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-surface-selected hover:bg-surface-hover text-text-primary text-xs font-bold transition-all shadow-2xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              title="Click to copy this hashtag"
            >
              <Hash className="w-3 h-3 text-primary dark:text-accent" />
              <span>{tag.replace(/^#/, '')}</span>
              {copiedTag === tag ? (
                <Check className="w-3 h-3 text-success ml-1" />
              ) : (
                <Copy className="w-3 h-3 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-sm text-text-primary whitespace-pre-line leading-relaxed font-sans">
          {text}
        </div>
      )}
    </div>
  );
}
