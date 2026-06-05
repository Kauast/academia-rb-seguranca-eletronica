import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  countCompletedLessonsInTrail,
  countLessonsInTrail,
  createCertificate,
  createCourse,
  createLesson,
  createQuestion,
  createQuizAttempt,
  createTrail,
  deleteCourse,
  deleteLesson,
  deleteQuestion,
  deleteTrail,
  getAllCertificates,
  getAllTrails,
  getAllUsers,
  getCertificateByCode,
  getCertificateByUserAndTrail,
  getCertificatesByUser,
  getCourseById,
  getCoursesByTrail,
  getLessonById,
  getLessonProgressByUser,
  getLessonProgressByUserAndTrail,
  getLessonsByCourse,
  getQuestionsByTrail,
  getQuizAttemptsByUser,
  getQuizAttemptsByUserAndTrail,
  getTrailById,
  getTrailBySlug,
  hasAttemptedTodayForTrail,
  hasPassedQuizForTrail,
  markLessonComplete,
  updateCourse,
  updateLesson,
  updateQuestion,
  updateTrail,
} from "./db";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  return next({ ctx });
});

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_TRAILS = [
  { slug: "alarme-monitorado", name: "Alarme Monitorado", description: "Aprenda a instalar, configurar e monitorar sistemas de alarme residencial e comercial com sensores modernos.", icon: "🔔", order: 1 },
  { slug: "alarme-com-ia", name: "Alarme com IA", description: "Sistemas de alarme inteligentes com inteligência artificial para detecção avançada de ameaças e automação.", icon: "🤖", order: 2 },
  { slug: "cftv-analogico", name: "CFTV Analógico", description: "Fundamentos e instalação de sistemas de circuito fechado de televisão analógico com câmeras e DVR.", icon: "📹", order: 3 },
  { slug: "cftv-ip", name: "CFTV IP", description: "Sistemas de CFTV baseados em rede IP com câmeras de alta resolução, NVR e gerenciamento remoto.", icon: "🌐", order: 4 },
  { slug: "cftv-ip-com-ia", name: "CFTV IP com IA", description: "CFTV IP avançado com inteligência artificial para reconhecimento facial, análise de comportamento e alertas.", icon: "🎯", order: 5 },
  { slug: "radio-ponto-a-ponto", name: "Rádio Ponto a Ponto", description: "Comunicação via rádio frequência para segurança eletrônica, links ponto a ponto e redes de rádio.", icon: "📡", order: 6 },
  { slug: "redes-basico", name: "Redes Básico", description: "Fundamentos de redes de computadores aplicados à segurança eletrônica: cabeamento, switches e roteadores.", icon: "🔗", order: 7 },
  { slug: "redes-avancado", name: "Redes Avançado", description: "Redes avançadas para segurança eletrônica: VLANs, VPNs, firewalls e monitoramento de rede.", icon: "⚙️", order: 8 },
];

// ─── Routers ──────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Trails ───────────────────────────────────────────────────────────────
  trails: router({
    list: publicProcedure
      .input(z.object({ publishedOnly: z.boolean().optional() }).optional())
      .query(({ input }) => getAllTrails(input?.publishedOnly ?? false)),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getTrailBySlug(input.slug)),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getTrailById(input.id)),

    create: adminProcedure
      .input(z.object({
        slug: z.string().min(2),
        name: z.string().min(2),
        description: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(({ input }) => createTrail(input)),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateTrail(id, data); }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteTrail(input.id)),

    seed: adminProcedure.mutation(async () => {
      const existing = await getAllTrails();
      if (existing.length > 0) return { seeded: false, message: "Trilhas já existem." };
      for (const t of SEED_TRAILS) await createTrail({ ...t, published: true });
      return { seeded: true, message: "8 trilhas criadas com sucesso." };
    }),
  }),

  // ─── Courses ──────────────────────────────────────────────────────────────
  courses: router({
    byTrail: publicProcedure
      .input(z.object({ trailId: z.number(), publishedOnly: z.boolean().optional() }))
      .query(({ input }) => getCoursesByTrail(input.trailId, input.publishedOnly ?? false)),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getCourseById(input.id)),

    create: adminProcedure
      .input(z.object({
        trailId: z.number(),
        title: z.string().min(2),
        description: z.string().optional(),
        order: z.number().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(({ input }) => createCourse(input)),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        order: z.number().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateCourse(id, data); }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCourse(input.id)),
  }),

  // ─── Lessons ──────────────────────────────────────────────────────────────
  lessons: router({
    byCourse: publicProcedure
      .input(z.object({ courseId: z.number(), publishedOnly: z.boolean().optional() }))
      .query(({ input }) => getLessonsByCourse(input.courseId, input.publishedOnly ?? false)),

    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getLessonById(input.id)),

    markComplete: protectedProcedure
      .input(z.object({ lessonId: z.number(), courseId: z.number(), trailId: z.number() }))
      .mutation(({ input, ctx }) =>
        markLessonComplete({ userId: ctx.user.id, lessonId: input.lessonId, courseId: input.courseId, trailId: input.trailId }),
      ),

    create: adminProcedure
      .input(z.object({
        courseId: z.number(),
        title: z.string().min(2),
        type: z.enum(["apostila", "videoaula"]),
        content: z.string().optional(),
        videoUrl: z.string().optional(),
        order: z.number().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(({ input }) => createLesson(input)),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        type: z.enum(["apostila", "videoaula"]).optional(),
        content: z.string().optional(),
        videoUrl: z.string().optional(),
        order: z.number().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateLesson(id, data); }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteLesson(input.id)),
  }),

  // ─── Questions ────────────────────────────────────────────────────────────
  questions: router({
    byTrail: adminProcedure
      .input(z.object({ trailId: z.number() }))
      .query(({ input }) => getQuestionsByTrail(input.trailId)),

    create: adminProcedure
      .input(z.object({
        trailId: z.number(),
        courseId: z.number().optional(),
        text: z.string().min(5),
        options: z.array(z.string()).min(2).max(5),
        correctIndex: z.number().min(0),
        explanation: z.string().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input }) => createQuestion(input as Parameters<typeof createQuestion>[0])),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        text: z.string().optional(),
        options: z.array(z.string()).optional(),
        correctIndex: z.number().optional(),
        explanation: z.string().optional(),
        order: z.number().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateQuestion(id, data as Parameters<typeof updateQuestion>[1]); }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteQuestion(input.id)),
  }),

  // ─── Quiz ─────────────────────────────────────────────────────────────────
  quiz: router({
    /** Retorna 15 questões aleatórias para a trilha (sem revelar resposta correta) */
    start: protectedProcedure
      .input(z.object({ trailId: z.number() }))
      .query(async ({ input, ctx }) => {
        const alreadyToday = await hasAttemptedTodayForTrail(ctx.user.id, input.trailId);
        if (alreadyToday) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Você já realizou uma tentativa hoje. Tente novamente amanhã." });

        const allQ = await getQuestionsByTrail(input.trailId, true);
        if (allQ.length < 15) throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Esta trilha ainda não tem questões suficientes (mínimo 15, disponíveis: ${allQ.length}).` });

        // shuffle & pick 15
        const shuffled = [...allQ].sort(() => Math.random() - 0.5).slice(0, 15);
        return shuffled.map(({ id, text, options }) => ({ id, text, options }));
      }),

    /** Submete respostas e persiste resultado */
    submit: protectedProcedure
      .input(z.object({
        trailId: z.number(),
        answers: z.array(z.object({ questionId: z.number(), chosen: z.number() })),
      }))
      .mutation(async ({ input, ctx }) => {
        const alreadyToday = await hasAttemptedTodayForTrail(ctx.user.id, input.trailId);
        if (alreadyToday) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Você já realizou uma tentativa hoje." });
        if (input.answers.length !== 15) throw new TRPCError({ code: "BAD_REQUEST", message: "São necessárias exatamente 15 respostas." });

        const allQ = await getQuestionsByTrail(input.trailId, true);
        const qMap = new Map(allQ.map((q) => [q.id, q]));

        let score = 0;
        for (const ans of input.answers) {
          const q = qMap.get(ans.questionId);
          if (q && q.correctIndex === ans.chosen) score++;
        }

        const total = 15;
        const passed = score / total >= 0.9;

        const attempt = await createQuizAttempt({
          userId: ctx.user.id,
          trailId: input.trailId,
          score,
          total,
          passed,
          answers: input.answers,
        });

        return { score, total, passed, attemptId: attempt?.id };
      }),

    attemptsForTrail: protectedProcedure
      .input(z.object({ trailId: z.number() }))
      .query(({ input, ctx }) => getQuizAttemptsByUserAndTrail(ctx.user.id, input.trailId)),

    myAttempts: protectedProcedure.query(({ ctx }) => getQuizAttemptsByUser(ctx.user.id)),

    canAttemptToday: protectedProcedure
      .input(z.object({ trailId: z.number() }))
      .query(async ({ input, ctx }) => {
        const attempted = await hasAttemptedTodayForTrail(ctx.user.id, input.trailId);
        return { canAttempt: !attempted };
      }),
  }),

  // ─── Progress ─────────────────────────────────────────────────────────────
  progress: router({
    myLessons: protectedProcedure.query(({ ctx }) => getLessonProgressByUser(ctx.user.id)),

    forTrail: protectedProcedure
      .input(z.object({ trailId: z.number() }))
      .query(async ({ input, ctx }) => {
        const completed = await getLessonProgressByUserAndTrail(ctx.user.id, input.trailId);
        const total = await countLessonsInTrail(input.trailId);
        return { completedIds: completed.map((lp) => lp.lessonId), completedCount: completed.length, totalCount: total };
      }),

    overview: protectedProcedure.query(async ({ ctx }) => {
      const allTrails = await getAllTrails(true);
      const result = await Promise.all(
        allTrails.map(async (trail) => {
          const completed = await countCompletedLessonsInTrail(ctx.user.id, trail.id);
          const total = await countLessonsInTrail(trail.id);
          const passed = await hasPassedQuizForTrail(ctx.user.id, trail.id);
          const cert = await getCertificateByUserAndTrail(ctx.user.id, trail.id);
          return { trail, completedLessons: completed, totalLessons: total, quizPassed: passed, hasCertificate: !!cert };
        }),
      );
      return result;
    }),
  }),

  // ─── Certificates ─────────────────────────────────────────────────────────
  certificates: router({
    mine: protectedProcedure.query(({ ctx }) => getCertificatesByUser(ctx.user.id)),

    verify: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const cert = await getCertificateByCode(input.code);
        if (!cert) return null;
        const trail = await getTrailById(cert.trailId);
        return { ...cert, trailName: trail?.name };
      }),

    /** Emite certificado se elegível (todos os cursos concluídos + quiz aprovado) */
    issue: protectedProcedure
      .input(z.object({ trailId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verificar se já tem certificado
        const existing = await getCertificateByUserAndTrail(ctx.user.id, input.trailId);
        if (existing) return existing;

        // Verificar quiz aprovado
        const passed = await hasPassedQuizForTrail(ctx.user.id, input.trailId);
        if (!passed) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "É necessário aprovar a avaliação da trilha para emitir o certificado." });

        // Verificar todas as aulas concluídas
        const total = await countLessonsInTrail(input.trailId);
        const completed = await countCompletedLessonsInTrail(ctx.user.id, input.trailId);
        if (total === 0) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A trilha não possui aulas cadastradas." });
        if (completed < total) throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Conclua todas as aulas da trilha antes de emitir o certificado (${completed}/${total} concluídas).` });

        const code = nanoid(16).toUpperCase();
        const cert = await createCertificate({ userId: ctx.user.id, trailId: input.trailId, code });
        return cert;
      }),
  }),

  // ─── Admin ────────────────────────────────────────────────────────────────
  admin: router({
    users: adminProcedure.query(() => getAllUsers()),
    allCertificates: adminProcedure.query(() => getAllCertificates()),
    allTrails: adminProcedure.query(() => getAllTrails()),
  }),
});

export type AppRouter = typeof appRouter;
