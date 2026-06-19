import ContactForm from "../components/ContactForm";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  const contacts = [
    {
      id: "email",
      label: "Email",
      value: "siddharth.singh341710@gmail.com",
      href: "mailto:siddharth.singh341710@gmail.com",
      external: false,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      value: "linkedin.com/in/siddharth-singh-28697037b",
      href: "https://www.linkedin.com/in/siddharth-singh-28697037b/",
      external: true,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      ),
    },
    {
      id: "github",
      label: "GitHub",
      value: "github.com/siddharth-singh34",
      href: "https://github.com/siddharth-singh34",
      external: true,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      ),
    },
  ];

  return (
    <main className="bg-transparent text-fg">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Get in touch</h1>
        <p className="text-muted mb-8 max-w-xl">
          Collaboration, or just a chat about code, data, or football — reach me
          on any of these.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((c) => (
            <Card
              key={c.id}
              asChild
              className="transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl"
            >
              <a
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noreferrer" : undefined}
              >
                <CardContent className="flex items-center gap-4">
                  <span className="bg-muted text-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                    {c.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{c.label}</span>
                    <span className="text-muted-foreground block truncate text-sm">
                      {c.value}
                    </span>
                  </span>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>

        <h2 className="mt-12 mb-4 text-2xl font-bold">Send me a message</h2>
        <ContactForm />
      </div>
    </main>
  );
}
