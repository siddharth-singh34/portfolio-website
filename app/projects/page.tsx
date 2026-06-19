import SkillIcon from "../components/SkillIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPage() {
  const projects = [
    {
      id: "game-of-life",
      title: "Conway's Game of Life",
      description:
        "A 2D cellular-automaton simulation with a twist: the grid wraps around a circular board instead of a flat plane. Written in Java.",
      tags: ["Java", "Algorithms", "Simulation"],
      role: "",
      link: "#",
    },
    {
      id: "boolean-evaluator",
      title: "Boolean Expression Evaluator",
      description:
        "A Java program that parses boolean expressions, evaluates them, and generates complete truth tables.",
      tags: ["Java", "Parsing", "Logic"],
      role: "",
      link: "#",
    },
    {
      id: "smart-transport-advisor",
      title: "Smart Public Transport Advisor",
      description:
        "A journey planner that models Hong Kong's MTR and bus network as a graph and finds routes between any two stops using the A* algorithm with a haversine heuristic. Choose fastest, cheapest, or fewest transfers and get ranked journeys with a per-segment breakdown. Ships with a CLI and an interactive PyQt6 map GUI. HKU COMP1110 group project.",
      tags: ["Python", "A* Search", "Graphs", "PyQt6"],
      role: "",
      link: "https://github.com/rohanasrani3/COMP1110-Smart-Public-Transport-Advisor-GroupG-02-",
    },
    {
      id: "terminus-game",
      title: "Terminus",
      description:
        "A text-based campus RPG set at HKU, built in C++. You explore the university through a Unix-style shell and battle six rival students in turn-based 'coding duels' where every move is a programming concept (Stack Overflow, Segfault Strike, Merge Sort), then face the final boss in Loke Yew Hall. Features XP and levelling, four difficulty modes, save/load, and a two-pane animated ASCII-art interface. Group project for ENGG1340 / COMP2113.",
      tags: ["C++", "Game", "RPG", "Data Structures"],
      role: "Game context implementation",
      link: "https://github.com/ashutoshjalan23/HKU-Terminus-COMP2113-Group-project",
    },
  ];

  return (
    <main className="bg-transparent text-fg">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Projects</h1>

        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((p) => (
            <Card
              asChild
              key={p.id}
              className="scroll-mt-24 gap-3 transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl target:ring-2 target:ring-white target:ring-offset-2 target:ring-offset-transparent"
            >
              <a
                id={p.id}
                href={p.link}
                target={p.link === "#" ? undefined : "_blank"}
                rel={p.link === "#" ? undefined : "noreferrer"}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {p.description}
                  </p>
                  {p.role ? (
                    <p className="text-foreground/80 mt-3 text-xs">
                      My role: {p.role}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <Badge key={t} variant="secondary">
                        <SkillIcon name={t} className="h-3.5 w-3.5" />
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}