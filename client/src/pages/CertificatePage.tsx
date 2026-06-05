import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { Shield, Award, CheckCircle2, Download, ChevronLeft, AlertCircle } from "lucide-react";

export default function CertificatePage() {
  const { code } = useParams<{ code: string }>();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Verificação pública do certificado
  const { data: cert, isLoading } = trpc.certificates.verify.useQuery(
    { code: code ?? "" },
    { enabled: !!code }
  );

  // Emissão (apenas para o dono do certificado)
  const issueMutation = trpc.certificates.issue.useMutation({
    onSuccess: () => toast.success("Certificado emitido com sucesso!"),
    onError: (err) => toast.error(err.message),
  });

  const handlePrint = () => window.print();

  if (isLoading) return <CertSkeleton />;

  if (!cert) {
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
              <h2 className="text-xl font-bold mb-2">Certificado não encontrado</h2>
              <p className="text-muted-foreground mb-6">O código <strong>{code}</strong> não corresponde a nenhum certificado válido.</p>
              <Button variant="outline" onClick={() => navigate("/")}>Voltar ao início</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80 print:hidden">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Academia RB</span>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/perfil")}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Meu Perfil
              </Button>
            )}
            <Button size="sm" onClick={handlePrint}>
              <Download className="w-4 h-4 mr-2" /> Imprimir / Salvar PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10 max-w-3xl">
        {/* Verificação */}
        <div className="flex items-center gap-2 mb-6 print:hidden">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-sm text-green-400 font-medium">Certificado válido e verificado</span>
        </div>

        {/* Certificado */}
        <div className="border-2 border-yellow-500/50 rounded-2xl p-8 md:p-12 text-center bg-gradient-to-b from-card to-background relative overflow-hidden">
          {/* Decoração */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-4 left-4 w-32 h-32 rounded-full border-4 border-yellow-500" />
            <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full border-4 border-yellow-500" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">Academia RB Segurança Eletrônica</span>
            </div>

            <Award className="w-16 h-16 text-yellow-400 mx-auto mb-6" />

            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Certificado de Conclusão</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gradient">
              {cert.trailName}
            </h1>

            <p className="text-muted-foreground mt-6 mb-2 text-sm">Certificamos que</p>
            <p className="text-xl font-bold mb-6">{user?.name ?? "Aluno"}</p>

            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              concluiu com êxito todos os cursos e avaliações da trilha <strong>{cert.trailName}</strong>,
              demonstrando proficiência nos conhecimentos de segurança eletrônica.
            </p>

            <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <div>
                <p className="font-medium">Data de emissão</p>
                <p>{new Date(cert.issuedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Código de verificação</p>
                <p className="font-mono tracking-wider text-foreground">{cert.code}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Verificar em</p>
                <p className="text-primary">{window.location.origin}/certificado/{cert.code}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 print:hidden">
          Este certificado pode ser verificado publicamente em{" "}
          <a href={`/certificado/${cert.code}`} className="text-primary hover:underline">
            {window.location.origin}/certificado/{cert.code}
          </a>
        </p>
      </main>
    </div>
  );
}

function CertSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border/50" />
      <div className="container py-10 max-w-3xl">
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
