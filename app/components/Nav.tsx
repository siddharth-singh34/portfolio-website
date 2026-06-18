"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

type LinkItem = { label: string; href: string };

const educationLinks: LinkItem[] = [
  { label: "Sahyadri School - India", href: "/education#sahyadri" },
  { label: "The University of Hong Kong", href: "/education#hku" },
];

const projectLinks: LinkItem[] = [
  { label: "Conway's Game of Life", href: "/projects#game-of-life" },
  { label: "Boolean Expression Evaluator", href: "/projects#boolean-evaluator" },
  { label: "Aston Villa Regression Model", href: "/projects#aston-villa" },
  { label: "Sleep & Social Media Study", href: "/projects#sleep-study" },
];

const volunteeringLinks: LinkItem[] = [
  { label: "Research Volunteer · Sahyadri School", href: "/volunteering#research-volunteer-sahyadri" },
  { label: "Community Volunteer · Samaj Pragati Sahayog", href: "/volunteering#samaj-pragati-sahayog" },
  { label: "Community Volunteer · Anandwan Ashram", href: "/volunteering#anandwan-ashram" },
];

const navCls = (active: boolean) =>
  `rounded-full px-3 py-1.5 transition ${
    active ? "font-bold text-fg" : "text-muted hover:bg-chip hover:text-fg"
  }`;
const dropdownLink =
  "block rounded-xl px-3 py-2 text-fg-soft transition hover:bg-chip hover:text-fg";

// Desktop hover dropdown.
function Dropdown({
  label,
  href,
  links,
  width,
  active,
}: {
  label: string;
  href: string;
  links: LinkItem[];
  width: string;
  active: boolean;
}) {
  return (
    <div className="relative group">
      <a href={href} className={navCls(active)}>
        {label}
      </a>
      {/* pt-3 is a hover "bridge" so the menu stays open as the mouse moves down */}
      <div className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-3 group-hover:block">
        <div className={`${width} rounded-2xl border border-line bg-surface p-1 shadow-xl`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} className={dropdownLink}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile click-to-expand accordion section.
function MobileSection({
  label,
  href,
  links,
  onNavigate,
  active,
}: {
  label: string;
  href: string;
  links: LinkItem[];
  onNavigate: () => void;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line">
      <div className="flex items-center justify-between">
        <a
          href={href}
          onClick={onNavigate}
          className={`flex-1 rounded-lg px-3 py-3 text-fg transition hover:bg-chip ${
            active ? "font-bold" : "font-medium"
          }`}
        >
          {label}
        </a>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
          aria-expanded={open}
          className="mr-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-chip hover:text-fg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* grid-rows 0fr -> 1fr gives a smooth height animation */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] pb-2" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={onNavigate}
              className="block rounded-lg px-5 py-2 text-sm text-fg-soft transition hover:bg-chip hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* DESKTOP: floating pill with hover dropdowns (shown when there's room) */}
      <div className="sticky top-0 z-30 hidden items-center justify-center gap-2 px-4 pt-4 md:flex">
        <nav className="flex items-center gap-1 rounded-full border border-line bg-surface/70 px-2 py-1.5 text-sm shadow-lg backdrop-blur">
          <a
            href="/"
            className="rounded-full px-3 py-1.5 font-semibold text-fg transition hover:bg-chip"
          >
            Siddharth Singh
          </a>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <Dropdown
            label="Education"
            href="/education"
            links={educationLinks}
            width="w-64"
            active={isActive("/education")}
          />
          <Dropdown
            label="Projects"
            href="/projects"
            links={projectLinks}
            width="w-64"
            active={isActive("/projects")}
          />
          <a href="/skills" className={navCls(isActive("/skills"))}>
            Skills
          </a>
          <Dropdown
            label="Volunteering"
            href="/volunteering"
            links={volunteeringLinks}
            width="w-72"
            active={isActive("/volunteering")}
          />
          <a href="/contact" className={navCls(isActive("/contact"))}>
            Contact
          </a>
        </nav>

        {/* Theme toggle as a separate circle button next to the pill */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/70 shadow-lg backdrop-blur">
          <ThemeToggle />
        </div>
      </div>

      {/* MOBILE: compact bar with hamburger (shown when the full nav won't fit) */}
      <div className="sticky top-0 z-30 flex items-center justify-center gap-2 px-4 pt-4 md:hidden">
        <nav className="flex flex-1 items-center justify-between rounded-full border border-line bg-surface/70 px-3 py-2 shadow-lg backdrop-blur">
          <a href="/" className="px-2 font-semibold text-fg">
            Siddharth Singh
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-chip hover:text-fg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>

        {/* Theme toggle as a separate circle button next to the bar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface/70 shadow-lg backdrop-blur">
          <ThemeToggle />
        </div>
      </div>

      {/* MOBILE: dim overlay */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* MOBILE: slide-in panel from the right */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-72 max-w-[80%] flex-col border-l border-line bg-surface shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <span className="font-semibold text-fg">Menu</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-chip hover:text-fg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col overflow-y-auto p-2">
          <MobileSection
            label="Education"
            href="/education"
            links={educationLinks}
            onNavigate={close}
            active={isActive("/education")}
          />
          <MobileSection
            label="Projects"
            href="/projects"
            links={projectLinks}
            onNavigate={close}
            active={isActive("/projects")}
          />
          <a
            href="/skills"
            onClick={close}
            className={`border-b border-line rounded-lg px-3 py-3 text-fg transition hover:bg-chip ${
              isActive("/skills") ? "font-bold" : "font-medium"
            }`}
          >
            Skills
          </a>
          <MobileSection
            label="Volunteering"
            href="/volunteering"
            links={volunteeringLinks}
            onNavigate={close}
            active={isActive("/volunteering")}
          />
          <a
            href="/contact"
            onClick={close}
            className={`rounded-lg px-3 py-3 text-fg transition hover:bg-chip ${
              isActive("/contact") ? "font-bold" : "font-medium"
            }`}
          >
            Contact
          </a>
        </nav>
      </aside>
    </>
  );
}
