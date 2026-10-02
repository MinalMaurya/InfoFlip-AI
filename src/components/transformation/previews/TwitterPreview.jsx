import React from 'react';
import { MessageSquare, Hash, Repeat2, Heart, Share, ShieldCheck } from 'lucide-react';

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
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Edit X / Twitter Posts ({posts.length} {posts.length > 1 ? 'posts in thread' : 'post'}):
        </label>
        {posts.map((postText, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Post {idx + 1} of {posts.length}</span>
              <span className={postText.length > 280 ? 'text-rose-500 font-bold' : ''}>
                {postText.length} / 280 chars
              </span>
            </div>
            <textarea
              rows={4}
              value={postText}
              onChange={(e) => handlePostChange(idx, e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans leading-relaxed"
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
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3"
        >
          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                𝕏
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    InfoFlip Alert
                  </span>
                  <span className="text-[11px] text-slate-400">@infoflip_ai</span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Targeted for {audience} • {language}
                </div>
              </div>
            </div>

            {posts.length > 1 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900">
                {idx + 1} / {posts.length}
              </span>
            )}
          </div>

          {/* Post Text */}
          <div className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed font-sans pl-1">
            {post}
          </div>

          {/* Simulated tweet metrics bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 hover:text-sky-500 cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reply</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-emerald-500 cursor-pointer">
              <Repeat2 className="w-3.5 h-3.5" />
              <span>Repost</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-rose-500 cursor-pointer">
              <Heart className="w-3.5 h-3.5" />
              <span>Like</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {post.length} chars
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
