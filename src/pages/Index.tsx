import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RecetasGratis = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Recetas Gratuitas</h1>
          <p className="text-muted-foreground mb-6">
            Explora todas nuestras recetas gratis. Regístrate para acceder al contenido completo.
          </p>
          <Button asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecetasGratis;
