"use client";

import { useEffect, useRef, useState } from "react";

type Star = {
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
};

type Shoot = { id: number; top: string; left: string };

// Static cloud config (no randomness -> no hydration mismatch). Spread over
// the full height with varied speeds; the large negative delays stagger both
// their entry times and their start positions, so the sky stays scattered
// with clouds at all times rather than arriving in one bunch.
const CLOUDS = [
  { top: "6%", scale: 1.0, duration: 58, delay: -8 },
  { top: "14%", scale: 0.55, duration: 72, delay: -40 },
  { top: "22%", scale: 1.25, duration: 50, delay: -22 },
  { top: "30%", scale: 0.7, duration: 66, delay: -55 },
  { top: "38%", scale: 0.95, duration: 46, delay: -12 },
  { top: "46%", scale: 1.1, duration: 78, delay: -60 },
  { top: "54%", scale: 0.6, duration: 54, delay: -30 },
  { top: "62%", scale: 0.85, duration: 70, delay: -48 },
  { top: "70%", scale: 1.15, duration: 52, delay: -18 },
  { top: "18%", scale: 0.5, duration: 84, delay: -70 },
  { top: "50%", scale: 0.75, duration: 60, delay: -5 },
  { top: "78%", scale: 0.65, duration: 76, delay: -38 },
];

// Fixed sky background behind everything:
//  - dark mode  -> night sky: twinkling stars, a moon, occasional shooting star
//  - light mode -> morning sky: warm gradient with a sun
export default function StarsBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [shoot, setShoot] = useState<Shoot | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    setStars(
      Array.from({ length: 140 }, () => ({
        top: `${rand(0, 100)}%`,
        left: `${rand(0, 100)}%`,
        size: rand(1, 2.6),
        duration: rand(1.8, 5),
        delay: rand(0, 5),
      }))
    );

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    // One shooting star every 25s–60s.
    let spawnTimer: number;
    let clearTimer: number;
    const schedule = () => {
      const wait = rand(25000, 60000);
      spawnTimer = window.setTimeout(() => {
        idRef.current += 1;
        setShoot({
          id: idRef.current,
          top: `${rand(0, 40)}%`,
          left: `${rand(45, 90)}%`,
        });
        clearTimer = window.setTimeout(() => setShoot(null), 1700);
        schedule();
      }, wait);
    };
    schedule();

    return () => {
      clearTimeout(spawnTimer);
      clearTimeout(clearTimer);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(to_bottom,#9ed8ff_0%,#cfeeff_42%,#ffe9cf_100%)] dark:bg-[radial-gradient(ellipse_at_top,#1b2735_0%,#0a0c12_60%,#06070b_100%)]"
    >
      {/* SUN — light (morning) mode */}
      <div className="absolute right-[12%] top-[12%] h-24 w-24 rounded-full bg-[radial-gradient(circle,#fffdf0_0%,#ffe487_55%,#ffd25e_100%)] shadow-[0_0_90px_36px_rgba(255,214,110,0.55)] dark:hidden" />

      {/* CLOUDS — light (morning) mode, drifting left to right */}
      <div className="dark:hidden">
        {CLOUDS.map((c, i) => (
          <div
            key={`cloud-${i}`}
            className="cloud absolute left-0"
            style={{
              top: c.top,
              animation: `drift ${c.duration}s linear ${c.delay}s infinite`,
            }}
          >
            <div
              className="relative h-16 w-48 opacity-80"
              style={{ transform: `scale(${c.scale})` }}
            >
              <span className="absolute bottom-2 left-2 h-10 w-24 rounded-full bg-white blur-[6px]" />
              <span className="absolute bottom-3 left-12 h-14 w-24 rounded-full bg-white blur-[6px]" />
              <span className="absolute bottom-2 left-24 h-10 w-24 rounded-full bg-white blur-[6px]" />
            </div>
          </div>
        ))}
      </div>

      {/* MOON — dark (night) mode */}
      <div className="absolute right-[12%] top-[12%] hidden h-20 w-20 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#dfe3ec_60%,#aab2c2_100%)] shadow-[0_0_60px_22px_rgba(210,224,255,0.25)] dark:block">
        <span className="absolute left-[28%] top-[30%] h-2.5 w-2.5 rounded-full bg-black/10" />
        <span className="absolute left-[55%] top-[55%] h-3.5 w-3.5 rounded-full bg-black/10" />
        <span className="absolute left-[62%] top-[24%] h-2 w-2 rounded-full bg-black/10" />
      </div>

      {/* STARS + shooting star — dark mode only */}
      <div className="hidden dark:block">
        {stars.map((s, i) => (
          <span
            key={`star-${i}`}
            className="twinkle-star absolute rounded-full bg-white"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}

        {shoot && (
          <span
            key={shoot.id}
            className="shooting-star absolute"
            style={{
              top: shoot.top,
              left: shoot.left,
              width: "100px",
              height: "2px",
              borderRadius: "9999px",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)",
              animation: "shootOnce 1.6s ease-out forwards",
            }}
          />
        )}
      </div>
    </div>
  );
}
