import React from 'react';
import { Hash } from 'lucide-react';

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
        <label className="block text-xs font-semibold text-text-primary">
          Edit LinkedIn Post Text:
        </label>
        <textarea
          rows={12}
          value={text}
          onChange={handleTextChange}
          className="w-full p-4 rounded-xl border border-input-border bg-input-bg text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring leading-relaxed"
          placeholder="Enter LinkedIn post content..."
        />
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 sm:p-6 shadow-2xs space-y-4 transition-colors">
      {/* LinkedIn Post Header Simulation */}
      <div className="flex items-center justify-between pb-3 border-b border-divider">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-2xs">
            in
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-primary">
                Official Broadcast Feed
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-selected text-text-primary font-semibold border border-border">
                {language}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Targeted for {audience} • {tone} Tone
            </p>
          </div>
        </div>
      </div>

      {/* Headline / Hook */}
      {headline && (
        <div className="p-3 rounded-xl bg-surface-selected/60 border border-border text-xs sm:text-sm font-bold text-text-primary">
          {headline}
        </div>
      )}

      {/* Main Post Body */}
      <div className="text-sm text-text-primary whitespace-pre-line leading-relaxed font-sans space-y-2">
        {text}
      </div>

      {/* Hashtag Bar */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {hashtags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-sidebar-bg border border-border text-primary dark:text-accent"
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
