import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Shield, ChevronLeft, BookOpen, Video, CheckCircle2, Circle,
  ClipboardList, Award, Lock, LogOut, User, Settings, LayoutDashboard
} from "lucide-react";

const LOGO_URL = "/manus-storage/logo-rb-48_c885cae4.png";

export default function TrailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: trail, isLoading: trailLoading } = trpc.trails.bySlug.useQuery({ slug });
  const { data: courses, isLoading: coursesLoading } = trpc.courses.byTrail.useQuery(
    { trailId: trail?.id ?? 0, publishedOnly: true },
    { enabled: !!trail?.id }
  );
  const { data: progressData } = trpc.progress.forTrail.useQuery(
    { trailId: trail?.id ?? 0 },
    { enabled: !!trail?.id && isAuthenticated }
  );
  const { data: canAttempt } = trpc.quiz.canAttemptToday.useQuery(
    { trailId: trail?.id ?? 0 },
    { enabled: !!trail?.id && isAuthenticated }
  );
  const { data: cert } = trpc.certificates.mine.useQuery(undefined, { enabled: isAuthenticated });

  const markComplete = trpc.lessons.markComplete.useMutation({
    onSuccess: () => {
      utils.progress.forTrail.invalidate({ trailId: trail?.id ?? 0 });
      utils.progress.overview.invalidate();
      toast.success("Aula marcada como concluída!");
    },
  });

  if (loading || trailLoading) return <TrailSkeleton />;
  if (!trail) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Trilha não encontrada.</p>
        <Button onClick={() => navigate("/")}>Voltar ao início</Button>
      </div>
    </div>
  );

  const completedIds = new Set(progressData?.completedIds ?? []);
  const totalLessons = progressData?.totalCount ?? 0;
  const completedCount = progressData?.completedCount ?? 0;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const hasCert = cert?.some((c) => c.trailId === trail.id);

  const handleMarkComplete = (lessonId: number, courseId: number) => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    markComplete.mutate({ lessonId, courseId, trailId: trail.id });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src={LOGO_URL} alt="Logo RB" className="w-8 h-8 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base tracking-tight">Academia RB</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide hidden sm:block">Segurança Eletrônica</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated && (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/perfil")}>
                  <User className="w-4 h-4 mr-1" /> Perfil
                </Button>
                {user?.role === "admin" && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                    <Settings className="w-4 h-4 mr-1" /> Admin
                  </Button>
                )}
              </>
            )}
          </nav>
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={() => logout().then(() => navigate("/"))}>
              <LogOut className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={() => window.location.href = getLoginUrl()}>Entrar</Button>
          )}
        </div>
      </header>

      <main className="container py-10 max-w-4xl">
        {/* Breadcrumb */}
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>

        {/* Header da trilha */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
          <div className="text-5xl">{trail.icon ?? "📚"}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{trail.name}</h1>
            <p className="text-muted-foreground mb-4">{trail.description}</p>
            {isAuthenticated && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso geral</span>
                  <span className="font-medium">{completedCount}/{totalLessons} aulas ({pct}%)</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            )}
          </div>
          {isAuthenticated && (
            <div className="flex flex-col gap-2 shrink-0">
              {hasCert ? (
                <Button variant="outline" className="border-yellow-500/50 text-yellow-400" onClick={() => navigate("/perfil")}>
                  <Award className="w-4 h-4 mr-2" /> Ver Certificado
                </Button>
              ) : (
                <Button
                  onClick={() => navigate(`/quiz/${trail.id}`)}
                  disabled={!canAttempt?.canAttempt}
                  className="glow-primary"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  {canAttempt?.canAttempt === false ? "Quiz feito hoje" : "Fazer Avaliação"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Cursos e aulas */}
        {coursesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : !courses || courses.length === 0 ? (
          <Card className="gradient-card border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground">
              <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>Nenhum curso disponível nesta trilha ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {courses.map((course, ci) => (
              <CourseAccordion
                key={course.id}
                course={course}
                courseIndex={ci + 1}
                trailId={trail.id}
                completedIds={completedIds}
                isAuthenticated={isAuthenticated}
                onMarkComplete={handleMarkComplete}
                onNavigate={navigate}
              />
            ))}
          </Accordion>
        )}

        {/* Aviso de avaliação */}
        {isAuthenticated && !hasCert && (
          <Card className="mt-8 border-primary/30 gradient-card">
            <CardContent className="p-5 flex items-center gap-4">
              <ClipboardList className="w-6 h-6 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">Avaliação da trilha</p>
                <p className="text-xs text-muted-foreground">
                  Conclua todas as aulas e realize a avaliação com 90% de aproveitamento para obter seu certificado.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/quiz/${trail.id}`)}
                disabled={!canAttempt?.canAttempt}
              >
                {canAttempt?.canAttempt === false ? "Amanhã" : "Avaliar"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function CourseAccordion({
  course, courseIndex, trailId, completedIds, isAuthenticated, onMarkComplete, onNavigate
}: {
  course: { id: number; title: string; description?: string | null };
  courseIndex: number;
  trailId: number;
  completedIds: Set<number>;
  isAuthenticated: boolean;
  onMarkComplete: (lessonId: number, courseId: number) => void;
  onNavigate: (path: string) => void;
}) {
  const { data: lessons } = trpc.lessons.byCourse.useQuery({ courseId: course.id, publishedOnly: true });
  const courseLessons = lessons ?? [];
  const completedInCourse = courseLessons.filter((l) => completedIds.has(l.id)).length;
  const allDone = courseLessons.length > 0 && completedInCourse === courseLessons.length;

  return (
    <AccordionItem value={`course-${course.id}`} className="gradient-card border border-border/50 rounded-lg px-0 overflow-hidden">
      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3 text-left flex-1 mr-4">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${allDone ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"}`}>
            {allDone ? <CheckCircle2 className="w-4 h-4" /> : courseIndex}
          </div>
          <div>
            <p className="font-semibold text-sm">{course.title}</p>
            {isAuthenticated && (
              <p className="text-xs text-muted-foreground">{completedInCourse}/{courseLessons.length} aulas concluídas</p>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-4">
        {courseLessons.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Nenhuma aula disponível.</p>
        ) : (
          <div className="space-y-2">
            {courseLessons.map((lesson) => {
              const done = completedIds.has(lesson.id);
              return (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="shrink-0">
                    {done
                      ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                      : <Circle className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${done ? "text-muted-foreground line-through" : ""}`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {lesson.type === "apostila"
                        ? <BookOpen className="w-3 h-3 text-primary" />
                        : <Video className="w-3 h-3 text-accent" />}
                      <span className="text-xs text-muted-foreground capitalize">{lesson.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isAuthenticated ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7"
                          onClick={() => onNavigate(`/aula/${lesson.id}`)}
                        >
                          Abrir
                        </Button>
                        {!done && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-green-500/40 text-green-400 hover:bg-green-500/10"
                            onClick={() => onMarkComplete(lesson.id, course.id)}
                          >
                            Concluir
                          </Button>
                        )}
                      </>
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function TrailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/50" />
      <div className="container py-10 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}
