import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FreeContentSection from "@/components/landing/FreeContentSection";
import PaidClassesSection from "@/components/landing/PaidClassesSection";
import CompatibilitySection from "@/components/landing/CompatibilitySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";

const Index = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["public-materials"] });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <FreeContentSection />
      <PaidClassesSection />
      <CompatibilitySection />
      <TestimonialsSection />

      {/* NUEVA SECCIÓN "SOBRE GABY" */}
      <section id="sobre-gaby" className="py-16 bg-muted/30">
        <div className="container px-4 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">Sobre Gaby Bernal</h2>
          <p className="text-muted-foreground leading-relaxed">
            Gaby es una apasionada de la cocina y experta en Thermomix. Con más de 10 años de experiencia,
            comparte sus recetas y trucos para que cocinar sea un placer. Su misión es ayudar a las personas
            a disfrutar de la cocina casera, saludable y deliciosa, aprovechando al máximo su Thermomix.
          </p>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
