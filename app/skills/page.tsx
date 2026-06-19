import SkillIcon from "../components/SkillIcon";
import { Badge } from "@/components/ui/badge";

export default function SkillsPage() {
  // All skills drawn from the Education and Projects pages, grouped & deduped.
  const groups = [
    {
      title: "Languages",
      skills: ["Python", "Java", "C", "C++"],
    },
    {
      title: "Concepts & Theory",
      skills: [
        "Mathematics",
        "Calculus",
        "Algorithms",
        "Data Structures",
        "Object-Oriented Programming (OOP)",
        "Boolean Logic",
        "Logic",
        "Parsing",
        "Graphs",
        "A* Search",
        "Simulation",
        "Artificial Intelligence (AI)",
      ],
    },
    {
      title: "Web Development",
      skills: [
        "Next.js",
        "React",
        "Node.js",
        "TypeScript",
        "JavaScript",
        "Tailwind CSS",
        "shadcn/ui",
        "Git",
        "GitHub",
      ],
    },
    {
      title: "Tools & Frameworks",
      skills: ["PyQt6"],
    },
    {
      title: "Other",
      skills: ["Public Speaking", "UNESCO ESD", "Game", "RPG"],
    },
  ];

  return (
    <main className="min-h-screen bg-base text-fg dark:bg-transparent">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Skills</h1>
        <p className="text-muted mb-10 max-w-xl">
          Everything I&apos;ve picked up across my studies and projects.
        </p>

        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.title}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-faint">
                {g.title}
              </h2>
              <div className="flex flex-wrap gap-3">
                {g.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="gap-2 px-4 py-2 text-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lg [&>svg]:size-5"
                  >
                    <SkillIcon name={skill} className="h-5 w-5" />
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
