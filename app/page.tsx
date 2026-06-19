import Image from "next/image";
import Reveal from "./components/Reveal";
import { Button } from "@/components/ui/button";

export default function Home() {
  const heroPitch =
    "First-year Computer Science student at the University of Hong Kong, drawn to algorithms, data analysis, and building things that solve real problems. Equal parts coder, athlete, and team leader.";

  const aboutText =
    "I'm a first-year Bachelor of Engineering (Computer Science) student at the University of Hong Kong's School of Computing and Data Science, which I joined in 2025 on the HKU Undergraduate Entrance Scholarship for Outstanding Academic Talents. I like turning open-ended questions into code and data, from modelling a football league table to simulating cellular automata. I've also completed Harvard's CS50 and a short data-integration internship at Justransform, where I picked up SQL and web development. Away from the keyboard, I've coached basketball and volleyball camps, played striker for my school football team, and volunteered with rural community programmes across India.";

  return (
    <main className="min-h-screen bg-transparent text-fg">
      {/* HERO */}
      <section className="mx-auto max-w-4xl px-6 py-28">
        <div className="flex flex-col-reverse items-start gap-12 sm:flex-row sm:items-center sm:justify-between">
          <Reveal repeat className="flex-1">
            <p className="text-accent font-medium mb-3">{"Hi, I'm"}</p>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Siddharth Singh.
            </h1>
            <h2 className="text-3xl sm:text-4xl font-bold text-muted mt-2">
              {"CS & Data Science student at HKU."}
            </h2>
            <p className="mt-6 max-w-xl text-muted leading-relaxed">{heroPitch}</p>
            <Button
              asChild
              variant="outline"
              className="mt-8 h-auto rounded-md px-6 py-3 text-base text-foreground"
            >
              <a href="/projects">See my work</a>
            </Button>
          </Reveal>

          {/* Portrait: rounded (not a full circle), cropped to keep Siddharth as the focus */}
          <Reveal repeat className="shrink-0 self-center" delay={150}>
            <div className="relative h-56 w-48 sm:h-72 sm:w-60 overflow-hidden rounded-[2.5rem] ring-1 ring-line-strong shadow-2xl">
              <Image
                src="/siddharth.jpeg"
                alt="Siddharth Singh"
                fill
                priority
                quality={95}
                sizes="(min-width: 640px) 240px, 192px"
                className="object-cover object-[center_38%]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-4xl px-6 py-16 border-t border-line">
        <Reveal repeat rootMargin="0px 0px -25% 0px">
          <h2 className="text-2xl font-bold mb-6">About</h2>
          <p className="text-fg-soft leading-relaxed max-w-2xl">{aboutText}</p>
        </Reveal>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-4xl px-6 py-24 border-t border-line text-center">
        <Reveal repeat rootMargin="0px 0px -25% 0px">
          <h2 className="text-3xl font-bold">Get in touch</h2>
          <p className="mt-4 text-muted max-w-md mx-auto">
            Collaboration, or just a chat about code, data, or football.
          </p>
          <Button
            asChild
            className="mt-8 h-auto rounded-md px-6 py-3 text-base"
          >
            <a href="/contact">Say hello</a>
          </Button>
        </Reveal>
      </section>
    </main>
  );
}