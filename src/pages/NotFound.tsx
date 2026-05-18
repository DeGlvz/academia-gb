import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Registrar el error en consola
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Redirigir automáticamente después de 5 segundos
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-2">¡Ups! Página no encontrada</p>
          <p className="text-sm text-muted-foreground mb-6">
            La página <strong className="text-foreground">{location.pathname}</strong> no existe.
            Serás redirigido al inicio en unos segundos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" className="gap-2">
              <a href="/">
                <Home className="h-4 w-4" />
                Ir al inicio
              </a>
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Volver atrás
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
