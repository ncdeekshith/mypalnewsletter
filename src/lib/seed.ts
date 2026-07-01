import type { NewsletterDatabase } from "@/lib/types";

const image = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

export const seedDatabase: NewsletterDatabase = {
  users: [
    {
      id: "user-admin",
      name: "Marketing Manager",
      email: "admin@mypal.in",
      password: "admin123",
      role: "admin"
    },
    {
      id: "user-academic",
      name: "Academic Coordinator",
      email: "academic@mypal.in",
      password: "team123",
      role: "contributor",
      departmentId: "academic"
    },
    {
      id: "user-tech",
      name: "Tech Lead",
      email: "tech@mypal.in",
      password: "team123",
      role: "contributor",
      departmentId: "tech"
    },
    {
      id: "user-sales",
      name: "Sales Lead",
      email: "sales@mypal.in",
      password: "team123",
      role: "contributor",
      departmentId: "sales"
    },
    {
      id: "user-marketing",
      name: "Marketing Team",
      email: "marketing@mypal.in",
      password: "team123",
      role: "contributor",
      departmentId: "marketing"
    }
  ],
  departments: [
    { id: "leadership", name: "Leadership", sectionTitle: "Leadership Note", ownerTitle: "CEO/CTO/CBO", sortOrder: 0 },
    { id: "academic", name: "Academic Team", sectionTitle: "Academic Team", ownerTitle: "Academic Coordinator", sortOrder: 1 },
    { id: "sales", name: "Sales Team", sectionTitle: "Sales Team", ownerTitle: "Sales Lead", sortOrder: 2 },
    { id: "tech", name: "Tech Team", sectionTitle: "Tech Team", ownerTitle: "Tech Lead", sortOrder: 3 },
    { id: "marketing", name: "Marketing Team", sectionTitle: "Marketing Team", ownerTitle: "Marketing Manager", sortOrder: 4 }
  ],
  issues: [
    {
      id: "issue-june-2026",
      title: "myPAL Monthly Newsletter",
      month: "June",
      year: 2026,
      date: "2026-06-30",
      issueNumber: "06"
    ,
      status: "draft"
    }
  ],
  settings: {
    id: "settings-default",
    companyLogoUrl:
      "https://dummyimage.com/360x120/f47b20/ffffff.png&text=myPAL",
    title: "myPAL Monthly Newsletter",
    footerText: "At myPAL, we turn ambition into achievement.",
    websiteUrl: "https://mypal.in",
    socialHandle: "@mypal.education",
    qrCodeUrl: "https://dummyimage.com/180x180/232323/ffffff.png&text=QR",
    brandPrimary: "#f47b20",
    brandSecondary: "#1f2a44",
    typography: "Inter",
    recognitionBadges: [
      {
        id: "badge-iso",
        name: "Recognised Learning Partner",
        imageUrl: "https://dummyimage.com/220x90/ffffff/1f2a44.png&text=Recognition"
      }
    ],
    partnerLogos: [
      {
        id: "partner-1",
        name: "Partner Logo",
        imageUrl: "https://dummyimage.com/220x90/ffffff/1f2a44.png&text=Partner"
      },
      {
        id: "partner-2",
        name: "Academic Partner",
        imageUrl: "https://dummyimage.com/220x90/ffffff/f47b20.png&text=Academic"
      }
    ],
    leadership: {
      id: "leader-1",
      issueId: "issue-june-2026",
      name: "Leadership Desk",
      designation: "CEO",
      qualification: "myPAL Leadership",
      message:
        "This month reflected the spirit of myPAL: disciplined execution, learner-first thinking, and a shared belief that every student deserves momentum. Thank you to every team for turning plans into meaningful progress.",
      photoUrl: "https://dummyimage.com/320x320/f47b20/ffffff.png&text=CEO"
    }
  },
  submissions: [
    {
      id: "submission-academic",
      issueId: "issue-june-2026",
      userId: "user-academic",
      departmentId: "academic",
      sectionTitle: "Academic Team",
      headline: "Learner engagement stayed strong across live classes and assessments",
      intro:
        "The academic team focused on improving class consistency, test readiness, and student follow-up quality across active batches.",
      bullets: [
        "Completed weekly lesson plans and doubt-clearing sessions for active cohorts.",
        "Conducted assessment reviews with targeted remedial support.",
        "Improved attendance follow-ups through structured parent communication."
      ],
      metrics: [
        { label: "Classes completed", value: "148" },
        { label: "Tests conducted", value: "26" },
        { label: "Students reached", value: "1,240" }
      ],
      images: [
        { id: "academic-1", url: image("photo-1522202176988-66273c2fd55f"), caption: "Classroom engagement" },
        { id: "academic-2", url: image("photo-1523580846011-d3a5bc25702b"), caption: "Assessment review" },
        { id: "academic-3", url: image("photo-1516321318423-f06f85e504b3"), caption: "Digital learning support" },
        { id: "academic-4", url: image("photo-1503676260728-1c00da094a0b"), caption: "Student progress tracking" }
      ],
      status: "approved",
      visible: true,
      sortOrder: 1,
      createdAt: "2026-06-20T10:00:00.000Z",
      updatedAt: "2026-06-25T10:00:00.000Z"
    },
    {
      id: "submission-sales",
      issueId: "issue-june-2026",
      userId: "user-sales",
      departmentId: "sales",
      sectionTitle: "Sales Team",
      headline: "Admissions pipeline grew through focused counselling and outreach",
      intro:
        "Sales strengthened lead qualification, parent counselling, and admissions conversion tracking during the month.",
      bullets: [
        "Launched a city-wise follow-up cadence for warm leads.",
        "Improved counselling notes for each admission stage.",
        "Closed priority admissions before the new batch launch."
      ],
      metrics: [
        { label: "Leads generated", value: "820" },
        { label: "Admissions", value: "96" },
        { label: "Counselling calls", value: "410" }
      ],
      images: [
        { id: "sales-1", url: image("photo-1556761175-b413da4baf72"), caption: "Counselling session" },
        { id: "sales-2", url: image("photo-1552664730-d307ca884978"), caption: "Team review" },
        { id: "sales-3", url: image("photo-1556761175-4b46a572b786"), caption: "Admissions planning" },
        { id: "sales-4", url: image("photo-1517245386807-bb43f82c33c4"), caption: "Pipeline workshop" }
      ],
      status: "submitted",
      visible: true,
      sortOrder: 2,
      createdAt: "2026-06-22T10:00:00.000Z",
      updatedAt: "2026-06-26T10:00:00.000Z"
    },
    {
      id: "submission-tech",
      issueId: "issue-june-2026",
      userId: "user-tech",
      departmentId: "tech",
      sectionTitle: "Tech Team",
      headline: "Platform improvements made reporting and content delivery smoother",
      intro:
        "The tech team shipped dashboard refinements, improved internal workflows, and reduced manual reporting steps.",
      bullets: [
        "Released a cleaner monthly metrics dashboard for internal teams.",
        "Reduced duplicate data entry in student progress reporting.",
        "Completed QA passes for batch management improvements."
      ],
      metrics: [
        { label: "Features shipped", value: "7" },
        { label: "Bugs resolved", value: "34" },
        { label: "Reports automated", value: "5" }
      ],
      images: [
        { id: "tech-1", url: image("photo-1519389950473-47ba0277781c"), caption: "Product sprint" },
        { id: "tech-2", url: image("photo-1498050108023-c5249f4df085"), caption: "Dashboard build" },
        { id: "tech-3", url: image("photo-1531482615713-2afd69097998"), caption: "QA collaboration" },
        { id: "tech-4", url: image("photo-1551434678-e076c223a692"), caption: "Workflow automation" }
      ],
      status: "approved",
      visible: true,
      sortOrder: 3,
      createdAt: "2026-06-21T10:00:00.000Z",
      updatedAt: "2026-06-27T10:00:00.000Z"
    },
    {
      id: "submission-marketing",
      issueId: "issue-june-2026",
      userId: "user-marketing",
      departmentId: "marketing",
      sectionTitle: "Marketing Team",
      headline: "Campaigns improved brand reach and parent engagement",
      intro:
        "Marketing focused on campaign planning, social media consistency, partner assets, and newsletter publishing readiness.",
      bullets: [
        "Published weekly campaign creatives across active social channels.",
        "Prepared student success story assets for upcoming admissions drives.",
        "Coordinated partner logo and footer assets for brand consistency."
      ],
      metrics: [
        { label: "Campaigns launched", value: "12" },
        { label: "Creatives delivered", value: "46" },
        { label: "Reach", value: "58K" }
      ],
      images: [
        { id: "marketing-1", url: image("photo-1542744173-8e7e53415bb0"), caption: "Campaign review" },
        { id: "marketing-2", url: image("photo-1557804506-669a67965ba0"), caption: "Creative planning" },
        { id: "marketing-3", url: image("photo-1563986768609-322da13575f3"), caption: "Brand updates" },
        { id: "marketing-4", url: image("photo-1559136555-9303baea8ebd"), caption: "Growth planning" }
      ],
      status: "draft",
      visible: true,
      sortOrder: 4,
      createdAt: "2026-06-23T10:00:00.000Z",
      updatedAt: "2026-06-28T10:00:00.000Z"
    }
  ],
  generatedPdfs: []
};
