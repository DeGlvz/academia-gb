import { useState, useEffect } from "react";
import { Save, Star, Plus, Edit, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Tipo para posts del blog
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
  updated_at: string;
}

const AdminContenido = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("landing");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Formulario para nuevo/editar post
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    read_time: 5,
    is_published: false,
  });

  // Hero section state
  const [hero, setHero] = useState({
    badge: "🍳 Academia Online",
    title: "Cocina con Gaby Bernal en tu cocina",
    subtitle:
      "Domina tu Thermomix con clases exclusivas, recetas paso a paso y herramientas profesionales diseñadas para ti.",
    ctaPrimary: "Ver Clases",
    ctaSecondary: "Conoce más",
  });

  const [cta, setCta] = useState({
    title: "¿Lista para comenzar?",
    subtitle:
      "Únete a cientos de alumnas que ya cocinan como profesionales con su Thermomix.",
    buttonText: "Explorar Clases",
  });

  const [testimonials, setTestimonials] = useState([
    { name: "María López", text: "Las clases de Gaby transformaron mi forma de cocinar con la Thermomix. ¡Increíble!", rating: 5 },
    { name: "Ana García", text: "La Calculadora Panadero Pro es una joya. Mis panes nunca habían quedado tan bien.", rating: 5 },
    { name: "Laura Martínez", text: "Contenido de primera calidad. Cada clase vale completamente la pena.", rating: 5 },
  ]);

  // Cargar posts del blog
  const loadBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error("Error loading blog posts:", error);
      toast({ title: "Error", description: "No se pudieron cargar los artículos", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const handleSaveLanding = (section: string) => {
    toast({ title: `"${section}" guardado`, description: "Los cambios se aplicarán en la landing." });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSavePost = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Error", description: "Título y contenido son requeridos", variant: "destructive" });
      return;
    }

    const slug = formData.slug || generateSlug(formData.title);
    const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(t => t);

    const postData = {
      title: formData.title,
      slug,
      excerpt: formData.excerpt || formData.content.substring(0, 150),
      content: formData.content,
      tags: tagsArray,
      read_time: formData.read_time,
      is_published: formData.is_published,
    };

    try {
      if (editingPost) {
        // Actualizar
        const { error } = await supabase
          .from("blog_posts")
          .update({ ...postData, updated_at: new Date().toISOString() })
          .eq("id", editingPost.id);

        if (error) throw error;
        toast({ title: "Artículo actualizado", description: `"${formData.title}" se actualizó correctamente` });
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from("blog_posts")
          .insert([postData]);

        if (error) throw error;
        toast({ title: "Artículo creado", description: `"${formData.title}" se publicó correctamente` });
      }

      setIsDialogOpen(false);
      resetForm();
      loadBlogPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      toast({ title: "Error", description: "No se pudo guardar el artículo", variant: "destructive" });
    }
  };

  const handleDeletePost = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;
      toast({ title: "Artículo eliminado", description: `"${post.title}" fue eliminado` });
      loadBlogPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({ title: "Error", description: "No se pudo eliminar el artículo", variant: "destructive" });
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ is_published: !post.is_published, updated_at: new Date().toISOString() })
        .eq("id", post.id);

      if (error) throw error;
      toast({ title: post.is_published ? "Artículo ocultado" : "Artículo publicado", description: `"${post.title}" ${post.is_published ? "ya no es visible" : "ahora es visible"}` });
      loadBlogPosts();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast({ title: "Error", description: "No se pudo cambiar el estado", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      tags: "",
      read_time: 5,
      is_published: false,
    });
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      tags: post.tags?.join(", ") || "",
      read_time: post.read_time || 5,
      is_published: post.is_published,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Contenido</h1>
        <p className="text-muted-foreground text-sm mt-1">Edita la landing page y administra el blog</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="landing" className="gap-2">
            <Star className="h-4 w-4" />
            Landing
          </TabsTrigger>
          <TabsTrigger value="blog" className="gap-2">
            <FileText className="h-4 w-4" />
            Blog
          </TabsTrigger>
        </TabsList>

        {/* Tab: Landing */}
        <TabsContent value="landing" className="space-y-6">
          {/* Hero */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sección Hero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Título principal</Label>
                <Input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Textarea value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Botón primario</Label>
                  <Input value={hero.ctaPrimary} onChange={(e) => setHero({ ...hero, ctaPrimary: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Botón secundario</Label>
                  <Input value={hero.ctaSecondary} onChange={(e) => setHero({ ...hero, ctaSecondary: e.target.value })} />
                </div>
              </div>
              <Button onClick={() => handleSaveLanding("Hero")} className="gap-2">
                <Save className="h-4 w-4" /> Guardar Hero
              </Button>
            </CardContent>
          </Card>

          {/* CTA Banner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Banner CTA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={cta.title} onChange={(e) => setCta({ ...cta, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Textarea value={cta.subtitle} onChange={(e) => setCta({ ...cta, subtitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Texto del botón</Label>
                <Input value={cta.buttonText} onChange={(e) => setCta({ ...cta, buttonText: e.target.value })} />
              </div>
              <Button onClick={() => handleSaveLanding("Banner CTA")} className="gap-2">
                <Save className="h-4 w-4" /> Guardar CTA
              </Button>
            </CardContent>
          </Card>

          {/* Testimonials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Testimonios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {testimonials.map((t, i) => (
                <div key={i} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Testimonio {i + 1}</span>
                    <div className="flex gap-0.5 ml-auto">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 cursor-pointer ${
                            s < t.rating ? "text-primary fill-primary" : "text-muted-foreground"
                          }`}
                          onClick={() => {
                            const updated = [...testimonials];
                            updated[i] = { ...updated[i], rating: s + 1 };
                            setTestimonials(updated);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nombre</Label>
                      <Input
                        value={t.name}
                        onChange={(e) => {
                          const updated = [...testimonials];
                          updated[i] = { ...updated[i], name: e.target.value };
                          setTestimonials(updated);
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs">Texto</Label>
                      <Textarea
                        value={t.text}
                        onChange={(e) => {
                          const updated = [...testimonials];
                          updated[i] = { ...updated[i], text: e.target.value };
                          setTestimonials(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={() => handleSaveLanding("Testimonios")} className="gap-2">
                <Save className="h-4 w-4" /> Guardar Testimonios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Blog */}
        <TabsContent value="blog" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Artículos del Blog</CardTitle>
              <Button onClick={openNewDialog} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo artículo
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Cargando artículos...</p>
              ) : blogPosts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay artículos. Crea el primero.</p>
              ) : (
                <div className="space-y-3">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{post.title}</p>
                          {post.is_published ? (
                            <Badge variant="default" className="text-xs">Publicado</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Borrador</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(post.created_at).toLocaleDateString("es-MX")} · {post.read_time || 5} min lectura
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(post)}
                          title={post.is_published ? "Ocultar" : "Publicar"}
                        >
                          {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(post)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Eliminar">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El artículo "{post.title}" será eliminado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePost(post)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para crear/editar artículo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Editar artículo" : "Nuevo artículo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título del artículo"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  placeholder="url-del-articulo"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, slug: generateSlug(formData.title) })}
                >
                  Generar
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Extracto (vista previa)</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Breve descripción del artículo"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Contenido (HTML) *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="<p>Contenido del artículo en HTML...</p>"
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tags (separados por coma)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tips, limpieza, principiantes"
                />
              </div>
              <div className="space-y-2">
                <Label>Tiempo de lectura (minutos)</Label>
                <Input
                  type="number"
                  value={formData.read_time}
                  onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) || 5 })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="is_published" className="cursor-pointer">Publicar inmediatamente</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePost}>
                <Save className="h-4 w-4 mr-2" />
                {editingPost ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContenido;
