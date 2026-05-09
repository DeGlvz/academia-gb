import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Instagram, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Botón flotante para subir */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          aria-label="Subir arriba"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      <footer className="bg-muted/30 border-t mt-auto">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo y descripción */}
            <div className="space-y-3">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Gaby Bernal en tu Cocina
              </h3>
              <p className="text-sm text-muted-foreground">
                Clases y recetas para Thermomix. Aprende a cocinar con Gaby desde la comodidad de tu hogar.
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Enlaces</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/clases" className="text-muted-foreground hover:text-primary transition-colors">
                    Catálogo de clases
                  </Link>
                </li>
                <li>
                  <Link to="/recetas-gratis" className="text-muted-foreground hover:text-primary transition-colors">
                    Recetas gratis
                  </Link>
                </li>
                <li>
                  <Link to="/basicos" className="text-muted-foreground hover:text-primary transition-colors">
                    Básicos de Thermomix
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terminos" className="text-muted-foreground hover:text-primary transition-colors">
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link to="/privacidad" className="text-muted-foreground hover:text-primary transition-colors">
                    Política de privacidad
                  </Link>
                </li>
              </ul>
            </div>

            {/* Redes sociales */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Sígueme</h4>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/gabybernyanza/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
                <a
                  href="https://www.youtube.com/c/CocinaconGabyBernalBreadSweet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
                <a
                  href="https://www.facebook.com/Gaby-Bernal-en-tu-cocina-138024958415879"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Gaby Bernal en tu Cocina. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
