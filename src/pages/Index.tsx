import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import PaidClassesSection from "@/components/landing/PaidClassesSection";
import CompatibilitySection from "@/components/landing/CompatibilitySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import SobreGabyModal from "@/components/SobreGabyModal";
import SearchModal from "@/components/SearchModal";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [sobreGabyModalOpen, setSobreGabyModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onSearchClick={() => setSearchModalOpen(true)}
        onSobreGabyClick={() => setSobreGabyModalOpen(true)}
      />
      <HeroSection />
      
      {/* Sección "De mi cocina a tu cocina" - TODO EL TEXTO INTEGRADO */}
      <section className="py-12 bg-gradient-to-br from-mint-50/50 to-background">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-mint-200/50 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              ¡Bienvenida a mi rincón especial!
            </h2>
            
            {/* TODO EL TEXTO EN UN SOLO BLOQUE */}
            <div className="space-y-3 text-muted-foreground">
              <p>
                En esta sección, <span className="font-medium text-foreground">"De mi cocina a tu cocina"</span>, 
                quiero compartir contigo mis secretos más guardados, esos básicos que no pueden faltar 
                y las recetas que preparo en casa para mi familia.
              </p>
              <p>
                Aquí siempre encontrarás contenido totalmente gratuito: guías de inicio, trucos para cuidar tu Thermomix 
                y recetas que te facilitarán la vida diaria.
              </p>
              <p className="text-foreground font-medium pt-2">
                Mi meta es que te sientas segura, capaz y, sobre todo, muy emocionada de cocinar. 
                ¡Espero que lo disfrutes tanto como yo!
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Button asChild size="lg" className="gap-2">
                <Link to="/recetas-gratis">
                  📚 Ver Recetas Gratuitas
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setSobreGabyModalOpen(true)} 
                className="gap-2"
              >
                👩‍🍳 Conoce a Gaby
              </Button>
            </div>
            
            <div className="mt-6">
              <span className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-50 px-4 py-1.5 rounded-full">
                🎁 100% Gratis
              </span>
            </div>
          </div>
        </div>
      </section>
      
      <PaidClassesSection />
      <CompatibilitySection />
      <TestimonialsSection />
      <Footer />
      
      <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
      <SobreGabyModal open={sobreGabyModalOpen} onOpenChange={setSobreGabyModalOpen} />
    </div>
  );
};

export default Index;
