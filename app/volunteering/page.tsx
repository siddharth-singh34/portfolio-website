import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VolunteeringPage() {
  const roles = [
    {
      id: "research-volunteer-sahyadri",
      title: "Research Volunteer",
      org: "Sahyadri School - India",
      dates: "Jun 2023 – Jan 2024 · 8 months",
      cause: "Health",
      paragraphs: [
        "This was a part of my school's outreach activity. Since the school is in a rural part of India, we help the people living in the village near it by raising social awareness on important topics like health, environment, etc.",
        "Conducted interviews in villages near my school for a medical camp. Understanding how they live, and spreading awareness about health. I took classes for the children there and also interacted with them on chosen topics alongside play.",
      ],
    },
    {
      id: "samaj-pragati-sahayog",
      title: "Community Volunteer",
      org: "Samaj Pragati Sahayog",
      dates: "Oct 2023 · 1 month",
      cause: "Economic Empowerment",
      paragraphs: [
        "Volunteered at Samaj Pragati Sahayog in rural Madhya Pradesh, learning about their work with the locals to address their ongoing water crisis as well as in improving their general quality of life. The organisation employs a participatory approach, working alongside village communities to build decentralized water harvesting structures such as check dams, farm ponds, and recharge shafts. I gained insight into how these interventions not only alleviate water scarcity but also support livelihoods by enabling year-round farming and reducing distress migration. Beyond water, their integrated model includes watershed management, sustainable agriculture, and women's self-help groups, offering a holistic view of rural development in practice.",
      ],
    },
    {
      id: "anandwan-ashram",
      title: "Community Volunteer",
      org: "Anandwan Ashram",
      dates: "Mar 2022 · 1 month",
      cause: "Economic Empowerment",
      paragraphs: [
        "At Anandwan Ashram in rural Maharashtra, an institution originally founded to address leprosy and rehabilitate those affected, I witnessed how the organisation has evolved over decades to become a hub of community-led development. Today, its work extends deeply into the lives of the local Madia and Gond tribal communities, focusing on livelihood generation, education, and social empowerment. During my time there, I conducted interviews with staff and community members to document their roles and contributions, and spent time interacting with tribal families to understand how Anandwan's model of self-reliance has shaped their participation in the community. From vocational training and bamboo craft to dairy farming and reafforestation, I saw how the ashram fosters dignity, skill, and ecological stewardship, offering not just rehabilitation but a replicable vision of inclusive rural transformation.",
      ],
    },
  ];

  return (
    <main className="bg-transparent text-fg">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Volunteering</h1>

        <div className="grid gap-6">
          {roles.map((r) => (
            <Card
              key={r.id}
              id={r.id}
              className="scroll-mt-24 gap-3 transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl"
            >
              <CardHeader>
                <CardTitle className="text-lg">{r.title}</CardTitle>
                <p className="text-fg-soft text-sm">{r.org}</p>
                <p className="text-muted-foreground text-sm">{r.dates}</p>
                <Badge variant="secondary" className="mt-1 w-fit">
                  {r.cause}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {r.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-muted-foreground text-sm leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
