import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Trails (Trilhas) ─────────────────────────────────────────────────────────
export const trails = mysqlTable("trails", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  order: int("order").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trail = typeof trails.$inferSelect;
export type InsertTrail = typeof trails.$inferInsert;

// ─── Courses ──────────────────────────────────────────────────────────────────
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  trailId: int("trailId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  order: int("order").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  type: mysqlEnum("type", ["apostila", "videoaula"]).default("apostila").notNull(),
  content: text("content"), // markdown para apostila
  videoUrl: text("videoUrl"), // URL para videoaula
  order: int("order").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

// ─── Questions ────────────────────────────────────────────────────────────────
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  trailId: int("trailId").notNull(),
  courseId: int("courseId"), // null = questão geral da trilha
  text: text("text").notNull(),
  options: json("options").notNull(), // string[]
  correctIndex: int("correctIndex").notNull(), // índice da opção correta (0-based)
  explanation: text("explanation"),
  order: int("order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// ─── Quiz Attempts ────────────────────────────────────────────────────────────
export const quizAttempts = mysqlTable("quizAttempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trailId: int("trailId").notNull(),
  score: int("score").notNull(), // número de acertos
  total: int("total").notNull(), // total de questões (15)
  passed: boolean("passed").notNull(), // score/total >= 0.9
  answers: json("answers").notNull(), // { questionId: number, chosen: number }[]
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

// ─── Lesson Progress ──────────────────────────────────────────────────────────
export const lessonProgress = mysqlTable("lessonProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  courseId: int("courseId").notNull(),
  trailId: int("trailId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;

// ─── Certificates ─────────────────────────────────────────────────────────────
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trailId: int("trailId").notNull(),
  code: varchar("code", { length: 64 }).notNull().unique(), // código único de verificação
  studentName: varchar("studentName", { length: 256 }), // nome do aluno no momento da emissão
  trailName: varchar("trailName", { length: 256 }),     // nome da trilha no momento da emissão
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;
