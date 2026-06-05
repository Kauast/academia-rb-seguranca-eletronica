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
import { Plus, Pencil, Trash2, HelpCircle, CheckCircle2 } from "lucide-react";

type QForm = { trailId: number; text: string; options: string[]; correctIndex: number; explanation: string; order: number; active: boolean };
const EMPTY: QForm = { trailId: 0, text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", order: 0, active: true };

export default function AdminQuestions() {
  const utils = trpc.useUtils();
  const { data: trails } = trpc.trails.list.useQuery({});
  const [selectedTrail, setSelectedTrail] = useState<number>(0);
  const { data: questions, isLoading } = trpc.questions.byTrail.useQuery(
    { trailId: selectedTrail },
    { enabled: selectedTrail > 0 }
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<QForm>(EMPTY);

  const createMutation = trpc.questions.create.useMutation({
    onSuccess: () => { toast.success("Questão criada!"); utils.questions.byTrail.invalidate(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.questions.update.useMutation({
    onSuccess: () => { toast.success("Questão atualizada!"); utils.questions.byTrail.invalidate(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.questions.delete.useMutation({
    onSuccess: () => { toast.success("Questão removida!"); utils.questions.byTrail.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, trailId: selectedTrail }); setOpen(true); };
  const openEdit = (q: NonNullable<typeof questions>[number]) => {
    setEditing(q.id);
    setForm({
      trailId: q.trailId,
      text: q.text,
      options: (q.options as string[]).length >= 2 ? q.options as string[] : ["", "", "", ""],
      correctIndex: q.correctIndex,
      explanation: q.explanation ?? "",
      order: q.order,
      active: q.active,
    });
    setOpen(true);
  };
  const handleSave = () => {
    const opts = form.options.filter((o) => o.trim() !== "");
    if (opts.length < 2) { toast.error("Adicione pelo menos 2 opções"); return; }
    if (form.correctIndex >= opts.length) { toast.error("Índice correto inválido"); return; }
    const payload = { ...form, options: opts };
    if (editing) updateMutation.mutate({ id: editing, text: payload.text, options: payload.options, correctIndex: payload.correctIndex, explanation: payload.explanation, order: payload.order, active: payload.active });
    else createMutation.mutate(payload);
  };
  const setOption = (i: number, val: string) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" /> Questões</h1>
          <p className="text-sm text-muted-foreground">
            {selectedTrail && questions ? `${questions.length} questão(ões) — mínimo 15 para habilitar avaliação` : "Gerencie as questões de avaliação por trilha"}
          </p>
        </div>
        <Button onClick={openCreate} disabled={!selectedTrail}><Plus className="w-4 h-4 mr-2" /> Nova Questão</Button>
      </div>

      <div className="mb-6 max-w-xs">
        <Label className="mb-1 block text-sm">Filtrar por trilha</Label>
        <Select value={selectedTrail.toString()} onValueChange={(v) => setSelectedTrail(parseInt(v))}>
          <SelectTrigger><SelectValue placeholder="Selecione uma trilha" /></SelectTrigger>
          <SelectContent>
            {trails?.map((t) => <SelectItem key={t.id} value={t.id.toString()}>{t.icon} {t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selectedTrail && questions && questions.length < 15 && (
        <div className="mb-4 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm">
          ⚠️ Esta trilha tem apenas {questions.length} questão(ões). São necessárias pelo menos 15 para habilitar a avaliação.
        </div>
      )}

      {!selectedTrail ? (
        <p className="text-sm text-muted-foreground">Selecione uma trilha para ver as questões.</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">A carregar...</p>
      ) : !questions || questions.length === 0 ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">Nenhuma questão nesta trilha.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {questions.map((q, qi) => (
            <Card key={q.id} className="gradient-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground font-mono mt-0.5 shrink-0">#{qi + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1 line-clamp-2">{q.text}</p>
                    <div className="flex flex-wrap gap-1">
                      {(q.options as string[]).map((opt, oi) => (
                        <span key={oi} className={`text-xs px-2 py-0.5 rounded-full border ${oi === q.correctIndex ? "border-green-500/50 bg-green-500/15 text-green-400" : "border-border/50 text-muted-foreground"}`}>
                          {oi === q.correctIndex && <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" />}
                          {String.fromCharCode(65 + oi)}. {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!q.active && <Badge variant="secondary" className="text-xs">Inativa</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => openEdit(q)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { if (confirm("Remover questão?")) deleteMutation.mutate({ id: q.id }); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Questão" : "Nova Questão"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
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
              <Label>Enunciado *</Label>
              <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Opções (marque a correta)</Label>
              {form.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correctIndex: oi })}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${form.correctIndex === oi ? "border-green-500 bg-green-500/20" : "border-border hover:border-primary"}`}
                  >
                    {form.correctIndex === oi && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                  </button>
                  <Input
                    value={opt}
                    onChange={(e) => setOption(oi, e.target.value)}
                    placeholder={`Opção ${String.fromCharCode(65 + oi)}`}
                    className="flex-1"
                  />
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, options: [...form.options, ""] })}>
                <Plus className="w-3 h-3 mr-1" /> Adicionar opção
              </Button>
            </div>
            <div className="space-y-1">
              <Label>Explicação (exibida após responder)</Label>
              <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label>Ativa</Label>
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
