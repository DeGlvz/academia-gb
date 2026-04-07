import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Clase {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
  enrolled_count?: number;
}

export const useClasesAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clases = [], isLoading } = useQuery({
    queryKey: ["admin-clases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Clase[];
    },
  });

  const createClase = useMutation({
    mutationFn: async (newClase: Omit<Clase, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("classes")
        .insert([newClase])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clases"] });
      toast({ title: "Clase creada", description: "La clase ha sido creada exitosamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateClase = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Clase> & { id: string }) => {
      const { data, error } = await supabase
        .from("classes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clases"] });
      toast({ title: "Clase actualizada", description: "Los cambios han sido guardados." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteClase = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clases"] });
      toast({ title: "Clase eliminada", description: "La clase ha sido eliminada." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    clases,
    isLoading,
    createClase,
    updateClase,
    deleteClase,
  };
};
