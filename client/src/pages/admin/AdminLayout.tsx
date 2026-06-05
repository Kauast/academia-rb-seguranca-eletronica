import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { BookOpen, Video, HelpCircle, Users, LogOut, LayoutDashboard, ChevronRight, Layers, ShieldAlert } from "lucide-react";

const LOGO_URL = "/manus-storage/logo-rb-48_c885cae4.png";

const NAV = [
  { path: "/admin/trilhas", label: "Trilhas", icon: <Layers className="w-4 h-4" /> },
  { path: "/admin/cursos", label: "Cursos", icon: <BookOpen className="w-4 h-4" /> },
  { path: "/admin/aulas", label: "Aulas", icon: <Video className="w-4 h-4" /> },
  { path: "/admin/questoes", label: "Questões", icon: <HelpCircle className="w-4 h-4" /> },
  { path: "/admin/alunos", label: "Alunos", icon: <Users className="w-4 h-4" /> },
];

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location, navigate] = useLocation();

  if (loading) return <div className="min-h-screen bg-background" />;

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Acesso negado</h2>
          <p className="text-muted-foreground mb-4">Esta área é restrita a administradores.</p>
          <Button onClick={() => navigate("/dashboard")}>Ir para o Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border/40 flex flex-col bg-sidebar">
        {/* Logo */}
        <div className="p-4 border-b border-border/40">
          <button className="flex items-center gap-2.5 w-full" onClick={() => navigate("/")}>
            <img src={LOGO_URL} alt="Logo RB" className="w-8 h-8 object-contain" />
            <div className="flex flex-col leading-tight text-left">
              <span className="font-bold text-sm tracking-tight">Academia RB</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Segurança Eletrônica</span>
            </div>
          </button>
          <div className="mt-2 ml-10">
            <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Painel Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => {
            const active = location === item.path || location.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                {item.icon}
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/40 space-y-0.5">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button
            onClick={() => logout().then(() => navigate("/"))}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
