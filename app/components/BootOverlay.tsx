"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Short terminal "boot" sequences typed out when a page opens.
const SEQUENCES: Record<string, string[]> = {
  "/": ["$ ssh siddharth@portfolio", "> connecting...", "> welcome, Siddharth Singh ✓"],
  "/education": ["$ cat ~/education.md", "> loading records...", "> 2 institutions ✓"],
  "/projects": ["$ ls ~/projects", "> indexing...", "> 4 projects found ✓"],
  "/skills": ["$ cd ~/skills", "> loading skill tree...", "> skills loaded ✓"],
  "/volunteering": ["$ cat ~/volunteering.log", "> reading entries...", "> 3 entries ✓"],
  "/contact": ["$ ./connect.sh", "> opening channels...", "> ready ✓"],
};

const DEFAULT_SEQUENCE = ["$ cd ~/portfolio", "> loading...", "> ready ✓"];

export default function BootOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [text, setText] = useState("");

  const timerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  function finish() {
    cancelledRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 450);
  }

  useEffect(() => {
    cancelledRef.current = false;
    setVisible(true);
    setLeaving(false);
    setText("");

    const lines = SEQUENCES[pathname] ?? DEFAULT_SEQUENCE;
    const full = lines.join("\n");

    // Respect reduced-motion: show instantly, brief hold, then reveal.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setText(full);
      timerRef.current = window.setTimeout(() => {
        setLeaving(true);
        timerRef.current = window.setTimeout(() => setVisible(false), 450);
      }, 500);
      return () => {
        cancelledRef.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    let i = 0;
    const typeNext = () => {
      if (cancelledRef.current) return;
      i += 1;
      setText(full.slice(0, i));
      if (i < full.length) {
        const justTyped = full[i - 1];
        timerRef.current = window.setTimeout(typeNext, justTyped === "\n" ? 180 : 24);
      } else {
        // Finished typing — hold briefly, then fade out to reveal the page.
        timerRef.current = window.setTimeout(() => {
          if (cancelledRef.current) return;
          setLeaving(true);
          timerRef.current = window.setTimeout(() => setVisible(false), 450);
        }, 400);
      }
    };
    timerRef.current = window.setTimeout(typeNext, 250);

    return () => {
      cancelledRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      onClick={finish}
      role="presentation"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-700 bg-[#0c0c0e] font-mono shadow-2xl">
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-zinc-500">siddharth@portfolio: ~</span>
        </div>
        <pre className="min-h-[6rem] whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-green-400">
          {text}
          <span className="ml-0.5 inline-block animate-pulse">▌</span>
        </pre>
      </div>
      <span className="pointer-events-none absolute bottom-6 text-xs text-zinc-500">
        click to skip
      </span>
    </div>
  );
}
