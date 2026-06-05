import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Shield, BookOpen, Video, HelpCircle, Users, LogOut, LayoutDashboard, ChevronRight } from "lucide-react";

const NAV = [
  { path: "/admin/trilhas", label: "Trilhas", icon: <Shield className="w-4 h-4" /> },
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
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
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
      <aside className="w-56 shrink-0 border-r border-border/50 flex flex-col bg-sidebar">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">Academia RB</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-9">Painel Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active = location === item.path || location.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                {item.icon}
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/50 space-y-1">
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
