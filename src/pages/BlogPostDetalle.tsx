import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Lock, CheckCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Datos dummy mientras no hay tabla en BD
const DUMMY_POSTS: Record<string, any> = {
  "como-limpiar-thermomix": {
    id: "1",
    title: "Cómo limpiar tu Thermomix correctamente",
    slug: "como-limpiar-thermomix",
    excerpt: "Aprende los mejores trucos para mantener tu Thermomix como nueva después de cada uso.",
    content: `
      <p>La limpieza regular de tu Thermomix es esencial para mantener su rendimiento y prolongar su vida útil. Aquí te comparto los mejores consejos para una limpieza profunda y efectiva.</p>
      
      <h2>Limpieza diaria</h2>
      <p>Después de cada uso, lava el vaso, la tapa y el cubilete con agua caliente y jabón suave. El cepillo de limpieza incluido es perfecto para llegar a los rincones difíciles.</p>
      
      <h2>Limpieza profunda semanal</h2>
      <p>Una vez a la semana, realiza una limpieza más profunda:</p>
      <ul>
        <li>Desmonta las cuchillas con cuidado</li>
        <li>Limpia la junta de la tapa</li>
        <li>Revisa y limpia los sensores</li>
      </ul>
      
      <h2>Productos recomendados</h2>
      <p>Utiliza productos no abrasivos. El bicarbonato de sodio es excelente para eliminar olores y manchas difíciles.</p>
    `,
    read_time: 5,
    tags: ["limpieza", "mantenimiento"],
    created_at: new Date().toISOString(),
  },
  "tips-principiantes-thermomix": {
    id: "2",
    title: "10 tips para principiantes en Thermomix",
    slug: "tips-principiantes-thermomix",
    excerpt: "Si acabas de adquirir tu Thermomix, estos tips te ayudarán a sacarle el máximo provecho.",
    content: `
      <p>¡Bienvenido al mundo Thermomix! Aquí tienes 10 tips esenciales para empezar con el pie derecho.</p>
      
      <h2>1. Lee el manual</h2>
      <p>Aunque parezca obvio, el manual tiene información valiosa sobre el funcionamiento básico.</p>
      
      <h2>2. Empieza con recetas simples</h2>
      <p>Las sopas y purés son excelentes para familiarizarte con el robot.</p>
      
      <h2>3. Usa la función de pesaje</h2>
      <p>La báscula integrada es una de las herramientas más útiles.</p>
      
      <h2>4. Limpia inmediatamente después de usar</h2>
      <p>Es más fácil limpiar cuando los residuos aún están frescos.</p>
      
      <p><strong>Continúa con los siguientes tips en el artículo completo...</strong></p>
    `,
    read_time: 8,
    tags: ["principiantes", "tips"],
    created_at: new Date().toISOString(),
  },
};

const BlogPostDetalle = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRead, setHasRead] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Intentar obtener de Supabase (cuando la tabla exista)
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error) throw error;
        
        if (data) {
          setPost(data);
        } else {
          // Fallback a datos dummy
          const dummyPost = DUMMY_POSTS[slug || ""];
          if (dummyPost) {
            setPost(dummyPost);
          } else {
            navigate("/basicos");
            return;
          }
        }
      } catch (error) {
        console.log("Usando datos dummy para post:", error);
        const dummyPost = DUMMY_POSTS[slug || ""];
        if (dummyPost) {
          setPost(dummyPost);
        } else {
          navigate("/basicos");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug, navigate]);

  // Verificar si ya leyó este artículo
  useEffect(() => {
    const checkReadProgress = async () => {
      if (!user || !post) return;

      try {
        const { data, error } = await supabase
          .from("blog_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("post_id", post.id)
          .single();

        if (!error && data) {
          setHasRead(true);
        }
      } catch (error) {
        // Tabla aún no existe o no hay registro
        console.log("No se pudo verificar progreso:", error);
      }
    };

    checkReadProgress();
  }, [user, post]);

  const markAsRead = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar tu progreso",
        variant: "destructive",
      });
      return;
    }

    if (hasRead) return;

    setIsMarking(true);
    try {
      const { error } = await supabase
        .from("blog_progress")
        .insert({
          user_id: user.id,
          post_id: post.id,
          read_at: new Date().toISOString(),
        });

      if (error) throw error;

      setHasRead(true);
      toast({
        title: "¡Progreso guardado!",
        description: "Este artículo ha sido marcado como leído",
      });
    } catch (error) {
      console.error("Error al guardar progreso:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el progreso. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsMarking(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando artículo...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Artículo no encontrado</h1>
            <Button asChild variant="outline">
              <Link to="/basicos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al blog
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b bg-secondary/20">
          <div className="container px-4 py-3">
            <Link to="/basicos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Link>
          </div>
        </div>

        <div className="container max-w-3xl px-4 py-8 md:py-12">
          {/* Si no está logueado, mostrar bloqueo */}
          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-4"
            >
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Lock className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-display font-bold">Contenido exclusivo</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Regístrate para acceder a este artículo y a todo el contenido educativo de Gaby Bernal.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth">
                  <BookOpen className="h-4 w-4" />
                  Regístrate gratis
                </Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header del artículo */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.created_at)}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <Clock className="h-4 w-4" />
                  <span>{post.read_time} min lectura</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Contenido del artículo */}
              <div 
                className="prose prose-mint max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <Separator />

              {/* Botón marcar como leído */}
              <div className="flex justify-between items-center pt-4">
                <div>
                  {hasRead ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Artículo completado</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Marca este artículo como leído para llevar tu progreso
                    </p>
                  )}
                </div>
                {!hasRead && (
                  <Button onClick={markAsRead} disabled={isMarking} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {isMarking ? "Guardando..." : "Marcar como leído"}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostDetalle;
