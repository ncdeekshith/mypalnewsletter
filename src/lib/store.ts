import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { seedDatabase } from "@/lib/seed";
import { firebaseEnabled } from "@/lib/firebase";
import { readFirebaseDatabase, writeFirebaseDatabase } from "@/lib/firebase-store";
import type { AdminSettings, AppUser, GeneratedPdf, NewsletterDatabase, NewsletterIssue, Submission, SubmissionImage } from "@/lib/types";

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
  if (firebaseEnabled()) {
    try {
      return await readFirebaseDatabase();
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
    return JSON.parse(raw) as NewsletterDatabase;
  } catch {
    await writeDatabase(seedDatabase);
    return seedDatabase;
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
    id: nanoid()
  };

  database.users.push(user);
  await writeDatabase(database);
  const { password: _password, ...safeUser } = user;
  return safeUser;
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
