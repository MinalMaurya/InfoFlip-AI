import React, { useEffect, useRef, useState } from 'react';

/**
 * Hook to trigger a one-time scroll reveal animation using IntersectionObserver.
 * Respects prefers-reduced-motion and provides an automatic fallback timer so content
 * is never permanently hidden if an observer fails or in unsupported environments.
 */
export function useScrollReveal(options = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px', once = true } = options;
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect user's reduced-motion preference immediately
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      return;
    }

    // Fallback if IntersectionObserver is unsupported
    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    // Safety fallback: auto-reveal if observer doesn't trigger within 2.5s (e.g. odd test runtimes)
    const fallbackTimer = setTimeout(() => {
      setIsRevealed(true);
    }, 2500);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            clearTimeout(fallbackTimer);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsRevealed(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      clearTimeout(fallbackTimer);
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, once]);

  return [elementRef, isRevealed];
}

/**
 * ScrollReveal Component
 * Smooth scroll-triggered fade-in & subtle vertical movement (26px, 700ms, ease-out).
 * Supports stagger delay for sequential card animations.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  as: Component = 'div',
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  ...props
}) {
  const [ref, isRevealed] = useScrollReveal({ threshold, rootMargin });

  return (
    <Component
      ref={ref}
      className={`reveal-on-scroll ${isRevealed ? 'is-visible' : ''} ${className}`}
      style={{
        transitionDelay: isRevealed ? `${delay}ms` : '0ms',
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
