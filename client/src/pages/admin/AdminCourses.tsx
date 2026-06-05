import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

type CourseForm = { trailId: number; title: string; description: string; order: number; published: boolean };
const EMPTY: CourseForm = { trailId: 0, title: "", description: "", order: 0, published: true };

export default function AdminCourses() {
  const utils = trpc.useUtils();
  const { data: trails } = trpc.trails.list.useQuery({});
  const [selectedTrail, setSelectedTrail] = useState<number>(0);
  const { data: courses, isLoading } = trpc.courses.byTrail.useQuery(
    { trailId: selectedTrail },
    { enabled: selectedTrail > 0 }
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<CourseForm>(EMPTY);

  const createMutation = trpc.courses.create.useMutation({
    onSuccess: () => { toast.success("Curso criado!"); utils.courses.byTrail.invalidate(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.courses.update.useMutation({
    onSuccess: () => { toast.success("Curso atualizado!"); utils.courses.byTrail.invalidate(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.courses.delete.useMutation({
    onSuccess: () => { toast.success("Curso removido!"); utils.courses.byTrail.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, trailId: selectedTrail });
    setOpen(true);
  };
  const openEdit = (c: NonNullable<typeof courses>[number]) => {
    setEditing(c.id);
    setForm({ trailId: c.trailId, title: c.title, description: c.description ?? "", order: c.order, published: c.published });
    setOpen(true);
  };
  const handleSave = () => {
    if (!form.trailId) { toast.error("Selecione uma trilha"); return; }
    if (editing) updateMutation.mutate({ id: editing, title: form.title, description: form.description, order: form.order, published: form.published });
    else createMutation.mutate(form);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Cursos</h1>
          <p className="text-sm text-muted-foreground">Gerencie os cursos por trilha</p>
        </div>
        <Button onClick={openCreate} disabled={!selectedTrail}><Plus className="w-4 h-4 mr-2" /> Novo Curso</Button>
      </div>

      {/* Seletor de trilha */}
      <div className="mb-6 max-w-xs">
        <Label className="mb-1 block text-sm">Filtrar por trilha</Label>
        <Select value={selectedTrail.toString()} onValueChange={(v) => setSelectedTrail(parseInt(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma trilha" />
          </SelectTrigger>
          <SelectContent>
            {trails?.map((t) => (
              <SelectItem key={t.id} value={t.id.toString()}>{t.icon} {t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedTrail ? (
        <p className="text-sm text-muted-foreground">Selecione uma trilha para ver os cursos.</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">A carregar...</p>
      ) : !courses || courses.length === 0 ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">Nenhum curso nesta trilha.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {courses.map((c) => (
            <Card key={c.id} className="gradient-card border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{c.order}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{c.title}</p>
                    {!c.published && <Badge variant="secondary" className="text-xs">Oculto</Badge>}
                  </div>
                  {c.description && <p className="text-xs text-muted-foreground truncate">{c.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Remover curso?")) deleteMutation.mutate({ id: c.id }); }}>
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
            <DialogTitle>{editing ? "Editar Curso" : "Novo Curso"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Trilha *</Label>
              <Select value={form.trailId.toString()} onValueChange={(v) => setForm({ ...form, trailId: parseInt(v) })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {trails?.map((t) => <SelectItem key={t.id} value={t.id.toString()}>{t.icon} {t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-1">
              <Label>Ordem</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              <Label>Publicado</Label>
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
