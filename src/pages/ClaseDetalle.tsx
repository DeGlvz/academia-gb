import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Lock, Clock, BookOpen, ShoppingCart, CheckCircle, User, Check, FileText, Video, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useClassBySlug } from "@/hooks/useClasses";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { recordPurchaseAttempt } from "@/lib/purchaseAttempts";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ClaseDetalle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: classData, isLoading } = useClassBySlug(slug);
  const isEnrolled = false; // TODO: check enrolled_classes
  const { addItem, isInCart } = useCart();
  const { toast } = useToast();
  const inCart = classData ? isInCart(classData.id) : false;

  const handleAdd = () => {
    if (classData) {
      addItem({
        id: classData.id,
        title: classData.title,
        price: classData.price,
        image: classData.image_url || "/placeholder.svg",
      });
      toast({ title: "¡Agregado al carrito!", description: classData.title });
    }
  };

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

  if (!classData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Clase no encontrada</h1>
            <Button asChild variant="outline">
              <Link to="/clases">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al catálogo
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalLessons = classData.lessons.length;
  const compatibleModels = classData.compatible_models || [];

  // Función para obtener el icono según tipo de lección
  const getLessonIcon = (lessonType?: string) => {
    switch (lessonType) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "text":
        return <Code className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  // Función para renderizar el contenido de la lección según tipo
  const renderLessonContent = (lesson: any) => {
    if (!isEnrolled && !lesson.is_free) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span className="text-sm">Desbloquea la clase para acceder</span>
        </div>
      );
    }

    switch (lesson.lesson_type) {
      case "video":
        if (lesson.content_url) {
          // Detectar si es YouTube, Vimeo o video directo
          const isYouTube = lesson.content_url.includes("youtube.com") || lesson.content_url.includes("youtu.be");
          const isVimeo = lesson.content_url.includes("vimeo.com");
          
          let embedUrl = lesson.content_url;
          if (isYouTube) {
            const videoId = lesson.content_url.split("v=")[1]?.split("&")[0] || lesson.content_url.split("/").pop();
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          } else if (isVimeo) {
            const videoId = lesson.content_url.split("/").pop();
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
          }
          
          return (
            <div className="space-y-2">
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              {lesson.video_thumbnail && (
                <p className="text-xs text-muted-foreground">Miniatura: {lesson.video_thumbnail}</p>
              )}
            </div>
          );
        }
        return <p className="text-muted-foreground">No hay URL de video configurada</p>;

      case "pdf":
        if (lesson.material_url) {
          return (
            <div className="space-y-3">
              <Button asChild variant="default" className="gap-2">
                <a href={lesson.material_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  Abrir PDF
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href={lesson.material_url} download>
                  Descargar PDF
                </a>
              </Button>
            </div>
          );
        }
        return <p className="text-muted-foreground">No hay PDF disponible</p>;

      case "text":
        return (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: lesson.content_url || "<p>Contenido no disponible</p>" }}
          />
        );

      default:
        // Fallback para lecciones sin tipo específico
        return (
          <div className="space-y-2">
            <p className="text-muted-foreground">{lesson.description || "Contenido de la lección"}</p>
            {lesson.content_url && (
              <Button asChild variant="outline" size="sm">
                <a href={lesson.content_url} target="_blank" rel="noopener noreferrer">
                  Ver contenido
                </a>
              </Button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="border-b bg-secondary/20">
          <div className="container px-4 py-3">
            <Link to="/clases" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Volver al catálogo
            </Link>
          </div>
        </div>

        <div className="container px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="relative aspect-video bg-foreground/5 rounded-xl overflow-hidden border">
                <img
                  src={classData.image_url || "/placeholder.svg"}
                  alt={classData.title}
                  className={`w-full h-full object-cover ${!isEnrolled ? "opacity-60 blur-sm" : ""}`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {isEnrolled ? (
                    <button className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground flex items-center justify-center shadow-xl transition-all hover:scale-105">
                      <Play className="h-7 w-7 md:h-8 md:w-8 ml-1" />
                    </button>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="h-16 w-16 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-xl mx-auto">
                        <Lock className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                        Adquiere esta clase para ver el contenido
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-body">{classData.category}</Badge>
                  {compatibleModels.map((m) => (
                    <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                      {m}
                    </span>
                  ))}
                  {isEnrolled && (
                    <Badge className="bg-primary text-primary-foreground font-body">Inscrita ✓</Badge>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{classData.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{classData.instructor}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{classData.duration}</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{totalLessons} lecciones</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">Descripción</h2>
                  <p className="text-muted-foreground leading-relaxed">{classData.long_description || classData.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Contenido del curso ({totalLessons} lecciones)</h2>
                <div className="space-y-2">
                  {classData.lessons.map((lesson, index) => {
                    const canAccess = isEnrolled || lesson.is_free;
                    return (
                      <Dialog key={lesson.id}>
                        <DialogTrigger asChild>
                          <Card className={`transition-colors ${canAccess ? "hover:border-primary/40 cursor-pointer" : "opacity-60"}`}>
                            <CardContent className="p-4 flex items-center gap-4">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${canAccess ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                                {getLessonIcon(lesson.lesson_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm font-medium truncate ${canAccess ? "text-foreground" : "text-muted-foreground"}`}>{lesson.title}</p>
                                  {lesson.is_free && !isEnrolled && (
                                    <Badge variant="outline" className="text-[10px] shrink-0 font-body border-primary text-primary">Gratis</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {lesson.lesson_type === "video" && "📹 Video"}
                                  {lesson.lesson_type === "pdf" && "📄 Material PDF"}
                                  {lesson.lesson_type === "text" && "📝 Texto / HTML"}
                                  {!lesson.lesson_type && "📚 Contenido"}
                                </p>
                              </div>
                              <div className="shrink-0">
                                {canAccess ? (
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Play className="h-3.5 w-3.5 text-primary ml-0.5" />
                                  </div>
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getLessonIcon(lesson.lesson_type)}
                              {lesson.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {lesson.description && (
                              <p className="text-muted-foreground">{lesson.description}</p>
                            )}
                            {renderLessonContent(lesson)}
                          </div>
                        </DialogContent>
                      </Dialog>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <Card className="border-primary/20">
                  <CardContent className="p-6 space-y-5">
                    <div className="text-center space-y-1">
                      <p className="text-3xl font-bold text-foreground">
                        ${classData.price} <span className="text-sm font-normal text-muted-foreground">MXN</span>
                      </p>
                      <p className="text-xs text-muted-foreground">Acceso de por vida</p>
                    </div>

                    {isEnrolled ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary text-sm font-medium justify-center">
                          <CheckCircle className="h-5 w-5" />
                          Ya estás inscrita
                        </div>
                        <Button className="w-full gap-2 font-body" size="lg">
                          <Play className="h-4 w-4" />
                          Continuar clase
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button className="w-full gap-2 font-body" size="lg" onClick={handleAdd} disabled={inCart}>
                          {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                          {inCart ? "Ya está en el carrito" : "Agregar al carrito"}
                        </Button>
                        <Button variant="outline" className="w-full font-body" size="lg" asChild>
                          <a
                            href={`https://wa.me/5215559663086?text=${encodeURIComponent(`Hola Gaby, me interesa la clase "${classData.title}" ($${classData.price} MXN). ¿Cómo puedo adquirirla?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => recordPurchaseAttempt([{ title: classData.title, price: classData.price }])}
                          >
                            Comprar por WhatsApp
                          </a>
                        </Button>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-3 text-sm">
                      <h3 className="font-semibold text-foreground">Incluye:</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{totalLessons} lecciones</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" />Acceso de por vida</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" />Material descargable</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" />Compatible con {compatibleModels.join(", ")}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClaseDetalle;
