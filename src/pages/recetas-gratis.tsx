import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeMiCocinaSection from "@/components/landing/DeMiCocinaSection";

const RecetasGratis = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <DeMiCocinaSection 
          isFullPage={true}
          title="Recetas Gratuitas"
          subtitle="Explora todas nuestras recetas gratis. Regístrate para acceder al contenido completo."
        />
      </main>
      <Footer />
    </div>
  );
};

export default RecetasGratis;
