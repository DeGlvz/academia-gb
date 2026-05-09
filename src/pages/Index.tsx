import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import DeMiCocinaSection from "@/components/landing/DeMiCocinaSection";
import PaidClassesSection from "@/components/landing/PaidClassesSection";
import CompatibilitySection from "@/components/landing/CompatibilitySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import SobreGabyModal from "@/components/SobreGabyModal";

const Index = () => {
  const [sobreGabyModalOpen, setSobreGabyModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSobreGabyClick={() => setSobreGabyModalOpen(true)} />
      <HeroSection />
      <DeMiCocinaSection 
        onConoceGabyClick={() => setSobreGabyModalOpen(true)}
      />
      <PaidClassesSection />
      <CompatibilitySection />
      <TestimonialsSection />
      <Footer />
      
      <SobreGabyModal open={sobreGabyModalOpen} onOpenChange={setSobreGabyModalOpen} />
    </div>
  );
};

export default Index;
