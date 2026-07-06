import { z } from "zod";

export const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().default(""),
  caption: z.string().default("")
});

export const submissionSchema = z.object({
  id: z.string().optional(),
  issueId: z.string(),
  userId: z.string(),
  departmentId: z.string(),
  sectionTitle: z.string().default("Team Update"),
  headline: z.string().default(""),
  intro: z.string().default(""),
  bullets: z.array(z.string()).default([]),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  images: z.array(imageSchema).default([]),
  pdfOptions: z.object({
    imageFit: z.enum(["contain", "cover"]).default("contain"),
    spacing: z.enum(["compact", "standard", "airy"]).default("standard")
  }).default({ imageFit: "contain", spacing: "standard" }),
  status: z.enum(["draft", "submitted", "approved", "rejected", "published"]).default("draft"),
  visible: z.boolean().default(true),
  sortOrder: z.number().default(10),
  reviewerNote: z.string().optional()
});

export const settingsSchema = z.object({
  id: z.string(),
  companyLogoUrl: z.string().url(),
  title: z.string().min(2),
  footerText: z.string().min(2),
  websiteUrl: z.string().url(),
  socialHandle: z.string().min(2),
  socialLinks: z.array(z.object({ id: z.string(), label: z.string().min(1), url: z.string().url() })).default([]),
  stakeholders: z.array(z.object({ id: z.string(), name: z.string().min(1), email: z.string().email(), whatsappSubscriberId: z.string().optional(), group: z.string().min(1) })).default([]),
  qrCodeUrl: z.string().url(),
  brandPrimary: z.string().min(4),
  brandSecondary: z.string().min(4),
  typography: z.string().min(2),
  partnerLogos: z.array(z.object({ id: z.string(), name: z.string(), imageUrl: z.string().url() })),
  recognitionBadges: z.array(z.object({ id: z.string(), name: z.string(), imageUrl: z.string().url() })),
  leadership: z.object({
    id: z.string(),
    issueId: z.string(),
    name: z.string().min(2),
    designation: z.string().min(2),
    qualification: z.string().min(2),
    message: z.string().min(20),
    photoUrl: z.string().min(10)
  })
});

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "contributor"]),
  departmentId: z.string().optional(),
  whatsappSubscriberId: z.string().optional()
});

export const issueSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  month: z.string().min(2),
  year: z.number().int().min(2020),
  date: z.string().min(8),
  dueDate: z.string().optional(),
  issueNumber: z.string().min(1),
  status: z.enum(["draft", "published"]),
  ownerId: z.string().optional(),
  notes: z.string().optional()
});
