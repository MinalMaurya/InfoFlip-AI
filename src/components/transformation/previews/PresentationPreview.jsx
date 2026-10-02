import React, { useState } from 'react';
import { Presentation, ChevronLeft, ChevronRight, Mic, LayoutGrid, Check } from 'lucide-react';

export default function PresentationPreview({
  content,
  isEditing,
  onUpdateContent
}) {
  if (!content) return null;

  const title = content.title || 'Slide Deck Presentation';
  const slides = Array.isArray(content.slides) ? content.slides : [];
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const currentSlide = slides[activeSlideIndex] || slides[0] || {};

  const handleNextSlide = () => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Deck Master Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateContent({ ...content, title: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Slide {activeSlideIndex + 1} of {slides.length}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handlePrevSlide}
                disabled={activeSlideIndex === 0}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                disabled={activeSlideIndex === slides.length - 1}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Slide Title:
            </label>
            <input
              type="text"
              value={currentSlide.title || ''}
              onChange={(e) => {
                const updatedSlides = [...slides];
                updatedSlides[activeSlideIndex] = { ...currentSlide, title: e.target.value };
                onUpdateContent({ ...content, slides: updatedSlides });
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bullet Points (one per line):
            </label>
            <textarea
              rows={4}
              value={(currentSlide.bullets || []).join('\n')}
              onChange={(e) => {
                const updatedSlides = [...slides];
                updatedSlides[activeSlideIndex] = { ...currentSlide, bullets: e.target.value.split('\n').filter(Boolean) };
                onUpdateContent({ ...content, slides: updatedSlides });
              }}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xs space-y-6">
      {/* Deck Header & Slide Navigator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-200 dark:border-violet-800">
              Presentation Deck Structure (Ready for Module 5)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>

        {/* Slide Counter & Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevSlide}
            disabled={activeSlideIndex === 0}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-1">
            Slide {activeSlideIndex + 1} of {slides.length}
          </span>
          <button
            type="button"
            onClick={handleNextSlide}
            disabled={activeSlideIndex === slides.length - 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas (16:9 Presentation Aspect Ratio feel) */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-800 space-y-5 min-h-[260px] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
            <span className="font-semibold uppercase tracking-wider">
              {currentSlide.purpose || 'Presentation Slide'}
            </span>
            <span className="font-mono text-[11px] opacity-75">
              SLIDE 0{currentSlide.slideNumber || activeSlideIndex + 1}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-4">
            {currentSlide.title}
          </h2>

          <ul className="space-y-2.5">
            {(currentSlide.bullets || []).map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>InfoFlip-AI GenAI Content Transformation</span>
          <span>Confidential & Verified</span>
        </div>
      </div>

      {/* Speaker Notes Drawer */}
      {currentSlide.speakerNotes && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Mic className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Speaker Notes (Talking Points):</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            {currentSlide.speakerNotes}
          </p>
        </div>
      )}

      {/* Thumbnail Bar */}
      <div className="grid grid-cols-5 gap-2 pt-1">
        {slides.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveSlideIndex(idx)}
            className={`p-2 rounded-xl text-left border transition-all text-xs ${
              idx === activeSlideIndex
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 font-bold text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-400/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="text-[10px] text-slate-400 font-mono mb-0.5">0{s.slideNumber || idx + 1}</div>
            <div className="truncate text-[11px]">{s.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
