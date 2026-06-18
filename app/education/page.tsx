import Skills from "../components/Skills";

export default function EducationPage() {
  const schools = [
    {
      id: "sahyadri",
      name: "Sahyadri School - India",
      website: "https://www.sahyadrischool.org/",
      bgImage: "/SC_hall2-scaled.jpg",
      degree: "High School Diploma",
      dates: "Jun 2019 – Mar 2025",
      grade: "95.0%",
      activities: [
        "Student Council",
        "Acted in Two Theatrical Performances",
        "Part of School Football Team",
      ],
      honors: [] as {
        title: string;
        issuer: string;
        description: string;
      }[],
      skills: [
        "Boolean Logic",
        "UNESCO Education for Sustainable Development (ESD) Learning Objective",
        "Public Speaking",
        "Calculus",
        "Object-Oriented Programming (OOP)",
        "Java",
      ],
    },
    {
      id: "hku",
      name: "The University of Hong Kong",
      website: "https://www.hku.hk/",
      bgImage: "/HKU-campus.png",
      degree: "Bachelor of Engineering - BE, Computer Science",
      dates: "Sep 2025 – May 2029",
      grade: "",
      activities: [
        "Event Coordinator of South Asian Society",
        "HKU Student Ambassador 2025",
      ],
      honors: [
        {
          title:
            "HKU Undergraduate Entrance Scholarship for Outstanding Academic Talents",
          issuer: "The University of Hong Kong",
          description:
            "Recipient of the HKU Undergraduate Entrance Scholarship for Outstanding Academic Talents, awarded to the top tier of incoming students at the University of Hong Kong based on academic merit and outstanding potential.",
        },
      ],
      skills: [
        "Mathematics",
        "Artificial Intelligence (AI)",
        "Python (Programming Language)",
        "Object-Oriented Programming (OOP)",
        "C (Programming Language)",
      ],
    },
  ];

  return (
    <main className="bg-transparent text-fg">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Education</h1>

        <div className="grid gap-6">
          {schools.map((s) => (
            <div
              key={s.id}
              id={s.id}
              className="group relative overflow-hidden scroll-mt-24 rounded-xl border border-line p-6 transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-line-strong hover:shadow-2xl hover:[&_*]:text-zinc-50"
            >
              {/* Campus photo background, fades in on hover */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                style={{ backgroundImage: `url(${s.bgImage})` }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
              />

              <div className="relative z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <a
                  href={s.website}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Visit ${s.name} website`}
                  title={`Visit ${s.name} website`}
                  className="inline-flex items-center justify-center rounded-md border border-line p-1 text-muted hover:border-line-strong hover:text-fg transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </a>
              </div>
              <p className="mt-1 text-sm text-fg-soft">{s.degree}</p>
              <p className="mt-1 text-sm text-faint">{s.dates}</p>

              {s.grade ? (
                <p className="mt-3 text-sm text-fg-soft">Grade: {s.grade}</p>
              ) : null}

              <div className="mt-3 text-sm text-muted leading-relaxed">
                <p className="text-fg-soft">Activities and societies:</p>
                <ul className="mt-1 list-disc list-inside">
                  {s.activities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>

              {s.honors.length ? (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-sm font-medium text-accent">
                    Honors &amp; awards
                  </p>
                  <div className="mt-2 space-y-3">
                    {s.honors.map((h) => (
                      <div key={h.title}>
                        <p className="text-sm font-semibold">{h.title}</p>
                        <p className="text-xs text-faint">
                          Issued by {h.issuer}
                        </p>
                        <p className="mt-1 text-sm text-muted leading-relaxed">
                          {h.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <Skills skills={s.skills} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
