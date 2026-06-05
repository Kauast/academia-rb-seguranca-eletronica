import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Shield, ChevronLeft, CheckCircle2, XCircle, AlertCircle, ClipboardList } from "lucide-react";

type Answer = { questionId: number; chosen: number };

export default function QuizPage() {
  const { trailId } = useParams<{ trailId: string }>();
  const id = parseInt(trailId ?? "0", 10);
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  const { data: trail } = trpc.trails.byId.useQuery({ id }, { enabled: !!id });
  const { data: canAttempt } = trpc.quiz.canAttemptToday.useQuery({ trailId: id }, { enabled: !!id && isAuthenticated });
  const { data: questions, isLoading, error } = trpc.quiz.start.useQuery(
    { trailId: id },
    { enabled: !!id && isAuthenticated && !submitted && (canAttempt?.canAttempt ?? false) }
  );

  const submitMutation = trpc.quiz.submit.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  if (loading) return <QuizSkeleton />;
  if (!isAuthenticated) { window.location.href = getLoginUrl(); return null; }

  const handleSelect = (questionId: number, chosen: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: chosen }));
  };

  const handleSubmit = () => {
    if (!questions) return;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      toast.error(`Responda todas as questões antes de submeter. (${answeredCount}/${questions.length})`);
      return;
    }
    const payload: Answer[] = questions.map((q) => ({ questionId: q.id, chosen: answers[q.id]! }));
    submitMutation.mutate({ trailId: id, answers: payload });
  };

  const answeredCount = Object.keys(answers).length;
  const totalQ = questions?.length ?? 15;
  const progress = Math.round((answeredCount / totalQ) * 100);

  // Resultado
  if (submitted && result) {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
          <div className="container flex items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Academia RB</span>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="gradient-card border-border/50 max-w-md w-full text-center">
            <CardContent className="p-8">
              <div className="mb-6">
                {result.passed
                  ? <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
                  : <XCircle className="w-16 h-16 text-destructive mx-auto" />}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {result.passed ? "Parabéns! Aprovado!" : "Não aprovado"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {result.passed
                  ? "Você atingiu a pontuação mínima. Já pode emitir seu certificado!"
                  : "Você precisa de 90% de aproveitamento. Tente novamente amanhã."}
              </p>
              <div className="bg-muted/40 rounded-xl p-4 mb-6">
                <div className="text-4xl font-bold mb-1">{pct}%</div>
                <div className="text-sm text-muted-foreground">{result.score} de {result.total} questões corretas</div>
                <Progress value={pct} className={`h-2 mt-3 ${result.passed ? "[&>div]:bg-green-400" : "[&>div]:bg-destructive"}`} />
              </div>
              <div className="flex flex-col gap-3">
                {result.passed && (
                  <Button className="glow-primary" onClick={() => navigate(`/trilha/${trail?.slug}`)}>
                    Emitir Certificado
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate(`/trilha/${trail?.slug ?? ""}`)}>
                  Voltar à Trilha
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Bloqueado — já tentou hoje
  if (canAttempt?.canAttempt === false) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
          <div className="container flex items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Academia RB</span>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="gradient-card border-border/50 max-w-md w-full text-center">
            <CardContent className="p-8">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Limite diário atingido</h2>
              <p className="text-muted-foreground mb-6">
                Você já realizou uma tentativa hoje. Volte amanhã para tentar novamente.
              </p>
              <Button variant="outline" onClick={() => navigate(`/trilha/${trail?.slug ?? ""}`)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar à Trilha
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Erro (questões insuficientes etc.)
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
          <div className="container flex items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Academia RB</span>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="gradient-card border-border/50 max-w-md w-full text-center">
            <CardContent className="p-8">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Avaliação indisponível</h2>
              <p className="text-muted-foreground mb-6">{error.message}</p>
              <Button variant="outline" onClick={() => navigate(`/trilha/${trail?.slug ?? ""}`)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar à Trilha
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Academia RB</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{answeredCount}/{totalQ} respondidas</span>
            <Badge variant="secondary">{progress}%</Badge>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-3xl">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground" onClick={() => navigate(`/trilha/${trail?.slug ?? ""}`)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Avaliação — {trail?.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Responda todas as 15 questões. Aprovação mínima: 90% (14 acertos).
          </p>
          <Progress value={progress} className="h-1.5" />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="space-y-5">
            {questions?.map((q, qi) => (
              <Card key={q.id} className={`gradient-card border transition-colors ${answers[q.id] !== undefined ? "border-primary/40" : "border-border/50"}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Questão {qi + 1} de {questions.length}</CardTitle>
                  <p className="text-base font-medium leading-relaxed">{q.text}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(q.options as string[]).map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => handleSelect(q.id, oi)}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                        answers[q.id] === oi
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border/50 hover:border-primary/40 hover:bg-white/5 text-muted-foreground"
                      }`}
                    >
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  ))}
                </CardContent>
              </Card>
            ))}

            {questions && questions.length > 0 && (
              <div className="pt-4 flex justify-center">
                <Button
                  size="lg"
                  className="glow-primary px-12"
                  onClick={handleSubmit}
                  disabled={answeredCount < totalQ || submitMutation.isPending}
                >
                  {submitMutation.isPending ? "A submeter..." : `Submeter Avaliação (${answeredCount}/${totalQ})`}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function QuizSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/50" />
      <div className="container py-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    </div>
  );
}
