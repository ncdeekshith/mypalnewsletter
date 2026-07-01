import { z } from "zod";

export const imageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Use a valid image URL"),
  caption: z.string().min(1, "Caption is required")
});

export const submissionSchema = z.object({
  id: z.string().optional(),
  issueId: z.string(),
  userId: z.string(),
  departmentId: z.string(),
  sectionTitle: z.string().min(2),
  headline: z.string().min(6, "Headline is required"),
  intro: z.string().min(20, "Add a short introduction"),
  bullets: z.array(z.string().min(5)).min(3, "Add at least 3 bullet updates"),
  metrics: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).default([]),
  images: z.array(imageSchema).min(4, "Upload or link at least 4 images"),
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
    photoUrl: z.string().url()
  })
});
