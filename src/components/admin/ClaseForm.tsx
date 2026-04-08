import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import LessonManager from "@/components/admin/LessonManager";

interface ClaseFormProps {
  initialData?: any;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Panadería",
  "Repostería",
  "Básicos",
  "Cocina Práctica",
  "Vegano",
  "Vegetariano",
  "Keto",
  "Sin Gluten",
  "Sin Azúcar",
];

const ClaseForm = ({ initialData, onSuccess }: ClaseFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [activeTab, setActiveTab] = useState("datos");
  const [classId, setClassId] = useState<string | null>(initialData?.id || null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      category: initialData?.category || "",
      is_published: initialData?.is_published || false,
    },
  });

  const watchTitle = watch("title");
  const watchIsPublished = watch("is_published");

  // Generar slug automáticamente desde el título
  useEffect(() => {
    if (watchTitle && !initialData) {
      const slug = watchTitle
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [watchTitle, setValue, initialData]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const claseData = {
        ...data,
        image_url: imageUrl,
        price: parseFloat(data.price),
      };

      let id = classId;

      if (initialData?.id) {
        // Actualizar clase existente
        const { error } = await supabase
          .from("classes")
          .update(claseData)
          .eq("id", initialData.id);
        if (error) throw error;
        id = initialData.id;
      } else {
        // Crear nueva clase
        const { data: newClass, error } = await supabase
          .from("classes")
          .insert([claseData])
          .select()
          .single();
        if (error) throw error;
        id = newClass.id;
        setClassId(id);
      }

      return { id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-clases"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      
      if (!initialData && result.id) {
        setClassId(result.id);
        toast({ 
          title: "Clase creada", 
          description: "Ahora puedes agregar lecciones en la pestaña de Lecciones." 
        });
        setActiveTab("lecciones");
      } else {
        toast({ title: "Clase guardada", description: "La clase ha sido guardada correctamente." });
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    if (!imageUrl && !initialData?.image_url) {
      toast({ title: "Error", description: "Debes subir una imagen para la clase.", variant: "destructive" });
      return;
    }
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="datos">📝 Datos de la clase</TabsTrigger>
          <TabsTrigger value="lecciones" disabled={!classId && !initialData?.id}>
            📚 Lecciones {classId && "(agregar / editar)"}
          </TabsTrigger>
        </TabsList>

        {/* Pestaña: Datos de la clase */}
        <TabsContent value="datos" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" {...register("title", { required: "El título es requerido" })} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL amigable)</Label>
            <Input id="slug" {...register("slug")} />
            <p className="text-xs text-muted-foreground">Ej: pan-artesanal-desde-cero</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select onValueChange={(value) => setValue("category", value)} defaultValue={initialData?.category}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label>Imagen principal</Label>
            <ImageUpload
              bucket="class-images"
              path="clases"
              onUpload={(url) => setImageUrl(url)}
              existingUrl={imageUrl}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (MXN)</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} />
              <p className="text-xs text-muted-foreground">0 = Gratis</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_published">Publicado</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="is_published" onCheckedChange={(checked) => setValue("is_published", checked)} defaultChecked={initialData?.is_published} />
                <Label htmlFor="is_published">{watchIsPublished ? "Visible en el sitio" : "Borrador (no visible)"}</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando..." : initialData ? "Guardar cambios" : "Crear clase y continuar"}
            </Button>
          </div>
        </TabsContent>

        {/* Pestaña: Lecciones */}
        <TabsContent value="lecciones" className="space-y-4 pt-4">
          {(classId || initialData?.id) ? (
            <>
              <div className="bg-muted/30 p-3 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  📌 Las lecciones se guardan automáticamente. Puedes ordenarlas arrastrando.
                </p>
              </div>
              <LessonManager
                classId={classId || initialData?.id}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["admin-clases"] });
                }}
              />
            </>
          ) : (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground">
                Primero debes guardar la clase para poder agregar lecciones.
              </p>
              <Button type="button" onClick={() => setActiveTab("datos")}>
                Ir a datos de la clase
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cerrar
            </Button>
            {classId && (
              <Button type="button" onClick={() => onSuccess()}>
                Terminar
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
};

export default ClaseForm;
