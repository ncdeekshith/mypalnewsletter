import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { seedDatabase } from "@/lib/seed";
import { firebaseEnabled } from "@/lib/firebase";
import { readFirebaseDatabase, writeFirebaseDatabase } from "@/lib/firebase-store";
import type { AdminSettings, AppNotification, AppUser, EmailOutboxItem, GeneratedPdf, NewsletterDatabase, NewsletterIssue, Submission, SubmissionImage } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const dataPath = path.join(dataDir, "newsletter-db.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, JSON.stringify(seedDatabase, null, 2));
  }
}

export async function readDatabase(): Promise<NewsletterDatabase> {
  let database: NewsletterDatabase;
  if (firebaseEnabled()) {
    try {
      database = await readFirebaseDatabase();
      return normalizeDatabase(database);
    } catch (error) {
      console.warn("Firebase read failed; falling back to local store.", error);
    }
  }

  await ensureStore();
  const raw = await fs.readFile(dataPath, "utf8");
  if (!raw.trim()) {
    await writeDatabase(seedDatabase);
    return seedDatabase;
  }

  try {
    return normalizeDatabase(JSON.parse(raw) as NewsletterDatabase);
  } catch {
    await writeDatabase(seedDatabase);
    return normalizeDatabase(seedDatabase);
  }
}

export async function writeDatabase(database: NewsletterDatabase) {
  if (firebaseEnabled()) {
    try {
      await writeFirebaseDatabase(database);
      return;
    } catch (error) {
      console.warn("Firebase write failed; falling back to local store.", error);
    }
  }

  await ensureStore();
  await fs.writeFile(dataPath, JSON.stringify(database, null, 2));
}

type SubmissionInput = Omit<Partial<Submission>, "images"> &
  Pick<Submission, "userId" | "departmentId" | "issueId"> & {
    images?: Array<Partial<SubmissionImage> & Pick<SubmissionImage, "url" | "caption">>;
  };

export async function upsertSubmission(input: SubmissionInput) {
  const database = await readDatabase();
  const now = new Date().toISOString();
  const existingIndex = input.id ? database.submissions.findIndex((item) => item.id === input.id) : -1;
  const department = database.departments.find((item) => item.id === input.departmentId);
  const submission: Submission = {
    id: input.id ?? nanoid(),
    issueId: input.issueId,
    userId: input.userId,
    departmentId: input.departmentId,
    sectionTitle: input.sectionTitle ?? department?.sectionTitle ?? "Team Update",
    headline: input.headline ?? "",
    intro: input.intro ?? "",
    bullets: input.bullets ?? [],
    metrics: input.metrics ?? [],
    images: (input.images ?? []).map((image) => ({
      id: image.id ?? nanoid(),
      url: image.url,
      caption: image.caption
    })),
    status: input.status ?? "draft",
    visible: input.visible ?? true,
    sortOrder: input.sortOrder ?? department?.sortOrder ?? database.submissions.length + 1,
    reviewerNote: input.reviewerNote,
    createdAt: input.createdAt ?? now,
    updatedAt: now
  };

  if (existingIndex >= 0) {
    database.submissions[existingIndex] = {
      ...database.submissions[existingIndex],
      ...submission,
      createdAt: database.submissions[existingIndex].createdAt
    };
  } else {
    database.submissions.push(submission);
  }

  await writeDatabase(database);
  return submission;
}

export async function updateSettings(settings: AdminSettings) {
  const database = await readDatabase();
  database.settings = settings;
  await writeDatabase(database);
  return database.settings;
}

export async function addGeneratedPdf(pdf: Omit<GeneratedPdf, "id" | "createdAt">) {
  const database = await readDatabase();
  const generatedPdf = {
    ...pdf,
    id: nanoid(),
    createdAt: new Date().toISOString()
  };
  database.generatedPdfs.unshift(generatedPdf);
  await writeDatabase(database);
  return generatedPdf;
}

export async function createUser(input: Omit<AppUser, "id">) {
  const database = await readDatabase();
  if (database.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("A user with this email already exists.");
  }

  const user: AppUser = {
    ...input,
    id: nanoid(),
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  database.users.push(user);
  await writeDatabase(database);
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function updateUser(id: string, input: Partial<Omit<AppUser, "id">>) {
  const database = await readDatabase();
  const index = database.users.findIndex((user) => user.id === id);
  if (index === -1) throw new Error("User not found.");

  if (
    input.email &&
    database.users.some((user) => user.id !== id && user.email.toLowerCase() === input.email?.toLowerCase())
  ) {
    throw new Error("A user with this email already exists.");
  }

  const current = database.users[index];
  database.users[index] = {
    ...current,
    ...input,
    password: input.password || current.password,
    active: input.active ?? current.active ?? true,
    updatedAt: new Date().toISOString()
  };

  await writeDatabase(database);
  const { password: _password, ...safeUser } = database.users[index];
  return safeUser;
}

export async function deleteUser(id: string) {
  const database = await readDatabase();
  const admins = database.users.filter((user) => user.role === "admin" && user.active !== false);
  const user = database.users.find((item) => item.id === id);
  if (!user) throw new Error("User not found.");
  if (user.role === "admin" && admins.length <= 1) throw new Error("Keep at least one active admin.");

  database.users = database.users.filter((item) => item.id !== id);
  database.submissions = database.submissions.filter((submission) => submission.userId !== id);
  database.notifications = database.notifications.filter((notification) => notification.userId !== id);
  await writeDatabase(database);
}

export async function updateIssue(input: NewsletterIssue) {
  const database = await readDatabase();
  const index = database.issues.findIndex((issue) => issue.id === input.id);
  if (index === -1) {
    throw new Error("Newsletter issue not found.");
  }

  database.issues[index] = input;
  await writeDatabase(database);
  return input;
}

export async function addNotification(input: Omit<AppNotification, "id" | "read" | "createdAt">) {
  const database = await readDatabase();
  const notification: AppNotification = {
    ...input,
    id: nanoid(),
    read: false,
    createdAt: new Date().toISOString()
  };
  database.notifications.unshift(notification);
  await writeDatabase(database);
  return notification;
}

export async function queueEmail(input: Omit<EmailOutboxItem, "id" | "status" | "createdAt"> & { status?: EmailOutboxItem["status"] }) {
  const database = await readDatabase();
  const item: EmailOutboxItem = {
    ...input,
    id: nanoid(),
    status: input.status ?? "queued",
    createdAt: new Date().toISOString()
  };
  database.emailOutbox.unshift(item);
  await writeDatabase(database);
  return item;
}

export async function markNotificationRead(id: string, userId: string) {
  const database = await readDatabase();
  const notification = database.notifications.find((item) => item.id === id && item.userId === userId);
  if (!notification) throw new Error("Notification not found.");
  notification.read = true;
  await writeDatabase(database);
  return notification;
}

function normalizeDatabase(database: NewsletterDatabase): NewsletterDatabase {
  const users = (database.users ?? seedDatabase.users).map((user) => ({ ...user, active: user.active ?? true }));
  const mainAdmin = seedDatabase.users.find((user) => user.email === "deekshith.nc@arivulearn.com");
  if (mainAdmin && !users.some((user) => user.email.toLowerCase() === mainAdmin.email.toLowerCase())) {
    users.unshift({ ...mainAdmin, active: true });
  }

  return {
    ...seedDatabase,
    ...database,
    users,
    notifications: database.notifications ?? [],
    emailOutbox: database.emailOutbox ?? []
  };
}
