import { useState, useEffect } from "react";
import { Heart, ChefHat, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import gabyImg from "@/assets/gaby-bernal.jpg";
import { fadeInUp, slideInLeft, slideInRight } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";

interface HeroConfig {
  badge: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaPrimaryUrl: string;
  ctaSecondary: string;
  ctaSecondaryUrl: string;
}

const HeroSection = () => {
  const [config, setConfig] = useState<HeroConfig>({
    badge: "🍳 Academia Online",
    title: "Cocina con Gaby Bernal en tu cocina",
    subtitle: "Domina tu Thermomix con clases exclusivas, recetas paso a paso y herramientas profesionales diseñadas para ti.",
    ctaPrimary: "Ver Clases",
    ctaPrimaryUrl: "/clases",
    ctaSecondary: "Conoce más",
    ctaSecondaryUrl: "/sobre-gaby",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from("site_config")
          .select("*")
          .eq("id", 1)
          .single();
        
        if (error) throw error;
        if (data) {
          setConfig({
            badge: data.hero_badge || config.badge,
            title: data.hero_title || config.title,
            subtitle: data.hero_subtitle || config.subtitle,
            ctaPrimary: data.hero_cta_primary || config.ctaPrimary,
            ctaPrimaryUrl: data.hero_cta_primary_url || config.ctaPrimaryUrl,
            ctaSecondary: data.hero_cta_secondary || config.ctaSecondary,
            ctaSecondaryUrl: data.hero_cta_secondary_url || config.ctaSecondaryUrl,
          });
        }
      } catch (error) {
        console.error("Error loading hero config:", error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  if (loading) {
    return (
      <section className="relative overflow-hidden">
        <div className="container px-4 py-20 text-center">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      </section>
    );
  }

  return (
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
              <Heart className="h-3 w-3 fill-primary" /> {config.badge}
            </motion.span>

            <h1 className="text-3xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.15] text-foreground sm:text-3xl">
              {config.title}
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed text-justify">
              {config.subtitle}
            </p>

            <motion.div className="flex flex-wrap gap-3 pt-1 text-center" variants={fadeInUp} custom={2}>
              <Button size="lg" className="gap-2 shadow-lg font-body min-h-[48px]" asChild>
               
