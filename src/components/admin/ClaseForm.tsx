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
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";

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
  const [isUploading, setIsUploading] = useState(false);

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

      if (initialData?.id) {
        const { error } = await supabase
          .from("classes")
          .update(claseData)
          .eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("classes")
          .insert([claseData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clases"] });
      toast({ title: "Clase guardada", description: "La clase ha sido guardada correctamente." });
      onSuccess();
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
            <Label htmlFor="is_published">{watch("is_published") ? "Visible en el sitio" : "Borrador (no visible)"}</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Guardar clase"}
        </Button>
      </div>
    </form>
  );
};

export default ClaseForm;
