import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useClasses } from "@/hooks/useClasses";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Award, ArrowLeft } from "lucide-react";

// Slugs de blogs a excluir
const BLOG_SLUGS = ["basicos-de-tu-thermomix"];

interface DeMiCocinaSectionProps {
  isFullPage?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
}

const DeMiCocinaSection = ({ 
  isFullPage = false, 
  limit = 6,
  title = "De Mi Cocina a Tu Cocina",
  subtitle = "Clases gratuitas para que empieces a cocinar con Thermomix. Regístrate y accede a todo el contenido."
}: DeMiCocinaSectionProps) => {
  const { data: classes = [], isLoading } = useClasses();
  const { user } = useAuth();

  // Filtrar clases gratis (price === 0) y excluir blogs
  const freeClasses = classes.filter(c => 
    c.price === 0 && !BLOG_SLUGS.includes(c.slug)
  );

  // Limitar si no es página completa
  const displayClasses = isFullPage ? freeClasses : freeClasses.slice(0, limit);

  if (isLoading) {
    return (
      <section className={`${isFullPage ? 'py-8' : 'py-12'} bg-gradient-to-br from-mint-50/50 to-background`}>
        <div className="container px-4">
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">Cargando recetas gratis...</div>
          </div>
        </div>
      </section>
    );
  }

  if (freeClasses.length === 0) {
    return null;
  }

  return (
    <section id={isFullPage ? undefined : "clases-gratis"} className={`${isFullPage ? 'py-8' : 'py-12'} bg-gradient-to-br from-mint-50/50 to-background`}>
      <div className="container px-4">
        {/* Botón volver (solo en página completa) */}
        {isFullPage && (
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
          {!isFullPage && freeClasses.length > limit && (
            <Button asChild variant="link" className="mt-2">
              <Link to="/recetas-gratis">
                Ver todas las recetas →
              </Link>
            </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayClasses.map((classItem, index) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-mint-200/50 bg-white/80 backdrop-blur-sm">
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
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                      🎁 Gratis
                    </span>
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
                  <Button asChild className="w-full gap-2" variant="default">
                    <Link to={`/clases/${classItem.slug}`}>
                      <BookOpen className="h-4 w-4" />
                      {user ? "Ver receta" : "Inicia sesión para acceder"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {displayClasses.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Próximamente más recetas gratuitas</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DeMiCocinaSection;
