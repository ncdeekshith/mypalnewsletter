export type Role = "admin" | "contributor";
export type SubmissionStatus = "draft" | "submitted" | "approved" | "rejected" | "published";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  departmentId?: string;
  whatsappSubscriberId?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Department = {
  id: string;
  name: string;
  sectionTitle: string;
  ownerTitle: string;
  sortOrder: number;
};

export type NewsletterIssue = {
  id: string;
  title: string;
  month: string;
  year: number;
  date: string;
  dueDate?: string;
  issueNumber: string;
  status: "draft" | "published";
  ownerId?: string;
  notes?: string;
};

export type SubmissionImage = {
  id: string;
  url: string;
  caption: string;
};

export type SubmissionMetric = {
  label: string;
  value: string;
};

export type Submission = {
  id: string;
  issueId: string;
  userId: string;
  departmentId: string;
  sectionTitle: string;
  headline: string;
  intro: string;
  bullets: string[];
  metrics: SubmissionMetric[];
  images: SubmissionImage[];
  status: SubmissionStatus;
  visible: boolean;
  sortOrder: number;
  reviewerNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadershipNote = {
  id: string;
  issueId: string;
  name: string;
  designation: string;
  qualification: string;
  message: string;
  photoUrl: string;
};

export type PartnerLogo = {
  id: string;
  name: string;
  imageUrl: string;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
};

export type Stakeholder = {
  id: string;
  name: string;
  email: string;
  whatsappSubscriberId?: string;
  group: string;
};

export type AdminSettings = {
  id: string;
  companyLogoUrl: string;
  title: string;
  footerText: string;
  websiteUrl: string;
  socialHandle: string;
  socialLinks: SocialLink[];
  stakeholders: Stakeholder[];
  qrCodeUrl: string;
  brandPrimary: string;
  brandSecondary: string;
  typography: string;
  recognitionBadges: PartnerLogo[];
  partnerLogos: PartnerLogo[];
  leadership: LeadershipNote;
};

export type GeneratedPdf = {
  id: string;
  issueId: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "submission" | "review" | "reminder" | "system";
  read: boolean;
  createdAt: string;
};

export type EmailOutboxItem = {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: "queued" | "sent" | "failed";
  provider?: string;
  error?: string;
  createdAt: string;
};

export type NewsletterDatabase = {
  users: AppUser[];
  departments: Department[];
  issues: NewsletterIssue[];
  submissions: Submission[];
  settings: AdminSettings;
  generatedPdfs: GeneratedPdf[];
  notifications: AppNotification[];
  emailOutbox: EmailOutboxItem[];
};
