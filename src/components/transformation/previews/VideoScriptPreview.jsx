import React from 'react';
import { Clock, Film, Volume2, Type } from 'lucide-react';

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
          <label className="block text-xs font-semibold text-text-primary mb-1">
            Script Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateContent({ ...content, title: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-input-border bg-input-bg text-text-primary text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-text-primary">
            Scenes ({scenes.length}):
          </label>
          {scenes.map((scene, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-border bg-surface space-y-2">
              <span className="text-xs font-bold text-primary dark:text-accent">Scene {scene.sceneNumber || idx + 1}</span>
              <div>
                <label className="block text-[11px] text-text-secondary mb-1">Narration (Voiceover):</label>
                <textarea
                  rows={2}
                  value={scene.narration || ''}
                  onChange={(e) => {
                    const updated = [...scenes];
                    updated[idx] = { ...scene, narration: e.target.value };
                    onUpdateContent({ ...content, scenes: updated });
                  }}
                  className="w-full p-2 rounded-lg border border-input-border bg-input-bg text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-focus-ring"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-2xs space-y-6 transition-colors">
      {/* Script Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-divider">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary bg-surface-selected px-2.5 py-0.5 rounded-full border border-border">
              Video Script & Storyboard (Ready for Module 5)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-text-primary">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sidebar-bg border border-border text-text-primary text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-primary dark:text-accent" />
          <span>Estimated Duration: {durationEstimate}</span>
        </div>
      </div>

      {/* Storyboard Table / Cards */}
      <div className="space-y-3">
        {scenes.map((scene, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-sidebar-bg dark:bg-surface-elevated border border-border space-y-2.5"
          >
            {/* Scene Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-surface-selected border border-border text-text-primary font-bold text-xs flex items-center justify-center">
                  {scene.sceneNumber || idx + 1}
                </span>
                <span className="text-xs font-bold text-text-primary">
                  Scene {scene.sceneNumber || idx + 1}
                </span>
              </div>
              <span className="text-[11px] font-mono text-text-secondary">
                {scene.duration || '15s'}
              </span>
            </div>

            {/* Visual Directions */}
            <div className="flex items-start gap-2 text-xs text-text-secondary">
              <Film className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-primary">Visual: </strong>
                <span>{scene.visual}</span>
              </div>
            </div>

            {/* Narration Script */}
            <div className="flex items-start gap-2 text-xs sm:text-sm text-text-primary bg-surface p-3 rounded-lg border border-border font-sans">
              <Volume2 className="w-4 h-4 text-primary dark:text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-primary">Voiceover: </strong>
                <span className="leading-relaxed">"{scene.narration}"</span>
              </div>
            </div>

            {/* On Screen Text */}
            {scene.onScreenText && (
              <div className="flex items-center gap-2 text-xs text-text-secondary pl-1">
                <Type className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
                <span>
                  <strong className="text-text-primary">On-Screen Text: </strong>
                  <span className="font-mono text-[11px] bg-surface-selected border border-border px-1.5 py-0.5 rounded text-text-primary">
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
