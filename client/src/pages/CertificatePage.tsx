import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { Shield, Award, CheckCircle2, Share2, ChevronLeft, AlertCircle, Copy } from "lucide-react";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CertSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/50" />
      <div className="container py-10 max-w-3xl flex items-center justify-center">
        <Skeleton className="w-full h-[480px] rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Certificate visual ───────────────────────────────────────────────────────
interface CertData {
  id: number;
  code: string;
  studentName?: string | null;
  trailName?: string | null;
  issuedAt: Date | string;
}

function CertificateCard({ cert, publicUrl }: { cert: CertData; publicUrl: string }) {
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl).then(() =>
      toast.success("Link copiado para a área de transferência!")
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado — ${cert.trailName ?? "Trilha"}`,
          text: `${cert.studentName ?? "Aluno"} concluiu a trilha ${cert.trailName ?? ""} na Academia RB Segurança Eletrônica.`,
          url: publicUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* ── Certificado visual ── */}
      <div
        id="certificate-card"
        className="relative overflow-hidden rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl"
        style={{ minHeight: 460 }}
      >
        {/* Decoração de fundo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-3 border border-yellow-500/20 rounded-xl" />
          <div className="absolute inset-5 border border-yellow-500/10 rounded-lg" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-8 py-10 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg leading-tight">Academia RB</p>
              <p className="text-xs text-muted-foreground">Segurança Eletrônica</p>
            </div>
          </div>

          {/* Título */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-400 font-semibold mb-2">
              Certificado de Conclusão
            </p>
            <div className="w-16 h-px bg-yellow-500/50 mx-auto" />
          </div>

          <p className="text-sm text-muted-foreground">Certificamos que</p>

          {/* Nome do aluno — destaque principal */}
          <h1
            className="text-3xl md:text-4xl font-bold text-foreground"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {cert.studentName ?? "Aluno"}
          </h1>

          <p className="text-sm text-muted-foreground max-w-md">
            concluiu com êxito todos os cursos e avaliações da trilha de aprendizagem
          </p>

          {/* Nome da trilha */}
          <div className="px-6 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-xl font-bold text-yellow-400">{cert.trailName ?? "Trilha"}</p>
          </div>

          <p className="text-xs text-muted-foreground">
            com aprovação mínima de 90% em todas as avaliações
          </p>

          <Award className="w-10 h-10 text-yellow-400 drop-shadow-lg" />

          {/* Data e código */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mt-2 w-full justify-center">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Data de emissão</p>
              <p className="text-sm font-semibold">{issuedDate}</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Código de verificação</p>
              <p className="text-sm font-mono font-bold tracking-wider text-yellow-400">{cert.code}</p>
            </div>
          </div>

          {/* Rodapé de verificação */}
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
            <span>
              Verificável em{" "}
              <span className="text-primary font-medium break-all">{publicUrl}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Ações ── */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
        <Button onClick={handleShare} className="gap-2">
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
        <Button variant="outline" onClick={handleCopy} className="gap-2">
          <Copy className="w-4 h-4" />
          Copiar link
        </Button>
        <Button variant="ghost" onClick={() => window.print()} className="gap-2 text-muted-foreground">
          Imprimir / Salvar PDF
        </Button>
      </div>

      {/* ── Verificação pública ── */}
      <div className="mt-6 p-4 rounded-xl border border-green-500/20 bg-green-500/5 flex items-start gap-3 print:hidden">
        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-400">Certificado autêntico e verificável</p>
          <p className="text-xs text-muted-foreground mt-1">
            Qualquer pessoa pode confirmar a autenticidade deste certificado acessando:{" "}
            <button
              onClick={handleCopy}
              className="text-primary underline underline-offset-2 hover:no-underline break-all"
            >
              {publicUrl}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CertificatePage() {
  const { code } = useParams<{ code: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: cert, isLoading } = trpc.certificates.verify.useQuery(
    { code: code ?? "" },
    { enabled: !!code }
  );

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/certificado/${code}`
    : `/certificado/${code}`;

  if (isLoading) return <CertSkeleton />;

  if (!cert) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
          <div className="container flex items-center h-16">
            <button className="flex items-center gap-2" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Academia RB</span>
            </button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="border-border/50 max-w-md w-full text-center">
            <CardContent className="p-8">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Certificado não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O código <strong className="font-mono">{code}</strong> não corresponde a nenhum certificado válido.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>Voltar ao início</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80 print:hidden">
        <div className="container flex items-center justify-between h-16">
          <button className="flex items-center gap-2" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Academia RB</span>
          </button>
          {isAuthenticated && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/perfil")}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Meu Perfil
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container py-10 flex flex-col items-center">
        <div className="mb-8 text-center print:hidden">
          <h2 className="text-2xl font-bold mb-1">Certificado Digital</h2>
          <p className="text-muted-foreground text-sm">
            Verificação pública — qualquer pessoa pode confirmar a autenticidade deste certificado
          </p>
        </div>

        <CertificateCard cert={cert} publicUrl={publicUrl} />
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          #certificate-card {
            border: 2px solid #d4a017 !important;
            background: white !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
