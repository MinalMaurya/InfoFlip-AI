import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ variant = 'compact' }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);

  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  // Close dropdown when clicking/tapping outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideInteraction(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMenuKeyDown = (event, index) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % options.length;
      itemRefs.current[nextIndex]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (index - 1 + options.length) % options.length;
      itemRefs.current[prevIndex]?.focus();
    }
  };

  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label="Theme selection"
        className="flex items-center p-1 rounded-xl bg-sidebar-bg border border-border text-xs font-semibold"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              role="radio"
              aria-checked={isSelected}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                isSelected
                  ? 'bg-surface-selected text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default compact dropdown button anchored to top navigation bar
  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Current theme: ${theme}. Click to change theme.`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-surface text-text-primary hover:bg-surface-hover text-xs font-medium transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        <CurrentIcon className="w-4 h-4 text-primary dark:text-accent shrink-0" />
        <span className="hidden sm:inline capitalize">{theme}</span>
        <ChevronDown className={`w-3 h-3 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Theme options"
          className="absolute right-0 top-full mt-1.5 w-40 py-1.5 bg-surface-elevated rounded-xl shadow-xl border border-border z-50 text-xs"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)'
          }}
        >
          {options.map((opt, idx) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                role="menuitemradio"
                aria-checked={isSelected}
                type="button"
                onKeyDown={(e) => handleMenuKeyDown(e, idx)}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring ${
                  isSelected
                    ? 'bg-surface-selected text-text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary dark:text-accent' : 'text-text-secondary'}`} />
                <span className="flex-1">{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
