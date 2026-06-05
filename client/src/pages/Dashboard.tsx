import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import {
  BookOpen, Award, ChevronRight, LayoutDashboard, LogOut, User, Settings, Shield
} from "lucide-react";

const LOGO_URL = "/manus-storage/logo-rb-48_c885cae4.png";

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: overview, isLoading } = trpc.progress.overview.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: certs } = trpc.certificates.mine.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) return <DashboardSkeleton />;
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const totalTrails = overview?.length ?? 0;
  const completedTrails = overview?.filter((t) => t.hasCertificate).length ?? 0;
  const inProgress = overview?.filter((t) => t.completedLessons > 0 && !t.hasCertificate) ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <button className="flex items-center gap-2.5" onClick={() => navigate("/")}>
            <img src={LOGO_URL} alt="Logo RB" className="w-8 h-8 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base tracking-tight">Academia RB</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide hidden sm:block">Segurança Eletrônica</span>
            </div>
          </button>
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-primary">
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
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.name?.split(" ")[0]}</span>
            <Button variant="ghost" size="sm" onClick={() => logout().then(() => navigate("/"))}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        {/* Boas-vindas */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Olá, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground">Continue de onde parou e avance nas suas trilhas.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Trilhas disponíveis", value: totalTrails, icon: <BookOpen className="w-5 h-5 text-primary" /> },
            { label: "Certificados obtidos", value: certs?.length ?? 0, icon: <Award className="w-5 h-5 text-yellow-400" /> },
            { label: "Trilhas em andamento", value: inProgress.length, icon: <LayoutDashboard className="w-5 h-5 text-accent" /> },
            { label: "Trilhas concluídas", value: completedTrails, icon: <Shield className="w-5 h-5 text-green-400" /> },
          ].map((s) => (
            <Card key={s.label} className="gradient-card border-border/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="shrink-0">{s.icon}</div>
                <div>
                  <div className="text-2xl font-bold">{isLoading ? "—" : s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trilhas em andamento */}
        {inProgress.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Em andamento</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgress.map(({ trail, completedLessons, totalLessons, quizPassed }) => {
                const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                return (
                  <Card
                    key={trail.id}
                    className="gradient-card border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/trilha/${trail.slug}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-2xl mb-1">{trail.icon ?? "📚"}</div>
                          <h3 className="font-semibold text-sm">{trail.name}</h3>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                      </div>
                      <Progress value={pct} className="h-1.5 mb-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{completedLessons}/{totalLessons} aulas</span>
                        {quizPassed && <Badge variant="secondary" className="text-xs">Quiz ✓</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Todas as trilhas */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Todas as trilhas</h2>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {overview?.map(({ trail, completedLessons, totalLessons, hasCertificate }) => {
                const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                return (
                  <Card
                    key={trail.id}
                    className="gradient-card border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => navigate(`/trilha/${trail.slug}`)}
                  >
                    <CardContent className="p-5">
                      <div className="text-2xl mb-2">{trail.icon ?? "📚"}</div>
                      <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">{trail.name}</h3>
                      <Progress value={pct} className="h-1 mb-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{pct}%</span>
                        {hasCertificate && <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Certificado</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/50" />
      <div className="container py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    </div>
  );
}
