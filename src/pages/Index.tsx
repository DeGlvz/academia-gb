import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FreeContentSection from "@/components/landing/FreeContentSection";
import PaidClassesSection from "@/components/landing/PaidClassesSection";
import CompatibilitySection from "@/components/landing/CompatibilitySection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <FreeContentSection />
      <PaidClassesSection />
      <CompatibilitySection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Index;
