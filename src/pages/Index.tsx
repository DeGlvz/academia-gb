import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import DeMiCocinaSection from "@/components/landing/DeMiCocinaSection";
import PaidClassesSection from "@/components/landing/PaidClassesSection";
import CompatibilitySection from "@/components/landing/CompatibilitySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import SearchModal from "@/components/SearchModal";
import SobreGabyModal from "@/components/SobreGabyModal";

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
      <DeMiCocinaSection />
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
