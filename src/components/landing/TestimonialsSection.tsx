import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const testimonials = [
  {
    name: "María López",
    text: "Las clases de Gaby transformaron mi forma de cocinar con la Thermomix. ¡Increíble!",
    rating: 5,
  },
  {
    name: "Ana García",
    text: "La Calculadora Panadero Pro es una joya. Mis panes nunca habían quedado tan bien.",
    rating: 5,
  },
  {
    name: "Laura Martínez",
    text: "Contenido de primera calidad. Cada clase vale completamente la pena.",
    rating: 5,
  },
];

const TestimonialsSection = () => (
  <section id="sobre" className="py-14 md:py-20">
    <div className="container px-4">
      <motion.div
        className="text-center mb-10 space-y-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
          Lo que dicen nuestras alumnas
        </h2>
      </motion.div>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {testimonials.map((t) => (
          <motion.div key={t.name} variants={staggerItem}>
            <Card className="border-border/60 h-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  "{t.text}"
                </p>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default TestimonialsSection;
