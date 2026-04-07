import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Lock, BookOpen, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Datos dummy mientras no hay tabla en BD
const DUMMY_POSTS = [
  {
    id: "1",
    title: "Cómo limpiar tu Thermomix correctamente",
    slug: "como-limpiar-thermomix",
    excerpt: "Aprende los mejores trucos para mantener tu Thermomix como nueva después de cada uso.",
    content: "Contenido completo del artículo...",
    read_time: 5,
    tags: ["limpieza", "mantenimiento"],
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "10 tips para principiantes en Thermomix",
    slug: "tips-principiantes-thermomix",
    excerpt: "Si acabas de adquirir tu Thermomix, estos tips te ayudarán a sacarle el máximo provecho.",
    content: "Contenido completo del artículo...",
    read_time: 8,
    tags: ["principiantes", "tips"],
    created_at: new Date().toISOString(),
  },
];

const BlogBasicos = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Intentar obtener de Supabase (cuando la tabla exista)
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setPosts(data);
        } else {
          // Fallback a datos dummy
          setPosts(DUMMY_POSTS);
        }
      } catch (error) {
        console.log("Usando datos dummy para blog:", error);
        setPosts(DUMMY_POSTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-to-r from-mint-100/50 to-background border-b">
          <div className="container px-4 py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Básicos de tu Thermomix
              </h1>
              <p className="text-muted-foreground">
                Tips, tutoriales y consejos para sacarle el máximo provecho a tu Thermomix
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Cargando artículos...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 flex flex-col">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.created_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <Clock className="h-3 w-3 ml-1" />
                        <span>{post.read_time || 5} min lectura</span>
                      </div>
                      <CardTitle className="text-xl font-display line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {user ? (
                        <Button asChild variant="default" className="w-full gap-2">
                          <Link to={`/blog/${post.slug}`}>
                            <BookOpen className="h-4 w-4" />
                            Leer artículo
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="w-full gap-2">
                          <Link to="/auth">
                            <Lock className="h-4 w-4" />
                            Inicia sesión para leer
                          </Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!user && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 text-center p-8 bg-mint-50 rounded-xl border border-mint-200"
            >
              <p className="text-muted-foreground mb-3">
                ¿Quieres acceder a todos los artículos y llevar tu progreso?
              </p>
              <Button asChild>
                <Link to="/auth">
                  Regístrate gratis <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogBasicos;
