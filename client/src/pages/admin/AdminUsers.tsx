import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Users, Award } from "lucide-react";

export default function AdminUsers() {
  const { data: users, isLoading } = trpc.admin.users.useQuery();
  const { data: certs } = trpc.admin.allCertificates.useQuery();

  const certCountByUser = new Map<number, number>();
  certs?.forEach((c) => {
    certCountByUser.set(c.userId, (certCountByUser.get(c.userId) ?? 0) + 1);
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Alunos</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos alunos cadastrados</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{users?.length ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Alunos cadastrados</p>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{certs?.length ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Certificados emitidos</p>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{users?.filter((u) => u.role === "admin").length ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : !users || users.length === 0 ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">Nenhum aluno cadastrado.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id} className="gradient-card border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {u.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{u.name ?? "Sem nome"}</p>
                    {u.role === "admin" && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{u.email ?? u.openId}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{certCountByUser.get(u.id) ?? 0} cert.</span>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                  Desde {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
