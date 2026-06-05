import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Zap, Shield } from "lucide-react";

type TrailForm = { slug: string; name: string; description: string; icon: string; order: number; published: boolean };
const EMPTY: TrailForm = { slug: "", name: "", description: "", icon: "", order: 0, published: true };

export default function AdminTrails() {
  const utils = trpc.useUtils();
  const { data: trails, isLoading } = trpc.trails.list.useQuery({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<TrailForm>(EMPTY);

  const seedMutation = trpc.trails.seed.useMutation({
    onSuccess: (r) => { toast.success(r.message); utils.trails.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const createMutation = trpc.trails.create.useMutation({
    onSuccess: () => { toast.success("Trilha criada!"); utils.trails.list.invalidate(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.trails.update.useMutation({
    onSuccess: () => { toast.success("Trilha atualizada!"); utils.trails.list.invalidate(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.trails.delete.useMutation({
    onSuccess: () => { toast.success("Trilha removida!"); utils.trails.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (t: typeof trails extends (infer U)[] | undefined ? U : never) => {
    if (!t) return;
    setEditing(t.id);
    setForm({ slug: t.slug, name: t.name, description: t.description ?? "", icon: t.icon ?? "", order: t.order, published: t.published });
    setOpen(true);
  };
  const handleSave = () => {
    if (editing) updateMutation.mutate({ id: editing, ...form });
    else createMutation.mutate(form);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Trilhas</h1>
          <p className="text-sm text-muted-foreground">Gerencie as trilhas de aprendizagem</p>
        </div>
        <div className="flex gap-2">
          {(!trails || trails.length === 0) && (
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              <Zap className="w-4 h-4 mr-2" /> Criar 8 trilhas padrão
            </Button>
          )}
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Nova Trilha</Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">A carregar...</p>
      ) : !trails || trails.length === 0 ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="mb-4">Nenhuma trilha cadastrada.</p>
            <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              <Zap className="w-4 h-4 mr-2" /> Criar 8 trilhas padrão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {trails.map((t) => (
            <Card key={t.id} className="gradient-card border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <span className="text-2xl">{t.icon ?? "📚"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{t.name}</p>
                    {!t.published && <Badge variant="secondary" className="text-xs">Oculta</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Remover trilha?")) deleteMutation.mutate({ id: t.id }); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Trilha" : "Nova Trilha"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: CFTV IP" />
              </div>
              <div className="space-y-1">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="cftv-ip" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Ícone (emoji)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🌐" />
              </div>
              <div className="space-y-1">
                <Label>Ordem</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              <Label>Publicada</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
