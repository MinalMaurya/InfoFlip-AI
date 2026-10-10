import React from 'react';
import { MessageSquare, Repeat2, Heart } from 'lucide-react';

export default function TwitterPreview({
  content,
  isEditing,
  onUpdateContent,
  audience,
  language
}) {
  if (!content) return null;

  const posts = Array.isArray(content.posts)
    ? content.posts
    : (typeof content === 'string' ? [content] : []);

  const handlePostChange = (idx, newText) => {
    const updated = [...posts];
    updated[idx] = newText;
    onUpdateContent({
      ...content,
      posts: updated,
      characterCount: updated.reduce((a, b) => a + b.length, 0)
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-text-primary">
          Edit X / Twitter Posts ({posts.length} {posts.length > 1 ? 'posts in thread' : 'post'}):
        </label>
        {posts.map((postText, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="font-semibold">Post {idx + 1} of {posts.length}</span>
              <span className={postText.length > 280 ? 'text-error font-bold' : ''}>
                {postText.length} / 280 chars
              </span>
            </div>
            <textarea
              rows={4}
              value={postText}
              onChange={(e) => handlePostChange(idx, e.target.value)}
              className="w-full p-3 rounded-xl border border-input-border bg-input-bg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring font-sans leading-relaxed"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post, idx) => (
        <div
          key={idx}
          className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-2xs space-y-3 transition-colors"
        >
          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                𝕏
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-text-primary">
                    InfoFlip Alert
                  </span>
                  <span className="text-[11px] text-text-secondary">@infoflip_ai</span>
                  <span className="text-[10px] text-text-secondary">•</span>
                  <span className="text-[10px] text-text-secondary">Just now</span>
                </div>
                <div className="text-[10px] text-text-secondary">
                  Targeted for {audience} • {language}
                </div>
              </div>
            </div>

            {posts.length > 1 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-selected text-text-primary border border-border">
                {idx + 1} / {posts.length}
              </span>
            )}
          </div>

          {/* Post Text */}
          <div className="text-sm text-text-primary whitespace-pre-line leading-relaxed font-sans pl-1">
            {post}
          </div>

          {/* Simulated tweet metrics bar */}
          <div className="flex items-center justify-between pt-2 border-t border-divider text-xs text-text-secondary">
            <div className="flex items-center gap-1.5 hover:text-primary dark:hover:text-accent cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reply</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-success cursor-pointer">
              <Repeat2 className="w-3.5 h-3.5" />
              <span>Repost</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-error cursor-pointer">
              <Heart className="w-3.5 h-3.5" />
              <span>Like</span>
            </div>
            <div className="text-[11px] font-mono text-text-secondary">
              {post.length} chars
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
