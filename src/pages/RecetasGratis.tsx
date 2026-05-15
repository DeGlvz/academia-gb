import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useClasses } from "@/hooks/useClasses";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Award, ArrowLeft, Loader2 } from "lucide-react";

// Slugs de blogs a excluir
const BLOG_SLUGS = ["basicos-de-tu-thermomix"];

const RecetasGratis = () => {
  const { data: classes = [], isLoading } = useClasses();
  const { user } = useAuth();

  // Filtrar clases gratis (price === 0) y excluir blogs
  const freeClasses = classes.filter(c => 
    c.price === 0 && !BLOG_SLUGS.includes(c.slug)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
        </div>

        <div className="container px-4 py-8 md:py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Recetas Gratuitas
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explora todas nuestras recetas gratis. Regístrate para acceder al contenido completo.
            </p>
          </div>

          {freeClasses.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Próximamente más recetas gratuitas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeClasses.map((classItem) => (
                <Card key={classItem.id} className="h-full hover:shadow-lg transition-all duration-300">
                  {classItem.image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img 
                        src={classItem.image_url} 
                        alt={classItem.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        🎁 Gratis
                      </Badge>
                      {classItem.duration && (
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" /> {classItem.duration}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl font-display line-clamp-2">
                      {classItem.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {classItem.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {classItem.compatible_models?.slice(0, 3).map((model: string) => (
                        <span key={model} className="text-xs px-2 py-0.5 rounded-full bg-mint-100 text-mint-700">
                          {model}
                        </span>
                      ))}
                      {classItem.compatible_models?.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          +{classItem.compatible_models.length - 3}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full gap-2">
                      <Link to={`/clases/${classItem.slug}`}>
                        <BookOpen className="h-4 w-4" />
                        {user ? "Ver receta" : "Inicia sesión para acceder"}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecetasGratis;
