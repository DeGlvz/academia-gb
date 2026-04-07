import { Heart, ChefHat, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ClassCard from "@/components/ClassCard";
import { useClasses } from "@/hooks/useClasses";
import { publicCategories } from "@/data/classes";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const FreeContentSection = () => {
  const { data: classes = [], isLoading } = useClasses();

  const freeClasses = classes.filter((c) =>
    publicCategories.includes(c.category as any)
  );

  return (
    <section className="py-14 md:py-20">
      <div className="container px-4 space-y-10">
        {/* Header */}
        <motion.div
          className="text-center space-y-3 max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="flex items-center justify-center gap-2 text-primary">
            <Heart className="h-5 w-5 fill-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide font-body">
              Contenido Gratuito
            </span>
            <ChefHat className="h-5 w-5" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-foreground leading-tight">
            De mi cocina a tu cocina
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Guías de inicio, recetas del día a día y trucos para sacar el máximo provecho a tu
            Thermomix. Sin costo, sin registro previo.
          </p>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : freeClasses.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {freeClasses.map((c) => (
              <motion.div key={c.id} variants={staggerItem}>
                <ClassCard classData={c} isEnrolled={false} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            Próximamente agregaremos contenido gratuito. ¡Vuelve pronto!
          </p>
        )}

        {/* CTA */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="font-body gap-2 min-h-[48px]" asChild>
            <Link to="/clases">
              Ver todas las clases
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FreeContentSection;
