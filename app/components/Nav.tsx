"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import ThemeToggle from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LinkItem = { label: string; href: string };

const educationLinks: LinkItem[] = [
  { label: "Sahyadri School - India", href: "/education#sahyadri" },
  { label: "The University of Hong Kong", href: "/education#hku" },
];

const projectLinks: LinkItem[] = [
  { label: "Conway's Game of Life", href: "/projects#game-of-life" },
  { label: "Boolean Expression Evaluator", href: "/projects#boolean-evaluator" },
  { label: "Smart Public Transport Advisor", href: "/projects#smart-transport-advisor" },
  { label: "Terminus", href: "/projects#terminus-game" },
];

const volunteeringLinks: LinkItem[] = [
  { label: "Research Volunteer · Sahyadri School", href: "/volunteering#research-volunteer-sahyadri" },
  { label: "Community Volunteer · Samaj Pragati Sahayog", href: "/volunteering#samaj-pragati-sahayog" },
  { label: "Community Volunteer · Anandwan Ashram", href: "/volunteering#anandwan-ashram" },
];

const sections = [
  { label: "Education", href: "/education", links: educationLinks },
  { label: "Projects", href: "/projects", links: projectLinks },
  { label: "Volunteering", href: "/volunteering", links: volunteeringLinks },
];

type User = { name: string; email: string; avatar?: string };

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

// Orange auth button: "Log in" link when logged out; avatar + name with a
// dropdown (View profile / Log out) when logged in.
function AuthButton({
  user,
  onLogout,
  className = "",
}: {
  user: User | null;
  onLogout: () => void;
  className?: string;
}) {
  const base =
    "rounded-full bg-orange-500 font-medium text-white shadow-lg hover:bg-orange-600";
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" className={`${base} ${className} max-w-[12rem] pl-1.5`}>
            <Avatar className="size-6">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-orange-600 text-[10px] text-white">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{user.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/profile">View profile</a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <Button asChild className={`${base} ${className}`}>
      <a href="/login">Log in</a>
    </Button>
  );
}

const navCls = (active: boolean) =>
  `rounded-full px-3 py-1.5 transition ${
    active ? "font-bold text-fg" : "text-muted hover:bg-chip hover:text-fg"
  }`;
const dropdownLink =
  "block rounded-xl px-3 py-2 text-fg-soft transition hover:bg-chip hover:text-fg";

// Desktop hover dropdown (kept as the custom floating-pill style).
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

export default function Nav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  // Logged-in user (kept in localStorage by the login/signup pages).
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? (JSON.parse(raw) as User) : null);
      } catch {
        setUser(null);
      }
    };
    read();
    window.addEventListener("auth-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("auth-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  const logout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
  };

  // The blog editor is a focused full-page workspace with its own top bar —
  // hide the site nav there so they don't overlap.
  if (pathname === "/blog-editor") return null;

  return (
    <>
      {/* DESKTOP: floating pill with hover dropdowns (shown when there's room) */}
      <div className="sticky top-0 z-30 hidden items-center justify-center gap-2 px-4 pt-4 md:flex">
        <nav className="font-nav flex items-center gap-1 rounded-full border border-line bg-surface/70 px-2 py-1.5 text-sm font-medium shadow-lg backdrop-blur">
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
          <a href="/blogs" className={navCls(isActive("/blogs"))}>
            Blogs
          </a>
          <a
            href="/contact"
            className={`${navCls(isActive("/contact"))} border border-orange-500`}
          >
            Contact
          </a>
        </nav>

        {/* Theme toggle as a separate circle button next to the pill */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/70 shadow-lg backdrop-blur">
          <ThemeToggle />
        </div>

        {/* Log in / user name */}
        <AuthButton user={user} onLogout={logout} className="px-5" />
      </div>

      {/* MOBILE: compact bar with a Sheet drawer (shown when the full nav won't fit) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="sticky top-0 z-30 flex items-center justify-center gap-2 px-4 pt-4 md:hidden">
          <nav className="font-nav flex flex-1 items-center justify-between rounded-full border border-line bg-surface/70 px-3 py-2 font-medium shadow-lg backdrop-blur">
            <a href="/" className="px-2 font-semibold text-fg">
              Siddharth Singh
            </a>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
          </nav>

          {/* Theme toggle as a separate circle button next to the bar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface/70 shadow-lg backdrop-blur">
            <ThemeToggle />
          </div>

          {/* Log in / user name */}
          <AuthButton user={user} onLogout={logout} className="shrink-0 px-4" />
        </div>

        <SheetContent side="right" className="font-nav w-72">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col overflow-y-auto px-2 pb-4">
            <Accordion type="multiple" className="w-full">
              {sections.map((sec) => (
                <AccordionItem key={sec.label} value={sec.label}>
                  <AccordionTrigger
                    className={`px-2 ${isActive(sec.href) ? "font-bold" : "font-medium"}`}
                  >
                    {sec.label}
                  </AccordionTrigger>
                  <AccordionContent className="px-1">
                    <a
                      href={sec.href}
                      onClick={close}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-fg-soft transition hover:bg-chip hover:text-fg"
                    >
                      All {sec.label}
                    </a>
                    {sec.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        onClick={close}
                        className="block rounded-lg px-3 py-2 text-sm text-fg-soft transition hover:bg-chip hover:text-fg"
                      >
                        {l.label}
                      </a>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Button
              asChild
              variant="ghost"
              className={`mt-2 w-full justify-start px-2 ${
                isActive("/skills") ? "font-bold" : "font-medium"
              }`}
            >
              <a href="/skills" onClick={close}>
                Skills
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={`w-full justify-start px-2 ${
                isActive("/blogs") ? "font-bold" : "font-medium"
              }`}
            >
              <a href="/blogs" onClick={close}>
                Blogs
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className={`w-full justify-start px-2 ${
                isActive("/contact") ? "font-bold" : "font-medium"
              }`}
            >
              <a href="/contact" onClick={close}>
                Contact
              </a>
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
