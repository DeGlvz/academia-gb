import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical, FileText, Video, Code } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/ui/sortable-item";
import { PdfUpload } from "@/components/ui/image-upload";

interface LessonManagerProps {
  classId: string;
  onSuccess: () => void;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  content_url?: string;
  material_url?: string;
  lesson_type?: string;
}

const LessonManager = ({ classId, onSuccess }: LessonManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [lessonType, setLessonType] = useState("video");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons", classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("class_id", classId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Lesson[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { 
      title: string; 
      description: string; 
      content_url?: string; 
      material_url?: string;
      lesson_type: string;
    }) => {
      const order_index = lessons.length;
      const { error } = await supabase.from("lessons").insert([
        {
          class_id: classId,
          title: data.title,
          description: data.description,
          content_url: data.content_url,
          material_url: data.material_url,
          lesson_type: data.lesson_type,
          order_index,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", classId] });
      toast({ title: "Lección creada" });
      resetForm();
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { 
      id: string; 
      title: string; 
      description: string; 
      content_url?: string; 
      material_url?: string;
      lesson_type: string;
    }) => {
      const { error } = await supabase
        .from("lessons")
        .update({ 
          title: data.title, 
          description: data.description,
          content_url: data.content_url,
          material_url: data.material_url,
          lesson_type: data.lesson_type,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", classId] });
      toast({ title: "Lección actualizada" });
      resetForm();
      setDialogOpen(false);
      setEditingLesson(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", classId] });
      toast({ title: "Lección eliminada" });
      setDeleteDialogOpen(false);
      setLessonToDelete(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (updatedLessons: Lesson[]) => {
      for (const lesson of updatedLessons) {
        const { error } = await supabase
          .from("lessons")
          .update({ order_index: lesson.order_index })
          .eq("id", lesson.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", classId] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over?.id);
      const newOrder = arrayMove(lessons, oldIndex, newIndex);
      const updatedLessons = newOrder.map((lesson, idx) => ({
        ...lesson,
        order_index: idx,
      }));
      reorderMutation.mutate(updatedLessons);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setDescription(lesson.description || "");
    setContentUrl(lesson.content_url || "");
    setMaterialUrl(lesson.material_url || "");
    setLessonType(lesson.lesson_type || "video");
    setDialogOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContentUrl("");
    setMaterialUrl("");
    setLessonType("video");
    setEditingLesson(null);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "El título es requerido", variant: "destructive" });
      return;
    }
    
    const data = {
      title,
      description,
      content_url: contentUrl || null,
      material_url: materialUrl || null,
      lesson_type: lessonType,
    };

    if (editingLesson) {
      updateMutation.mutate({ id: editingLesson.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getLessonTypeIcon = (type?: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "pdf": return <FileText className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Nueva lección
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLesson ? "Editar lección" : "Nueva lección"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de lección *</Label>
                <Select value={lessonType} onValueChange={setLessonType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">📹 Video (YouTube/Vimeo)</SelectItem>
                    <SelectItem value="pdf">📄 PDF (Material descargable)</SelectItem>
                    <SelectItem value="text">📝 Texto / HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la lección" />
              </div>

              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Descripción de la lección" />
              </div>

              {/* URL del contenido (video o texto) */}
              {(lessonType === "video" || lessonType === "text") && (
                <div className="space-y-2">
                  <Label>{lessonType === "video" ? "URL del video (YouTube/Vimeo)" : "URL del contenido (opcional)"}</Label>
                  <Input 
                    value={contentUrl} 
                    onChange={(e) => setContentUrl(e.target.value)} 
                    placeholder={lessonType === "video" ? "https://youtube.com/watch?v=..." : "https://..."} 
                  />
                  {lessonType === "video" && (
                    <p className="text-xs text-muted-foreground">
                      Puedes usar enlaces de YouTube, Vimeo o cualquier video embebido.
                    </p>
                  )}
                </div>
              )}

              {/* PDF uploader */}
              {lessonType === "pdf" && (
                <div className="space-y-2">
                  <Label>Material PDF</Label>
                  <PdfUpload
                    onUpload={(url) => setMaterialUrl(url)}
                    existingUrl={materialUrl}
                    label="Subir PDF"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setDialogOpen(false);
                }}>Cancelar</Button>
                <Button onClick={handleSubmit}>{editingLesson ? "Actualizar" : "Crear"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Cargando lecciones...</p>
      ) : lessons.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay lecciones. Haz clic en "Nueva lección" para comenzar.
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <SortableItem key={lesson.id} id={lesson.id}>
                  <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {getLessonTypeIcon(lesson.lesson_type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{lesson.title}</p>
                      {lesson.description && <p className="text-xs text-muted-foreground line-clamp-1">{lesson.description}</p>}
                      {lesson.material_url && (
                        <a 
                          href={lesson.material_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          📄 Ver material
                        </a>
                      )}
                      {lesson.content_url && lesson.lesson_type === "video" && (
                        <p className="text-xs text-muted-foreground truncate">🎬 {lesson.content_url}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(lesson)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setLessonToDelete(lesson);
                      setDeleteDialogOpen(true);
                    }} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => lessonToDelete && deleteMutation.mutate(lessonToDelete.id)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LessonManager;
