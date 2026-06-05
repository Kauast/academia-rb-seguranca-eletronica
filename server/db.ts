import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Certificate,
  InsertCertificate,
  InsertCourse,
  InsertLesson,
  InsertLessonProgress,
  InsertQuestion,
  InsertQuizAttempt,
  InsertTrail,
  InsertUser,
  certificates,
  courses,
  lessonProgress,
  lessons,
  questions,
  quizAttempts,
  trails,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Trails ───────────────────────────────────────────────────────────────────
export async function getAllTrails(publishedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const q = db.select().from(trails);
  if (publishedOnly) return q.where(eq(trails.published, true)).orderBy(trails.order);
  return q.orderBy(trails.order);
}

export async function getTrailBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(trails).where(eq(trails.slug, slug)).limit(1);
  return r[0];
}

export async function getTrailById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(trails).where(eq(trails.id, id)).limit(1);
  return r[0];
}

export async function createTrail(data: InsertTrail) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(trails).values(data);
  const r = await db.select().from(trails).where(eq(trails.slug, data.slug!)).limit(1);
  return r[0];
}

export async function updateTrail(id: number, data: Partial<InsertTrail>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(trails).set(data).where(eq(trails.id, id));
}

export async function deleteTrail(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(trails).where(eq(trails.id, id));
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export async function getCoursesByTrail(trailId: number, publishedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const conds = [eq(courses.trailId, trailId)];
  if (publishedOnly) conds.push(eq(courses.published, true));
  return db.select().from(courses).where(and(...conds)).orderBy(courses.order);
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return r[0];
}

export async function createCourse(data: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const res = await db.insert(courses).values(data);
  const insertId = (res as unknown as [{ insertId: number }])[0]?.insertId;
  const r = await db.select().from(courses).where(eq(courses.id, insertId)).limit(1);
  return r[0];
}

export async function updateCourse(id: number, data: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(courses).where(eq(courses.id, id));
}

// ─── Lessons ──────────────────────────────────────────────────────────────────
export async function getLessonsByCourse(courseId: number, publishedOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const conds = [eq(lessons.courseId, courseId)];
  if (publishedOnly) conds.push(eq(lessons.published, true));
  return db.select().from(lessons).where(and(...conds)).orderBy(lessons.order);
}

export async function getLessonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return r[0];
}

export async function createLesson(data: InsertLesson) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const res = await db.insert(lessons).values(data);
  const insertId = (res as unknown as [{ insertId: number }])[0]?.insertId;
  const r = await db.select().from(lessons).where(eq(lessons.id, insertId)).limit(1);
  return r[0];
}

export async function updateLesson(id: number, data: Partial<InsertLesson>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(lessons).where(eq(lessons.id, id));
}

// ─── Questions ────────────────────────────────────────────────────────────────
export async function getQuestionsByTrail(trailId: number, activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const conds = [eq(questions.trailId, trailId)];
  if (activeOnly) conds.push(eq(questions.active, true));
  return db.select().from(questions).where(and(...conds)).orderBy(questions.order);
}

export async function getQuestionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  return r[0];
}

export async function createQuestion(data: InsertQuestion) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const res = await db.insert(questions).values(data);
  const insertId = (res as unknown as [{ insertId: number }])[0]?.insertId;
  const r = await db.select().from(questions).where(eq(questions.id, insertId)).limit(1);
  return r[0];
}

export async function updateQuestion(id: number, data: Partial<InsertQuestion>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(questions).set(data).where(eq(questions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(questions).where(eq(questions.id, id));
}

// ─── Lesson Progress ──────────────────────────────────────────────────────────
export async function getLessonProgressByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
}

export async function getLessonProgressByUserAndTrail(userId: number, trailId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.trailId, trailId)));
}

export async function markLessonComplete(data: InsertLessonProgress) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // idempotent: ignore if already exists
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, data.userId), eq(lessonProgress.lessonId, data.lessonId)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(lessonProgress).values(data);
  const r = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, data.userId), eq(lessonProgress.lessonId, data.lessonId)))
    .limit(1);
  return r[0];
}

// ─── Quiz Attempts ────────────────────────────────────────────────────────────
export async function getQuizAttemptsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, userId))
    .orderBy(desc(quizAttempts.attemptedAt));
}

export async function getQuizAttemptsByUserAndTrail(userId: number, trailId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.trailId, trailId)))
    .orderBy(desc(quizAttempts.attemptedAt));
}

export async function hasAttemptedTodayForTrail(userId: number, trailId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const r = await db
    .select()
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.userId, userId),
        eq(quizAttempts.trailId, trailId),
        gte(quizAttempts.attemptedAt, todayStart),
        lt(quizAttempts.attemptedAt, tomorrowStart),
      ),
    )
    .limit(1);
  return r.length > 0;
}

export async function createQuizAttempt(data: InsertQuizAttempt) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const res = await db.insert(quizAttempts).values(data);
  const insertId = (res as unknown as [{ insertId: number }])[0]?.insertId;
  const r = await db.select().from(quizAttempts).where(eq(quizAttempts.id, insertId)).limit(1);
  return r[0];
}

export async function hasPassedQuizForTrail(userId: number, trailId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const r = await db
    .select()
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.userId, userId),
        eq(quizAttempts.trailId, trailId),
        eq(quizAttempts.passed, true),
      ),
    )
    .limit(1);
  return r.length > 0;
}

// ─── Certificates ─────────────────────────────────────────────────────────────
export async function getCertificatesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(certificates)
    .where(eq(certificates.userId, userId))
    .orderBy(desc(certificates.issuedAt));
}

export async function getCertificateByCode(code: string): Promise<Certificate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(certificates).where(eq(certificates.code, code)).limit(1);
  return r[0];
}

export async function getCertificateByUserAndTrail(userId: number, trailId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.userId, userId), eq(certificates.trailId, trailId)))
    .limit(1);
  return r[0];
}

export async function createCertificate(data: InsertCertificate) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(certificates).values(data);
  return getCertificateByCode(data.code);
}

/**
 * Retorna a aula anterior ou próxima dentro do mesmo curso.
 * direction: 'prev' | 'next'
 */
export async function getAdjacentLesson(lessonId: number, direction: 'prev' | 'next') {
  const db = await getDb();
  if (!db) return undefined;
  const current = await getLessonById(lessonId);
  if (!current) return undefined;
  const all = await getLessonsByCourse(current.courseId, true);
  const idx = all.findIndex((l) => l.id === lessonId);
  if (idx === -1) return undefined;
  const target = direction === 'prev' ? all[idx - 1] : all[idx + 1];
  return target ?? undefined;
}

// ─── Progress helpers ─────────────────────────────────────────────────────────
export async function countLessonsInTrail(trailId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const trailCourses = await getCoursesByTrail(trailId, true);
  let total = 0;
  for (const c of trailCourses) {
    const ls = await getLessonsByCourse(c.id, true);
    total += ls.length;
  }
  return total;
}

export async function countCompletedLessonsInTrail(userId: number, trailId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const r = await db
    .select({ count: sql<number>`count(*)` })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.trailId, trailId)));
  return Number(r[0]?.count ?? 0);
}

export async function getAllCertificates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates).orderBy(desc(certificates.issuedAt));
}
