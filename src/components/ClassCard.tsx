import { Lock, Clock, BookOpen, ShoppingCart, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ClassWithLessons } from "@/hooks/useClasses";
import { useCart } from "@/contexts/CartContext";

interface ClassCardProps {
  classData: ClassWithLessons;
  isEnrolled: boolean;
}

const ClassCard = ({ classData, isEnrolled }: ClassCardProps) => {
  const isPublic = classData.is_public === true;
  const locked = !isEnrolled && !isPublic;
  const { addItem, isInCart } = useCart();
  const { toast } = useToast();
  const inCart = isInCart(classData.id);

  const handleAdd = () => {
    addItem({
      id: classData.id,
      title: classData.title,
      price: classData.price,
      image: classData.image_url || "/placeholder.svg",
    });
    toast({ title: "¡Agregado al carrito!", description: classData.title });
  };

  const compatibleModels = classData.compatible_models || [];

  return (
    <Card
      className={`group overflow-hidden border-border/60 transition-all duration-300 hover:shadow-lg ${
        locked ? "hover:-translate-y-0.5" : "hover:-translate-y-1"
      }`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={classData.image_url || "/placeholder.svg"}
          alt={classData.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${locked ? "opacity-60" : ""}`}
        />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
            <div className="bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant="secondary" className="text-xs font-body backdrop-blur-sm bg-background/80">
            {classData.category}
          </Badge>
        </div>
        {isPublic && (
          <Badge className="absolute top-3 right-3 text-xs font-body bg-accent text-accent-foreground">Gratis 🎉</Badge>
        )}
        {isEnrolled && !isPublic && (
          <Badge className="absolute top-3 right-3 text-xs font-body bg-primary text-primary-foreground">Inscrita ✓</Badge>
        )}
      </div>

      <CardContent className={`p-4 space-y-3 ${locked ? "opacity-80" : ""}`}>
        <Link to={`/clases/${classData.slug}`} className="hover:text-primary transition-colors">
          <h3 className="font-semibold text-foreground leading-snug line-clamp-2">{classData.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{classData.description}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{classData.duration}</span>
          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{classData.lessons.length} lecciones</span>
        </div>

        <div className="flex gap-1">
          {compatibleModels.map((model) => (
            <span key={model} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">{model}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          {isPublic ? (
            <span className="text-lg font-bold text-primary">Gratis</span>
          ) : (
            <span className="text-lg font-bold text-foreground">
              ${classData.price} <span className="text-xs font-normal text-muted-foreground">MXN</span>
            </span>
          )}
          {isEnrolled || isPublic ? (
            <Button size="sm" className="font-body text-xs" asChild>
              <Link to={`/clases/${classData.slug}`}>Ver clase</Link>
            </Button>
          ) : (
            <Button size="sm" variant={inCart ? "secondary" : "outline"} className="font-body text-xs gap-1" onClick={handleAdd} disabled={inCart}>
              {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
              {inCart ? "En carrito" : "Agregar"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassCard;
