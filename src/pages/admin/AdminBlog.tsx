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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, CalendarClock } from "lucide-react";
import BlogForm from "@/components/admin/BlogForm";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  read_time: number;
  is_published: boolean;
  created_at: string;
  published_at: string | null;
}

const AdminBlog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog", filter],
    queryFn: async () => {
      let query = supabase.from("blog_posts").select("*");
      
      if (filter === "published") {
        query = query.eq("is_published", true);
      } else if (filter === "draft") {
        query = query.eq("is_published", false);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast({ title: "Artículo eliminado", description: "El artículo ha sido eliminado correctamente." });
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({ 
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast({ title: "Estado actualizado", description: "El artículo ha sido actualizado." });
    },
  });

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setDialogOpen(true);
  };

  const handleDelete = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const getFilteredCount = () => {
    const published = posts.filter((p) => p.is_published).length;
    const draft = posts.filter((p) => !p.is_published).length;
    return { published, draft, total: posts.length };
  };

  const counts = getFilteredCount();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">Blog</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo artículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPost ? "Editar artículo" : "Crear nuevo artículo"}</DialogTitle>
            </DialogHeader>
            <BlogForm
              initialData={selectedPost}
              onSuccess={() => {
                setDialogOpen(false);
                setSelectedPost(null);
                queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
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
            <p className="text-sm text-muted-foreground">Total artículos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-600">{counts.published}</p>
            <p className="text-sm text-muted-foreground">Publicados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-orange-600">{counts.draft}</p>
            <p className="text-sm text-muted-foreground">Borradores</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Todos ({counts.total})</TabsTrigger>
          <TabsTrigger value="published">Publicados ({counts.published})</TabsTrigger>
          <TabsTrigger value="draft">Borradores ({counts.draft})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Lectura</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay artículos
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags?.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{post.tags.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{post.read_time || 5} min</TableCell>
                    <TableCell>
                      {post.is_published ? (
                        <Badge variant="default" className="bg-green-600">Publicado</Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">Borrador</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {!post.is_published && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => publishMutation.mutate({ id: post.id, publish: true })}
                          title="Publicar"
                          className="text-green-600"
                        >
                          <CalendarClock className="h-4 w-4" />
                        </Button>
                      )}
                      {post.is_published && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => publishMutation.mutate({ id: post.id, publish: false })}
                          title="Mover a borrador"
                          className="text-orange-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(post)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post)}
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
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el artículo "{postToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && deleteMutation.mutate(postToDelete.id)}
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

export default AdminBlog;
