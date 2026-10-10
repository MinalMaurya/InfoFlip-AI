import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Mic } from 'lucide-react';

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
          <label className="block text-xs font-semibold text-text-primary mb-1">
            Deck Master Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateContent({ ...content, title: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-input-border bg-input-bg text-text-primary text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="font-semibold">Slide {activeSlideIndex + 1} of {slides.length}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handlePrevSlide}
                disabled={activeSlideIndex === 0}
                className="px-2 py-1 rounded bg-sidebar-bg border border-border text-text-primary disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                disabled={activeSlideIndex === slides.length - 1}
                className="px-2 py-1 rounded bg-sidebar-bg border border-border text-text-primary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
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
              className="w-full p-2.5 rounded-xl border border-input-border bg-input-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
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
              className="w-full p-3 rounded-xl border border-input-border bg-input-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-2xs space-y-6 transition-colors">
      {/* Deck Header & Slide Navigator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-divider">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary bg-surface-selected px-2.5 py-0.5 rounded-full border border-border">
              Presentation Deck Structure (Ready for Module 5)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary">
            {title}
          </h3>
        </div>

        {/* Slide Counter & Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevSlide}
            disabled={activeSlideIndex === 0}
            className="p-1.5 rounded-lg border border-border bg-surface text-text-primary hover:bg-surface-hover disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-text-secondary px-1">
            Slide {activeSlideIndex + 1} of {slides.length}
          </span>
          <button
            type="button"
            onClick={handleNextSlide}
            disabled={activeSlideIndex === slides.length - 1}
            className="p-1.5 rounded-lg border border-border bg-surface text-text-primary hover:bg-surface-hover disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas (Theme-responsive 16:9 Presentation Canvas) */}
      <div className="relative rounded-2xl bg-sidebar-bg dark:bg-surface-elevated text-text-primary p-6 sm:p-8 shadow-xs border border-border space-y-5 min-h-[260px] flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between text-xs text-primary dark:text-accent mb-2">
            <span className="font-semibold uppercase tracking-wider">
              {currentSlide.purpose || 'Presentation Slide'}
            </span>
            <span className="font-mono text-[11px] text-text-secondary">
              SLIDE 0{currentSlide.slideNumber || activeSlideIndex + 1}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mb-4">
            {currentSlide.title}
          </h2>

          <ul className="space-y-2.5">
            {(currentSlide.bullets || []).map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-primary leading-relaxed">
                <span className="text-primary dark:text-accent font-bold shrink-0 mt-0.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-divider flex items-center justify-between text-[11px] text-text-secondary">
          <span>InfoFlip-AI GenAI Content Transformation</span>
          <span>Source-Grounded Slide Outline</span>
        </div>
      </div>

      {/* Speaker Notes Drawer */}
      {currentSlide.speakerNotes && (
        <div className="p-3.5 rounded-xl bg-sidebar-bg border border-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
            <Mic className="w-3.5 h-3.5 text-primary dark:text-accent" />
            <span>Speaker Notes (Talking Points):</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed font-sans">
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
            className={`p-2 rounded-xl text-left border transition-all text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              idx === activeSlideIndex
                ? 'border-primary bg-surface-selected font-bold text-text-primary'
                : 'border-border bg-surface hover:bg-surface-hover text-text-secondary'
            }`}
          >
            <div className="text-[10px] text-text-secondary font-mono mb-0.5">0{s.slideNumber || idx + 1}</div>
            <div className="truncate text-[11px]">{s.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
