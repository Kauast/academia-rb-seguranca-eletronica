import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getQuestionsByTrail: vi.fn(),
    hasAttemptedTodayForTrail: vi.fn(),
    createQuizAttempt: vi.fn(),
    getQuizAttemptsByUser: vi.fn(),
    hasPassedQuizForTrail: vi.fn(),
    getCertificateByUserAndTrail: vi.fn(),
    createCertificate: vi.fn(),
    countLessonsInTrail: vi.fn(),
    countCompletedLessonsInTrail: vi.fn(),
  };
});

import {
  getQuestionsByTrail,
  hasAttemptedTodayForTrail,
  createQuizAttempt,
  hasPassedQuizForTrail,
  getCertificateByUserAndTrail,
  createCertificate,
  countLessonsInTrail,
  countCompletedLessonsInTrail,
} from "./db";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeCtx(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

/** Gera N questões de exemplo com a resposta correta no índice 0 */
function makeQuestions(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    trailId: 1,
    courseId: null,
    text: `Questão ${i + 1}`,
    options: ["Certa", "Errada A", "Errada B", "Errada C"],
    correctIndex: 0,
    explanation: null,
    order: i,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

// ─── Testes ───────────────────────────────────────────────────────────────────
describe("quiz.canAttemptToday", () => {
  it("retorna canAttempt=true quando não houve tentativa hoje", async () => {
    vi.mocked(hasAttemptedTodayForTrail).mockResolvedValue(false);
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.quiz.canAttemptToday({ trailId: 1 });
    expect(result.canAttempt).toBe(true);
  });

  it("retorna canAttempt=false quando já houve tentativa hoje", async () => {
    vi.mocked(hasAttemptedTodayForTrail).mockResolvedValue(true);
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.quiz.canAttemptToday({ trailId: 1 });
    expect(result.canAttempt).toBe(false);
  });
});

describe("quiz.submit — regra de aprovação 90%", () => {
  beforeEach(() => {
    vi.mocked(hasAttemptedTodayForTrail).mockResolvedValue(false);
    vi.mocked(getQuestionsByTrail).mockResolvedValue(makeQuestions(15));
    vi.mocked(createQuizAttempt).mockImplementation(async (data) => ({
      id: 1,
      ...data,
      attemptedAt: new Date(),
    }));
  });

  it("aprova com 15/15 acertos (100%)", async () => {
    const questions = makeQuestions(15);
    const answers = questions.map((q) => ({ questionId: q.id, chosen: 0 })); // todas corretas
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.quiz.submit({ trailId: 1, answers });
    expect(result.score).toBe(15);
    expect(result.total).toBe(15);
    expect(result.passed).toBe(true);
  });

  it("aprova com 14/15 acertos (93.3% ≥ 90%)", async () => {
    const questions = makeQuestions(15);
    const answers = questions.map((q, i) => ({ questionId: q.id, chosen: i === 14 ? 1 : 0 })); // 14 certas
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.quiz.submit({ trailId: 1, answers });
    expect(result.score).toBe(14);
    expect(result.passed).toBe(true);
  });

  it("reprova com 13/15 acertos (86.7% < 90%)", async () => {
    const questions = makeQuestions(15);
    const answers = questions.map((q, i) => ({ questionId: q.id, chosen: i >= 13 ? 1 : 0 })); // 13 certas
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.quiz.submit({ trailId: 1, answers });
    expect(result.score).toBe(13);
    expect(result.passed).toBe(false);
  });

  it("reprova com 0/15 acertos", async () => {
    const questions = makeQuestions(15);
    const answers = questions.map((q) => ({ questionId: q.id, chosen: 1 })); // todas erradas
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.quiz.submit({ trailId: 1, answers });
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });
});

describe("quiz.submit — limite de 1 tentativa por dia", () => {
  it("lança erro FORBIDDEN se já tentou hoje", async () => {
    vi.mocked(hasAttemptedTodayForTrail).mockResolvedValue(true);
    vi.mocked(getQuestionsByTrail).mockResolvedValue(makeQuestions(15));
    const questions = makeQuestions(15);
    const answers = questions.map((q) => ({ questionId: q.id, chosen: 0 }));
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.quiz.submit({ trailId: 1, answers })).rejects.toThrow();
  });
});

describe("certificates.issue — elegibilidade", () => {
  beforeEach(() => {
    vi.mocked(getCertificateByUserAndTrail).mockResolvedValue(undefined);
  });

  it("lança erro se o quiz não foi aprovado", async () => {
    vi.mocked(hasPassedQuizForTrail).mockResolvedValue(false);
    vi.mocked(countLessonsInTrail).mockResolvedValue(5);
    vi.mocked(countCompletedLessonsInTrail).mockResolvedValue(5);
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.certificates.issue({ trailId: 1 })).rejects.toThrow(/avalia/i);
  });

  it("lança erro se nem todas as aulas foram concluídas", async () => {
    vi.mocked(hasPassedQuizForTrail).mockResolvedValue(true);
    vi.mocked(countLessonsInTrail).mockResolvedValue(5);
    vi.mocked(countCompletedLessonsInTrail).mockResolvedValue(3);
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.certificates.issue({ trailId: 1 })).rejects.toThrow(/aulas/i);
  });

  it("emite certificado quando elegível (quiz aprovado + todas aulas concluídas)", async () => {
    vi.mocked(hasPassedQuizForTrail).mockResolvedValue(true);
    vi.mocked(countLessonsInTrail).mockResolvedValue(5);
    vi.mocked(countCompletedLessonsInTrail).mockResolvedValue(5);
    vi.mocked(createCertificate).mockImplementation(async (data) => ({
      id: 99,
      ...data,
      issuedAt: new Date(),
    }));
    const caller = appRouter.createCaller(makeCtx());
    const cert = await caller.certificates.issue({ trailId: 1 });
    expect(cert).toMatchObject({ userId: 42, trailId: 1 });
    expect(typeof cert.code).toBe("string");
    expect(cert.code.length).toBeGreaterThan(0);
  });

  it("retorna certificado existente sem criar duplicata", async () => {
    const existing = { id: 77, userId: 42, trailId: 1, code: "EXISTENTE123", issuedAt: new Date() };
    vi.mocked(getCertificateByUserAndTrail).mockResolvedValue(existing);
    vi.mocked(createCertificate).mockClear();
    const caller = appRouter.createCaller(makeCtx());
    const cert = await caller.certificates.issue({ trailId: 1 });
    expect(cert.code).toBe("EXISTENTE123");
    expect(createCertificate).not.toHaveBeenCalled();
  });
});
