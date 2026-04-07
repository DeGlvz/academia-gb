import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EditorTipTap from "./EditorTipTap";
import { slugify } from "@/lib/utils";

interface BlogFormProps {
  initialData?: any;
  onSuccess: () => void;
}

const BlogForm = ({ initialData, onSuccess }: BlogFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState(initialData?.content || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      read_time: initialData?.read_time || 5,
      is_published: initialData?.is_published || false,
    },
  });

  const watchTitle = watch("title");

  // Generar slug automáticamente
  useEffect(() => {
    if (watchTitle && !initialData) {
      setValue("slug", slugify(watchTitle));
    }
  }, [watchTitle, setValue, initialData]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const postData = {
        ...data,
        content: content,
        tags: tags,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([postData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast({ title: "Artículo guardado", description: "El artículo ha sido guardado correctamente." });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    if (!content.trim()) {
      toast({ title: "Error", description: "El contenido del artículo es requerido.", variant: "destructive" });
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
        <p className="text-xs text-muted-foreground">Ej: como-limpiar-tu-thermomix</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Extracto / Resumen</Label>
        <Textarea id="excerpt" rows={3} {...register("excerpt")} placeholder="Breve descripción del artículo..." />
      </div>

      <div className="space-y-2">
        <Label>Contenido *</Label>
        <EditorTipTap content={content} onChange={setContent} />
      </div>

      <div className="space-y-2">
        <Label>Etiquetas (tags)</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Escribe una etiqueta y presiona Enter"
          />
          <Button type="button" variant="outline" onClick={addTag}>Agregar</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="read_time">Tiempo de lectura (minutos)</Label>
          <Input id="read_time" type="number" {...register("read_time")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="is_published">Publicar</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Switch id="is_published" onCheckedChange={(checked) => setValue("is_published", checked)} defaultChecked={initialData?.is_published} />
            <Label htmlFor="is_published">{watch("is_published") ? "Publicado (visible)" : "Borrador (no visible)"}</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Guardar artículo"}
        </Button>
      </div>
    </form>
  );
};

export default BlogForm;
