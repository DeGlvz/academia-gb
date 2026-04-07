import { useState } from "react";
import {
  Plus, Pencil, Trash2, Upload, Search, Video, FileText, Link2, Eye, Clock, BookOpen, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { categories, thermomixModels, type ThermomixModel } from "@/data/classes";
import { useClasses, type ClassWithLessons } from "@/hooks/useClasses";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ClassFormData {
  title: string;
  description: string;
  longDescription: string;
  price: number;
  category: string;
  videoUrl: string;
  pdfUrl: string;
  isPublic: boolean;
  compatibleModels: ThermomixModel[];
}

const emptyForm: ClassFormData = {
  title: "", description: "", longDescription: "", price: 0,
  category: categories[0], videoUrl: "", pdfUrl: "", isPublic: false,
  compatibleModels: ["TM5", "TM6", "TM7"],
};

function toSlug(title: string): string {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const AdminClases = () => {
  const { data: classes = [], isLoading } = useClasses();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClassFormData>(emptyForm);
  const [activeTab, setActiveTab] = useState("edit");
  const { toast } = useToast();

  const filtered = classes.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setActiveTab("edit");
    setDialogOpen(true);
  };

  const openEdit = (c: ClassWithLessons) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      description: c.description || "",
      longDescription: c.long_description || "",
      price: c.price,
      category: c.category,
      videoUrl: c.video_url || "",
      pdfUrl: c.pdf_url || "",
      isPublic: c.is_public ?? false,
      compatibleModels: (c.compatible_models || []) as ThermomixModel[],
    });
    setActiveTab("edit");
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["classes"] });
    toast({ title: "Clase eliminada" });
  };

  const toggleModel = (model: ThermomixModel) => {
    setForm((prev) => ({
      ...prev,
      compatibleModels: prev.compatibleModels.includes(model)
        ? prev.compatibleModels.filter((m) => m !== model)
        : [...prev.compatibleModels, model],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: "Campos requeridos", description: "Título y descripción son obligatorios.", variant: "destructive" });
      return;
    }

    const payload = {
      title: form.title,
      slug: toSlug(form.title),
      description: form.description,
      long_description: form.longDescription,
      price: form.isPublic ? 0 : form.price,
      category: form.category,
      video_url: form.videoUrl || null,
      pdf_url: form.pdfUrl || null,
      is_public: form.isPublic,
      compatible_models: form.compatibleModels as any,
    };

    if (editingId) {
      const { error } = await supabase.from("classes").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Clase actualizada" });
    } else {
      const { error } = await supabase.from("classes").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Clase creada" });
    }
    queryClient.invalidateQueries({ queryKey: ["classes"] });
    setDialogOpen(false);
  };

  const updateField = <K extends keyof ClassFormData>(key: K, value: ClassFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Clases</h1>
          <p className="text-muted-foreground text-sm mt-1">{classes.length} clases en total</p>
        </div>
        <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Nueva Clase</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar clase..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4">
        {filtered.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img src={c.image_url || "/placeholder.svg"} alt={c.title} className="h-16 w-24 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-semibold text-foreground truncate">{c.title}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                  {c.is_public && <Badge className="text-xs bg-accent text-accent-foreground">Pública</Badge>}
                  <span>{c.lessons.length} lecciones</span>
                  <span>·</span>
                  <span>{c.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-foreground">{c.is_public ? "Gratis" : `$${c.price}`}</span>
                <Badge variant="outline" className="gap-1 text-xs"><Video className="h-3 w-3" />{c.lessons.length}</Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar clase" : "Crear nueva clase"}</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="edit" className="flex-1 gap-1.5"><Pencil className="h-3.5 w-3.5" /> Editar</TabsTrigger>
              <TabsTrigger value="preview" className="flex-1 gap-1.5"><Eye className="h-3.5 w-3.5" /> Vista previa</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => updateField("title", e.target.value)} maxLength={120} /></div>
              <div className="space-y-2"><Label>Descripción corta</Label><Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} maxLength={300} rows={2} /></div>
              <div className="space-y-2"><Label>Descripción completa</Label><Textarea value={form.longDescription} onChange={(e) => updateField("longDescription", e.target.value)} maxLength={1000} rows={4} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Precio (MXN)</Label><Input type="number" value={form.price} onChange={(e) => updateField("price", Number(e.target.value))} disabled={form.isPublic} /></div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">Clase pública (gratuita)</p><p className="text-xs text-muted-foreground">Accesible para todos los usuarios registrados</p></div>
                <Switch checked={form.isPublic} onCheckedChange={(v) => updateField("isPublic", v)} />
              </div>
              <div className="space-y-2">
                <Label>Modelos compatibles</Label>
                <div className="flex gap-2">
                  {thermomixModels.map((m) => (<Badge key={m} variant={form.compatibleModels.includes(m) ? "default" : "outline"} className="cursor-pointer select-none" onClick={() => toggleModel(m)}>{m}</Badge>))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2"><Label className="flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5 text-muted-foreground" /> Enlace de video</Label><Input value={form.videoUrl} onChange={(e) => updateField("videoUrl", e.target.value)} placeholder="https://vimeo.com/..." maxLength={500} /></div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> Archivo PDF / Recurso</Label>
                <Input value={form.pdfUrl} onChange={(e) => updateField("pdfUrl", e.target.value)} placeholder="https://..." maxLength={500} />
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Arrastra archivos aquí o <span className="text-primary font-medium">haz clic para subir</span></p>
                  <p className="text-[10px] text-muted-foreground mt-1">PDF, MP4, MOV hasta 500MB</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {form.videoUrl ? (
                    <div className="text-center space-y-2"><Video className="h-10 w-10 text-primary mx-auto" /><p className="text-xs text-muted-foreground break-all px-4">{form.videoUrl}</p></div>
                  ) : (
                    <div className="text-center space-y-1"><Video className="h-10 w-10 text-muted-foreground/40 mx-auto" /><p className="text-xs text-muted-foreground">Sin video aún</p></div>
                  )}
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{form.category || "Categoría"}</Badge>
                    {form.isPublic && <Badge className="text-xs bg-accent text-accent-foreground">Gratis 🎉</Badge>}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{form.title || "Título de la clase"}</h3>
                  <p className="text-sm text-muted-foreground">{form.description || "Descripción corta..."}</p>
                  {form.longDescription && <p className="text-xs text-muted-foreground border-t pt-3 mt-2">{form.longDescription}</p>}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 0h</span>
                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> 0 lecciones</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">{form.compatibleModels.map((m) => (<span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">{m}</span>))}</div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-lg font-bold text-foreground">{form.isPublic ? "Gratis" : `$${form.price} MXN`}</span>
                    {form.pdfUrl && <Badge variant="outline" className="gap-1 text-xs"><FileText className="h-3 w-3" /> PDF incluido</Badge>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleSave}>{editingId ? "Guardar cambios" : "Publicar clase"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClases;
