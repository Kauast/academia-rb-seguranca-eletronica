import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  BookOpen, Award, Video, ChevronRight, Zap, Users, Clock, Star, Shield
} from "lucide-react";

const LOGO_URL = "/manus-storage/logo-rb-48_c885cae4.png";

// ── Logo component reutilizável ──────────────────────────────────────────────
function RBLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { img: "w-7 h-7", text: "text-base", sub: "hidden" },
    md: { img: "w-9 h-9", text: "text-lg", sub: "text-[10px]" },
    lg: { img: "w-14 h-14", text: "text-2xl", sub: "text-xs" },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={LOGO_URL}
        alt="Logo RB Segurança Eletrônica"
        className={`${s.img} object-contain drop-shadow-md`}
        style={{ filter: "drop-shadow(0 0 6px rgba(200,170,80,0.25))" }}
      />
      <div className="flex flex-col leading-tight">
        <span className={`font-bold ${s.text} tracking-tight`}
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
          Academia RB
        </span>
        {size !== "sm" && (
          <span className={`${s.sub} text-muted-foreground font-medium tracking-wide uppercase`}>
            Segurança Eletrônica
          </span>
        )}
      </div>
    </div>
  );
}

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

      {/* ─── Navbar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/85">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="focus:outline-none">
            <RBLogo size="md" />
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#trilhas" className="hover:text-foreground transition-colors font-medium">Trilhas</a>
            <a href="#funcionalidades" className="hover:text-foreground transition-colors font-medium">Funcionalidades</a>
          </nav>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Olá, <strong className="text-foreground">{user?.name?.split(" ")[0]}</strong>
              </span>
              <Button size="sm" onClick={() => navigate("/dashboard")}
                className="glow-primary font-semibold">
                Meu Dashboard
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => window.location.href = getLoginUrl()}
              className="glow-primary font-semibold">
              Entrar
            </Button>
          )}
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className="gradient-hero pt-28 pb-24 text-center relative overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, oklch(0.76 0.14 80 / 0.06) 0%, transparent 70%)" }} />
        </div>

        <div className="container max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-6 text-xs tracking-widest uppercase px-4 py-1.5 border border-primary/20">
            ✦ Plataforma de Capacitação Profissional
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
            Domine{" "}
            <span className="text-gradient">Segurança Eletrônica</span>
            {" "}com Cursos Profissionais
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Aprenda CFTV, Alarmes, Redes e Rádio com apostilas completas, videoaulas e
            avaliações profissionais. Do iniciante ao avançado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="glow-primary text-base px-10 h-12 font-semibold" onClick={handleStart}>
              Começar Agora <ChevronRight className="ml-1.5 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-10 h-12 border-border/60 hover:border-primary/40" asChild>
              <a href="#trilhas">Ver Trilhas</a>
            </Button>
          </div>

          {/* Métricas */}
          <div className="flex flex-wrap justify-center gap-10 mt-16">
            {[
              { value: "8", label: "Trilhas", icon: <Zap className="w-5 h-5 text-primary" /> },
              { value: "100+", label: "Horas de conteúdo", icon: <Clock className="w-5 h-5 text-primary" /> },
              { value: "∞", label: "Acesso vitalício", icon: <Star className="w-5 h-5 text-primary" /> },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-1.5">
                {m.icon}
                <span className="text-3xl font-extrabold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{m.value}</span>
                <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Funcionalidades ─────────────────────────────────────── */}
      <section id="funcionalidades" className="py-24 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
              Tudo que você precisa para evoluir
            </h2>
            <p className="text-muted-foreground">Uma plataforma completa para sua capacitação profissional</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <BookOpen className="w-6 h-6 text-primary" />,
                title: "Apostilas Completas",
                desc: "Conteúdo técnico detalhado com esquemas, diagramas e casos de uso reais"
              },
              {
                icon: <Award className="w-6 h-6 text-primary" />,
                title: "Certificados Digitais",
                desc: "Certificados profissionais verificáveis ao completar cada trilha com aprovação"
              },
              {
                icon: <Video className="w-6 h-6 text-primary" />,
                title: "Videoaulas",
                desc: "Conteúdo em vídeo com demonstrações práticas e exemplos reais de campo"
              },
              {
                icon: <Shield className="w-6 h-6 text-primary" />,
                title: "Avaliações Rigorosas",
                desc: "Provas com 15 questões, 90% de aproveitamento mínimo e 1 tentativa por dia"
              },
            ].map((f) => (
              <Card key={f.title}
                className="gradient-card border-border/40 hover:border-primary/40 transition-all duration-200 hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trilhas ─────────────────────────────────────────────── */}
      <section id="trilhas" className="py-24 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
              8 Trilhas de Aprendizagem
            </h2>
            <p className="text-muted-foreground">Escolha sua especialização e comece agora</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(trails ?? FALLBACK_TRAILS).map((trail) => (
              <Card
                key={trail.slug}
                className="gradient-card border-border/40 hover:border-primary/50 transition-all duration-200 cursor-pointer group hover:-translate-y-0.5"
                onClick={handleStart}
              >
                <CardContent className="p-6">
                  <div className="text-3xl mb-4">{trail.icon ?? TRAIL_ICONS[trail.slug] ?? "📚"}</div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors leading-snug">
                    {trail.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {trail.description}
                  </p>
                  <div className="mt-5 flex items-center gap-1 text-xs text-primary font-medium">
                    <span>Ver trilha</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Final ───────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/30">
        <div className="container text-center max-w-2xl">
          <div className="flex justify-center mb-6">
            <RBLogo size="lg" />
          </div>
          <h2 className="text-2xl font-bold mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
            Pronto para começar sua jornada?
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Acesse agora e explore todas as trilhas de aprendizagem em segurança eletrônica.
            Certificados reconhecidos e conteúdo atualizado.
          </p>
          <Button size="lg" className="glow-primary px-12 h-12 font-semibold" onClick={handleStart}>
            Entrar na Academia
          </Button>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <RBLogo size="sm" />
          <span>© 2026 Academia RB Segurança Eletrônica. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}

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
