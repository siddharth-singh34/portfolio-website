"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Extra classes for the wrapper (e.g. layout/flex classes). */
  className?: string;
  /** Delay before the pop-in starts, in ms (use to stagger items). */
  delay?: number;
  /** Re-run the animation every time it scrolls back into view. */
  repeat?: boolean;
  /**
   * IntersectionObserver rootMargin. Use a negative bottom value (e.g.
   * "0px 0px -20% 0px") so the element only reveals once it's scrolled
   * well into view rather than the moment it peeks over the fold.
   */
  rootMargin?: string;
};

// Wraps content and "pops" it in (fade + rise + slight scale) once it
// scrolls into view. Elements already on screen at load animate immediately.
export default function Reveal({
  children,
  className = "",
  delay = 0,
  repeat = false,
  rootMargin = "0px",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (!repeat) observer.unobserve(el);
        } else if (repeat) {
          setShown(false);
        }
      },
      { threshold: 0.15, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [repeat, rootMargin]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        shown
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95 motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}
