import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Shield, Award, ClipboardList, CheckCircle2, XCircle, LogOut, LayoutDashboard, ChevronRight } from "lucide-react";
const LOGO_URL = "/manus-storage/logo-rb-48_c885cae4.png";

export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: attempts, isLoading: attLoading } = trpc.quiz.myAttempts.useQuery(undefined, { enabled: isAuthenticated });
  const { data: certs, isLoading: certLoading } = trpc.certificates.mine.useQuery(undefined, { enabled: isAuthenticated });
  const { data: trails } = trpc.trails.list.useQuery({ publishedOnly: true });

  if (loading) return <ProfileSkeleton />;
  if (!isAuthenticated) { window.location.href = getLoginUrl(); return null; }

  const trailMap = new Map(trails?.map((t) => [t.id, t]) ?? []);

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
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
            </Button>
          </nav>
          <Button variant="ghost" size="sm" onClick={() => logout().then(() => navigate("/"))}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container py-10 max-w-3xl">
        {/* Perfil */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {user?.role === "admin" && <Badge variant="secondary" className="mt-1">Administrador</Badge>}
          </div>
        </div>

        {/* Certificados */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" /> Certificados obtidos
          </h2>
          {certLoading ? (
            <Skeleton className="h-24" />
          ) : !certs || certs.length === 0 ? (
            <Card className="gradient-card border-border/50">
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                Nenhum certificado obtido ainda. Conclua uma trilha para receber seu certificado.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {certs.map((cert) => {
                const trail = trailMap.get(cert.trailId);
                return (
                  <Card key={cert.id} className="gradient-card border-yellow-500/30 hover:border-yellow-500/60 transition-colors cursor-pointer" onClick={() => navigate(`/certificado/${cert.code}`)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-yellow-400 shrink-0" />
                        <div>
                          <p className="font-semibold">{trail?.name ?? "Trilha"}</p>
                          <p className="text-xs text-muted-foreground">
                            Emitido em {new Date(cert.issuedAt).toLocaleDateString("pt-BR")} · Código: {cert.code}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Histórico de avaliações */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" /> Histórico de avaliações
          </h2>
          {attLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : !attempts || attempts.length === 0 ? (
            <Card className="gradient-card border-border/50">
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                Nenhuma avaliação realizada ainda.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {attempts.map((att) => {
                const trail = trailMap.get(att.trailId);
                const pct = Math.round((att.score / att.total) * 100);
                return (
                  <Card key={att.id} className="gradient-card border-border/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {att.passed
                          ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                          : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                        <div>
                          <p className="font-medium text-sm">{trail?.name ?? `Trilha #${att.trailId}`}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(att.attemptedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${att.passed ? "text-green-400" : "text-destructive"}`}>{pct}%</span>
                        <p className="text-xs text-muted-foreground">{att.score}/{att.total} acertos</p>
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

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/50" />
      <div className="container py-10 max-w-3xl space-y-4">
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}
