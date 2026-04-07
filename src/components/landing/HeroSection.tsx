import { Heart, ChefHat, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import gabyImg from "@/assets/gaby-bernal.jpg";
import { fadeInUp, slideInLeft, slideInRight } from "@/lib/animations";

const HeroSection = () => (
  <section className="relative overflow-hidden">
    {/* Subtle warm gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-mint-50/80 via-background to-warm/60" />

    <div className="container relative px-4 py-14 md:py-20 lg:py-28">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Copy */}
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={slideInLeft}
        >
          <motion.span
            className="inline-flex items-center gap-1.5 px-3 py-1 font-semibold bg-primary/10 text-primary rounded-full font-body text-4xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Heart className="h-3 w-3 fill-primary" /> De mi cocina a tu cocina
          </motion.span>

          <h1 className="text-3xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.15] text-foreground sm:text-3xl">
            ¡Bienvenida a mi{" "}
            <span className="text-primary">rincón especial!</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed text-justify">
            En esta sección, <em>"De mi cocina a tu cocina"</em>, quiero compartir contigo mis
            secretos más guardados, esos básicos que no pueden faltar y las recetas que preparo
            en casa para mi familia.{" "}
            <span className="block mt-2">
              Aquí siempre encontrarás contenido{" "}
              <strong className="text-foreground">totalmente gratuito</strong>: guías de inicio,
              trucos para cuidar tu Thermomix y recetas que te facilitarán la vida diaria.
            </span>
          </p>

          <p className="text-sm text-muted-foreground italic text-center">
            Mi meta es que te sientas segura, capaz y, sobre todo, muy emocionada de cocinar.
            ¡Espero que lo disfrutes tanto como yo!
          </p>

            <motion.div className="flex flex-wrap gap-3 pt-1 text-center" variants={fadeInUp} custom={2}>
            <Button size="lg" className="gap-2 shadow-lg font-body min-h-[48px]" asChild>
              <Link to="/clases">
                <Sparkles className="h-4 w-4" />
                Ver Recetas Gratuitas
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 font-body min-h-[48px]" asChild>
              <a href="#sobre">
                Conoce a Gaby
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Image */}
        <motion.div
          className="flex justify-center"
          initial="hidden"
          animate="visible"
          variants={slideInRight}
        >
          <div className="relative">
            <img
              src={gabyImg}
              alt="Gaby Bernal cocinando"
              className="w-full max-w-md rounded-2xl shadow-2xl object-cover"
            />
            {/* Floating badge */}
            <motion.div
              className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-lg p-3 border flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <ChefHat className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">100% Gratis</span>
              <Heart className="h-4 w-4 text-primary fill-primary" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
