import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  BookOpen, Award, Video, Shield, ChevronRight, Zap, Users, Clock, Star
} from "lucide-react";

const TRAIL_ICONS: Record<string, string> = {
  "alarme-monitorado": "🔔",
  "alarme-com-ia": "🤖",
  "cftv-analogico": "📹",
  "cftv-ip": "🌐",
  "cftv-ip-com-ia": "🎯",
  "radio-ponto-a-ponto": "📡",
  "redes-basico": "🔗",
  "redes-avancado": "⚙️",
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: trails } = trpc.trails.list.useQuery({ publishedOnly: true });

  const handleStart = () => {
    if (isAuthenticated) navigate("/dashboard");
    else window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Academia RB</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#trilhas" className="hover:text-foreground transition-colors">Trilhas</a>
            <a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a>
          </nav>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">Olá, {user?.name?.split(" ")[0]}</span>
              <Button size="sm" onClick={() => navigate("/dashboard")}>Meu Dashboard</Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => window.location.href = getLoginUrl()}>
              Entrar
            </Button>
          )}
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="gradient-hero pt-24 pb-20 text-center">
        <div className="container max-w-4xl">
          <Badge variant="secondary" className="mb-6 text-xs tracking-wider uppercase">
            ✨ Plataforma de Capacitação Profissional
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Domine{" "}
            <span className="text-gradient">Segurança Eletrônica</span>
            {" "}com Cursos Profissionais
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Aprenda CFTV, Alarmes, Redes e Rádio com apostilas completas, videoaulas e
            avaliações profissionais. Do iniciante ao avançado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="glow-primary text-base px-8" onClick={handleStart}>
              Começar Agora <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <a href="#trilhas">Ver Trilhas</a>
            </Button>
          </div>
          {/* Métricas */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            {[
              { value: "8", label: "Trilhas", icon: <Zap className="w-5 h-5 text-primary" /> },
              { value: "100+", label: "Horas", icon: <Clock className="w-5 h-5 text-accent" /> },
              { value: "∞", label: "Acesso", icon: <Star className="w-5 h-5 text-yellow-400" /> },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-1">
                {m.icon}
                <span className="text-2xl font-bold">{m.value}</span>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Funcionalidades ────────────────────────────────────── */}
      <section id="funcionalidades" className="py-20 border-t border-border/40">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-12">Tudo que você precisa para evoluir</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <BookOpen className="w-6 h-6 text-primary" />, title: "Apostilas Completas", desc: "Conteúdo técnico detalhado com esquemas, diagramas e casos de uso reais" },
              { icon: <Award className="w-6 h-6 text-yellow-400" />, title: "Certificados Digitais", desc: "Certificados profissionais ao completar cada trilha com aprovação" },
              { icon: <Video className="w-6 h-6 text-accent" />, title: "Videoaulas", desc: "Conteúdo em vídeo com demonstrações práticas e exemplos reais" },
              { icon: <Shield className="w-6 h-6 text-green-400" />, title: "Avaliações", desc: "Provas com 15 questões, 90% de aproveitamento e limite de 1/dia" },
            ].map((f) => (
              <Card key={f.title} className="gradient-card border-border/50 hover:border-primary/40 transition-colors">
                <CardContent className="p-6">
                  <div className="mb-4">{f.icon}</div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trilhas ────────────────────────────────────────────── */}
      <section id="trilhas" className="py-20 border-t border-border/40">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3">8 Trilhas de Aprendizagem</h2>
            <p className="text-muted-foreground">Escolha sua especialização e comece agora</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(trails ?? FALLBACK_TRAILS).map((trail) => (
              <Card
                key={trail.slug}
                className="gradient-card border-border/50 hover:border-primary/50 hover:glow-primary transition-all cursor-pointer group"
                onClick={handleStart}
              >
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{trail.icon ?? TRAIL_ICONS[trail.slug] ?? "📚"}</div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{trail.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">{trail.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-primary">
                    <span>Ver trilha</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Final ──────────────────────────────────────────── */}
      <section className="py-20 border-t border-border/40">
        <div className="container text-center max-w-2xl">
          <Users className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Pronto para começar sua jornada?</h2>
          <p className="text-muted-foreground mb-8">
            Acesse agora e explore todas as trilhas de aprendizagem em segurança eletrônica.
          </p>
          <Button size="lg" className="glow-primary px-10" onClick={handleStart}>
            Entrar na Academia
          </Button>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Academia RB Segurança Eletrônica</span>
          </div>
          <span>© 2026 Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}

// Fallback enquanto os dados carregam
const FALLBACK_TRAILS = [
  { slug: "alarme-monitorado", name: "Alarme Monitorado", description: "Instalação e configuração de sistemas de alarme com sensores.", icon: "🔔" },
  { slug: "alarme-com-ia", name: "Alarme com IA", description: "Sistemas de alarme inteligentes com IA.", icon: "🤖" },
  { slug: "cftv-analogico", name: "CFTV Analógico", description: "CFTV analógico com câmeras e DVR.", icon: "📹" },
  { slug: "cftv-ip", name: "CFTV IP", description: "CFTV baseado em rede IP com NVR.", icon: "🌐" },
  { slug: "cftv-ip-com-ia", name: "CFTV IP com IA", description: "CFTV IP avançado com inteligência artificial.", icon: "🎯" },
  { slug: "radio-ponto-a-ponto", name: "Rádio Ponto a Ponto", description: "Comunicação via rádio frequência.", icon: "📡" },
  { slug: "redes-basico", name: "Redes Básico", description: "Fundamentos de redes para segurança eletrônica.", icon: "🔗" },
  { slug: "redes-avancado", name: "Redes Avançado", description: "Redes avançadas: VLANs, VPNs e firewalls.", icon: "⚙️" },
];
