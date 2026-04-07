import { BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ClassCard from "@/components/ClassCard";
import { useClasses } from "@/hooks/useClasses";
import { publicCategories } from "@/data/classes";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const PaidClassesSection = () => {
  const { data: classes = [], isLoading } = useClasses();

  const paidClasses = classes.filter(
    (c) => !publicCategories.includes(c.category as any)
  );

  if (isLoading || paidClasses.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-secondary/30">
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
            <BookOpen className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide font-body">
              Clases Disponibles
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Lleva tu cocina al siguiente nivel
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Clases especializadas en panadería, repostería, cocina saludable y más.
            Acceso completo a videos, PDFs y recetas exclusivas.
          </p>
        </motion.div>

        {/* Grid — show first 6 */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {paidClasses.slice(0, 6).map((c) => (
            <motion.div key={c.id} variants={staggerItem}>
              <ClassCard classData={c} isEnrolled={false} />
            </motion.div>
          ))}
        </motion.div>

        {paidClasses.length > 6 && (
          <div className="text-center">
            <Button size="lg" className="font-body gap-2 min-h-[48px]" asChild>
              <Link to="/clases">
                Ver todas las clases
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PaidClassesSection;
