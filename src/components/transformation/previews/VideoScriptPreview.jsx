import React from 'react';
import { Video, Clock, Film, Volume2, Type } from 'lucide-react';

export default function VideoScriptPreview({
  content,
  isEditing,
  onUpdateContent
}) {
  if (!content) return null;

  const title = content.title || 'Video Script Storyboard';
  const durationEstimate = content.durationEstimate || '60-90 seconds';
  const scenes = Array.isArray(content.scenes) ? content.scenes : [];

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Script Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateContent({ ...content, title: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Scenes ({scenes.length}):
          </label>
          {scenes.map((scene, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-rose-600">Scene {scene.sceneNumber || idx + 1}</span>
              <div>
                <label className="block text-[11px] text-slate-500">Narration (Voiceover):</label>
                <textarea
                  rows={2}
                  value={scene.narration || ''}
                  onChange={(e) => {
                    const updated = [...scenes];
                    updated[idx] = { ...scene, narration: e.target.value };
                    onUpdateContent({ ...content, scenes: updated });
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-6">
      {/* Script Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              Video Script & Storyboard (Ready for Module 5)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-rose-500" />
          <span>Estimated Duration: {durationEstimate}</span>
        </div>
      </div>

      {/* Storyboard Table / Cards */}
      <div className="space-y-3">
        {scenes.map((scene, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5"
          >
            {/* Scene Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center">
                  {scene.sceneNumber || idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Scene {scene.sceneNumber || idx + 1}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {scene.duration || '15s'}
              </span>
            </div>

            {/* Visual Directions */}
            <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Film className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-700 dark:text-slate-300">Visual: </strong>
                <span>{scene.visual}</span>
              </div>
            </div>

            {/* Narration Script */}
            <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/70 dark:border-slate-800 font-sans">
              <Volume2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Voiceover: </strong>
                <span className="leading-relaxed">"{scene.narration}"</span>
              </div>
            </div>

            {/* On Screen Text */}
            {scene.onScreenText && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-1">
                <Type className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  <strong>On-Screen Text: </strong>
                  <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200">
                    {scene.onScreenText}
                  </span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
