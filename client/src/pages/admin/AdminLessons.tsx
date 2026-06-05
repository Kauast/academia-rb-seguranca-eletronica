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
import { Plus, Pencil, Trash2, Video, BookOpen } from "lucide-react";

type LessonForm = { courseId: number; title: string; type: "apostila" | "videoaula"; content: string; videoUrl: string; order: number; published: boolean };
const EMPTY: LessonForm = { courseId: 0, title: "", type: "apostila", content: "", videoUrl: "", order: 0, published: true };

export default function AdminLessons() {
  const utils = trpc.useUtils();
  const { data: trails } = trpc.trails.list.useQuery({});
  const [selectedTrail, setSelectedTrail] = useState<number>(0);
  const [selectedCourse, setSelectedCourse] = useState<number>(0);

  const { data: courses } = trpc.courses.byTrail.useQuery(
    { trailId: selectedTrail },
    { enabled: selectedTrail > 0 }
  );
  const { data: lessons, isLoading } = trpc.lessons.byCourse.useQuery(
    { courseId: selectedCourse },
    { enabled: selectedCourse > 0 }
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<LessonForm>(EMPTY);

  const createMutation = trpc.lessons.create.useMutation({
    onSuccess: () => { toast.success("Aula criada!"); utils.lessons.byCourse.invalidate(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.lessons.update.useMutation({
    onSuccess: () => { toast.success("Aula atualizada!"); utils.lessons.byCourse.invalidate(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.lessons.delete.useMutation({
    onSuccess: () => { toast.success("Aula removida!"); utils.lessons.byCourse.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, courseId: selectedCourse }); setOpen(true); };
  const openEdit = (l: NonNullable<typeof lessons>[number]) => {
    setEditing(l.id);
    setForm({ courseId: l.courseId, title: l.title, type: l.type, content: l.content ?? "", videoUrl: l.videoUrl ?? "", order: l.order, published: l.published });
    setOpen(true);
  };
  const handleSave = () => {
    if (!form.courseId) { toast.error("Selecione um curso"); return; }
    if (editing) updateMutation.mutate({ id: editing, title: form.title, type: form.type, content: form.content, videoUrl: form.videoUrl, order: form.order, published: form.published });
    else createMutation.mutate(form);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Video className="w-5 h-5 text-primary" /> Aulas</h1>
          <p className="text-sm text-muted-foreground">Gerencie as aulas por curso</p>
        </div>
        <Button onClick={openCreate} disabled={!selectedCourse}><Plus className="w-4 h-4 mr-2" /> Nova Aula</Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Label className="mb-1 block text-sm">Trilha</Label>
          <Select value={selectedTrail.toString()} onValueChange={(v) => { setSelectedTrail(parseInt(v)); setSelectedCourse(0); }}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {trails?.map((t) => <SelectItem key={t.id} value={t.id.toString()}>{t.icon} {t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-56">
          <Label className="mb-1 block text-sm">Curso</Label>
          <Select value={selectedCourse.toString()} onValueChange={(v) => setSelectedCourse(parseInt(v))} disabled={!selectedTrail}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {courses?.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedCourse ? (
        <p className="text-sm text-muted-foreground">Selecione uma trilha e um curso.</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">A carregar...</p>
      ) : !lessons || lessons.length === 0 ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">Nenhuma aula neste curso.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {lessons.map((l) => (
            <Card key={l.id} className="gradient-card border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                {l.type === "apostila" ? <BookOpen className="w-4 h-4 text-primary shrink-0" /> : <Video className="w-4 h-4 text-accent shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{l.title}</p>
                    <Badge variant="secondary" className="text-xs capitalize">{l.type}</Badge>
                    {!l.published && <Badge variant="secondary" className="text-xs">Oculta</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">Ordem: {l.order}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(l)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Remover aula?")) deleteMutation.mutate({ id: l.id }); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Aula" : "Nova Aula"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "apostila" | "videoaula" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apostila">Apostila</SelectItem>
                    <SelectItem value="videoaula">Videoaula</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.type === "videoaula" && (
              <div className="space-y-1">
                <Label>URL do Vídeo (YouTube ou direto)</Label>
                <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
              </div>
            )}
            <div className="space-y-1">
              <Label>Conteúdo (Markdown)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="# Título&#10;&#10;Conteúdo em markdown..." className="font-mono text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Ordem</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label>Publicada</Label>
              </div>
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
