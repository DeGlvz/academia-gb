import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import ClaseForm from "@/components/admin/ClaseForm";

interface Clase {
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

const AdminClases = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClase, setSelectedClase] = useState<Clase | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [claseToDelete, setClaseToDelete] = useState<Clase | null>(null);
  const [filter, setFilter] = useState<"all" | "paid" | "free">("all");

  // Fetch clases
  const { data: clases = [], isLoading } = useQuery({
    queryKey: ["admin-clases", filter],
    queryFn: async () => {
      let query = supabase.from("classes").select("*");
      
      if (filter === "paid") {
        query = query.gt("price", 0);
      } else if (filter === "free") {
        query = query.eq("price", 0);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      
      // Obtener conteo de alumnos por clase
      const clasesWithCount = await Promise.all(
        (data || []).map(async (clase) => {
          const { count, error: countError } = await supabase
            .from("enrolled_classes")
            .select("*", { count: "exact", head: true })
            .eq("class_id", clase.id);
          
          return {
            ...clase,
            enrolled_count: count || 0,
          };
        })
      );
      
      return clasesWithCount as Clase[];
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clases"] });
      toast({ title: "Clase eliminada", description: "La clase ha sido eliminada correctamente." });
      setDeleteDialogOpen(false);
      setClaseToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Mutación para cambiar precio
  const changePriceMutation = useMutation({
    mutationFn: async ({ id, newPrice }: { id: string; newPrice: number }) => {
      const clase = clases.find((c) => c.id === id);
      if (clase && clase.enrolled_count && clase.enrolled_count > 0) {
        throw new Error("No se puede cambiar el precio porque ya hay alumnos inscritos");
      }
      
      const { error } = await supabase
        .from("classes")
        .update({ price: newPrice })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clases"] });
      toast({ title: "Precio actualizado", description: "El precio ha sido actualizado correctamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (clase: Clase) => {
    setSelectedClase(clase);
    setDialogOpen(true);
  };

  const handleDelete = (clase: Clase) => {
    setClaseToDelete(clase);
    setDeleteDialogOpen(true);
  };

  const handleMakeFree = (clase: Clase) => {
    if (clase.enrolled_count && clase.enrolled_count > 0) {
      toast({
        title: "No se puede cambiar",
        description: `Esta clase ya tiene ${clase.enrolled_count} alumno(s) inscrito(s). No se puede cambiar el precio.`,
        variant: "destructive",
      });
      return;
    }
    changePriceMutation.mutate({ id: clase.id, newPrice: 0 });
  };

  const getFilteredCount = () => {
    const paid = clases.filter((c) => c.price > 0).length;
    const free = clases.filter((c) => c.price === 0).length;
    return { paid, free, total: clases.length };
  };

  const counts = getFilteredCount();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">Clases</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva clase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedClase ? "Editar clase" : "Crear nueva clase"}</DialogTitle>
            </DialogHeader>
            <ClaseForm
              initialData={selectedClase}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedClase(null);
                queryClient.invalidateQueries({ queryKey: ["admin-clases"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{counts.total}</p>
            <p className="text-sm text-muted-foreground">Total clases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-600">{counts.free}</p>
            <p className="text-sm text-muted-foreground">Clases gratis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-blue-600">{counts.paid}</p>
            <p className="text-sm text-muted-foreground">Clases de paga</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Todas ({counts.total})</TabsTrigger>
          <TabsTrigger value="paid">De paga ({counts.paid})</TabsTrigger>
          <TabsTrigger value="free">Gratis ({counts.free})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Alumnos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : clases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay clases
                  </TableCell>
                </TableRow>
              ) : (
                clases.map((clase) => (
                  <TableRow key={clase.id}>
                    <TableCell className="font-medium">{clase.title}</TableCell>
                    <TableCell>{clase.category}</TableCell>
                    <TableCell>
                      {clase.price === 0 ? (
                        <Badge variant="secondary">Gratis</Badge>
                      ) : (
                        <span className="font-medium">${clase.price} MXN</span>
                      )}
                    </TableCell>
                    <TableCell>{clase.enrolled_count || 0}</TableCell>
                    <TableCell>
                      <Badge variant={clase.is_published ? "default" : "outline"}>
                        {clase.is_published ? "Publicado" : "Borrador"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(clase)} title="Editar clase y lecciones">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {clase.price > 0 && clase.enrolled_count === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMakeFree(clase)}
                          title="Hacer gratis"
                          className="text-green-600"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(clase)}
                        title="Eliminar"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AlertDialog Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la clase "{claseToDelete?.title}" y todas sus lecciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => claseToDelete && deleteMutation.mutate(claseToDelete.id)}
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminClases;
