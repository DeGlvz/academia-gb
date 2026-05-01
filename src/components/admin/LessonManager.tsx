import React, { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Video, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PdfUpload } from "@/components/ui/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- SortableItem Component (mantiene drag & drop) ---
const SortableItem = ({ lesson, onEdit, onDelete }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm mb-2 group"
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:text-primary">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{lesson.title}</h4>
        <div className="flex gap-3 mt-1">
          {lesson.content_url && <Video className="h-4 w-4 text-blue-500" />}
          {lesson.material_url && <FileText className="h-4 w-4 text-green-500" />}
        </div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={() => onEdit(lesson)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(lesson.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

interface LessonManagerProps {
  classId: string;  // 🔧 USAR classId, NO className
}

export const LessonManager = ({ classId }: LessonManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [formState, setFormState] = useState({
    title: "",
    content_url: "",
    material_url: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 🔧 CORREGIDO: Usar sort_order en lugar de order_index
  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons", classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("class_id", classId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createLesson = useMutation({
    mutationFn: async (newLesson: any) => {
      console.log("🔧 Creando lección:", newLesson);
      const { data, error } = await supabase.from("lessons").insert([newLesson]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", classId] });
      handleCloseDialog();
      toast({ title: "✅ Lección creada correctamente" });
    },
    onError: (error: any) => {
      console.error("❌ Error al crear:", error);
      toast({ title: "Error al crear", description: error.message, variant: "destructive" });
    }
  });

  const updateLesson = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      console.log("🔧 Actualizando lección ID:", id, updates);
      const { data, error } = await supabase.from("lessons").update(updates).eq("id", id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", classId] });
      handleCloseDialog();
      toast({ title: "✅ Lección actualizada" });
    },
    onError: (error: any) => {
      console.error("❌ Error al actualizar:", error);
      toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
    }
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", classId] });
      toast({ title: "✅ Lección eliminada" });
    },
    onError: (error: any) => {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    }
  });

  const handleSaveLesson = () => {
    if (!formState.title.trim()) {
      toast({ title: "El título es obligatorio", variant: "destructive" });
      return;
    }

    // 🔧 CORREGIDO: Usar sort_order en lugar de order_index
    const payload = {
      class_id: classId,
      title: formState.title,
      description: "",
      content_url: formState.content_url || null,
      material_url: formState.material_url || null,
      lesson_type: "video",
      sort_order: editingLesson ? editingLesson.sort_order : lessons.length,
      is_free: false,
      duration: null,
    };

    console.log("📦 Payload enviado:", payload);

    if (editingLesson) {
      updateLesson.mutate({ id: editingLesson.id, ...payload });
    } else {
      createLesson.mutate(payload);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);
      const newOrder = arrayMove(lessons, oldIndex, newIndex);

      queryClient.setQueryData(["lessons", classId], newOrder);

      // 🔧 CORREGIDO: Actualizar sort_order en lugar de order_index
      const updates = newOrder.map((lesson, index) => ({
        id: lesson.id,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase.from("lessons").update({ sort_order: update.sort_order }).eq("id", update.id);
      }
    }
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setFormState({
      title: lesson.title,
      content_url: lesson.content_url || "",
      material_url: lesson.material_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar esta lección?")) {
      deleteLesson.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLesson(null);
    setFormState({ title: "", content_url: "", material_url: "" });
  };

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Cargando lecciones...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lecciones</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Agregar Lección
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <SortableItem key={lesson.id} lesson={lesson} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {lessons.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          No hay lecciones. Agrega la primera.
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Editar Lección" : "Nueva Lección"}</DialogTitle>
            <DialogDescription>
              Completa los campos para {editingLesson ? "editar" : "crear"} una lección.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título de la lección *</Label>
              <Input
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                placeholder="Ej: Introducción al curso"
              />
            </div>
            <div className="space-y-2">
              <Label>URL del Video (opcional)</Label>
              <Input
                value={formState.content_url}
                onChange={(e) => setFormState({ ...formState, content_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Material PDF (opcional)</Label>
              <PdfUpload
                onUpload={(url) => setFormState({ ...formState, material_url: url })}
                existingUrl={formState.material_url}
                label="Subir PDF de la lección"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSaveLesson} disabled={createLesson.isPending || updateLesson.isPending}>
              {editingLesson ? "Guardar Cambios" : "Crear Lección"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonManager;
