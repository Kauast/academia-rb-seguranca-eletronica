import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Video,
  CheckCircle2,
  Shield,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const LOGO_URL = "/manus-storage/logo-rb-48_c885cae4.png";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const id = parseInt(lessonId ?? "0", 10);
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: lesson, isLoading } = trpc.lessons.byId.useQuery(
    { id },
    { enabled: !!id && isAuthenticated }
  );

  const { data: course } = trpc.courses.byId.useQuery(
    { id: lesson?.courseId ?? 0 },
    { enabled: !!lesson?.courseId }
  );

  const { data: trail } = trpc.trails.byId.useQuery(
    { id: course?.trailId ?? 0 },
    { enabled: !!course?.trailId }
  );

  const { data: progress } = trpc.progress.forTrail.useQuery(
    { trailId: course?.trailId ?? 0 },
    { enabled: !!course?.trailId && isAuthenticated }
  );

  // ── Navegação entre aulas ──────────────────────────────────────────────────
  const { data: prevLesson } = trpc.lessons.adjacent.useQuery(
    { lessonId: id, direction: "prev" },
    { enabled: !!id && isAuthenticated }
  );

  const { data: nextLesson } = trpc.lessons.adjacent.useQuery(
    { lessonId: id, direction: "next" },
    { enabled: !!id && isAuthenticated }
  );

  const markComplete = trpc.lessons.markComplete.useMutation({
    onSuccess: () => {
      utils.progress.forTrail.invalidate({ trailId: course?.trailId ?? 0 });
      utils.progress.overview.invalidate();
      toast.success("Aula marcada como concluída!");
    },
  });

  if (loading) return <LessonSkeleton />;

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (isLoading) return <LessonSkeleton />;

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Aula não encontrada.</p>
          <Button onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  const isDone = progress?.completedIds.includes(lesson.id) ?? false;

  const handleMarkComplete = () => {
    if (!course || !trail) return;
    markComplete.mutate({
      lessonId: lesson.id,
      courseId: course.id,
      trailId: trail.id,
    });
  };

  const goToLesson = (targetId: number) => navigate(`/aula/${targetId}`);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <button
            className="flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <img src={LOGO_URL} alt="Logo RB" className="w-8 h-8 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base tracking-tight">Academia RB</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide hidden sm:block">Segurança Eletrônica</span>
            </div>
          </button>

          {/* Navegação rápida no header */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!prevLesson}
              onClick={() => prevLesson && goToLesson(prevLesson.id)}
              className="gap-1 text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!nextLesson}
              onClick={() => nextLesson && goToLesson(nextLesson.id)}
              className="gap-1 text-muted-foreground"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl flex-1">
        {/* Breadcrumb */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-muted-foreground"
          onClick={() =>
            trail ? navigate(`/trilha/${trail.slug}`) : navigate("/dashboard")
          }
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {trail ? trail.name : "Voltar"}
        </Button>

        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {lesson.type === "apostila" ? (
                <BookOpen className="w-4 h-4 text-primary" />
              ) : (
                <Video className="w-4 h-4 text-accent" />
              )}
              <Badge variant="secondary" className="text-xs capitalize">
                {lesson.type}
              </Badge>
              {isDone && (
                <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Concluída
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            {course && (
              <p className="text-sm text-muted-foreground mt-1">{course.title}</p>
            )}
          </div>
          {!isDone && (
            <Button
              onClick={handleMarkComplete}
              disabled={markComplete.isPending}
              className="shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marcar como concluída
            </Button>
          )}
        </div>

        {/* Conteúdo */}
        <div className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
          {lesson.type === "videoaula" && lesson.videoUrl ? (
            <div className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                {lesson.videoUrl.includes("youtube.com") ||
                lesson.videoUrl.includes("youtu.be") ? (
                  <iframe
                    src={lesson.videoUrl
                      .replace("watch?v=", "embed/")
                      .replace("youtu.be/", "www.youtube.com/embed/")}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video src={lesson.videoUrl} controls className="w-full h-full" />
                )}
              </div>
              {lesson.content && (
                <div className="prose prose-invert max-w-none">
                  <Streamdown>{lesson.content}</Streamdown>
                </div>
              )}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              {lesson.content ? (
                <Streamdown>{lesson.content}</Streamdown>
              ) : (
                <p className="text-muted-foreground">Conteúdo não disponível.</p>
              )}
            </div>
          )}
        </div>

        {/* Botão de conclusão */}
        {!isDone && (
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={handleMarkComplete}
              disabled={markComplete.isPending}
              className="px-10"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Concluir esta aula
            </Button>
          </div>
        )}

        {/* ── Navegação inferior entre aulas ── */}
        <div className="mt-10 grid grid-cols-2 gap-4">
          {/* Aula anterior */}
          <div>
            {prevLesson ? (
              <button
                onClick={() => goToLesson(prevLesson.id)}
                className="w-full text-left p-4 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-card/80 transition-all group"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                  Aula anterior
                </div>
                <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {prevLesson.title}
                </p>
              </button>
            ) : (
              <div className="w-full p-4 rounded-xl border border-border/20 opacity-40 cursor-not-allowed">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Aula anterior
                </div>
                <p className="text-sm text-muted-foreground">Primeira aula do curso</p>
              </div>
            )}
          </div>

          {/* Próxima aula */}
          <div>
            {nextLesson ? (
              <button
                onClick={() => goToLesson(nextLesson.id)}
                className="w-full text-right p-4 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-card/80 transition-all group"
              >
                <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-1">
                  Próxima aula
                  <ArrowRight className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {nextLesson.title}
                </p>
              </button>
            ) : (
              <div className="w-full p-4 rounded-xl border border-border/20 opacity-40 cursor-not-allowed text-right">
                <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-1">
                  Próxima aula
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm text-muted-foreground">Última aula do curso</p>
              </div>
            )}
          </div>
        </div>

        {/* Voltar à trilha */}
        {trail && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => navigate(`/trilha/${trail.slug}`)}
            >
              Ver todas as aulas de {trail.name}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function LessonSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/50" />
      <div className="container py-8 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-96" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    </div>
  );
}
