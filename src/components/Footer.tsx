import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-secondary border-t py-10">
    <div className="container px-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-xl font-display font-bold text-primary mb-3">
            Gaby Bernal en tu Cocina
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-bold">
            Academia de cocina online para amantes de la Thermomix.
            Aprende recetas únicas desde la comodidad de tu hogar.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Enlaces</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/clases" className="hover:text-primary transition-colors">Clases</Link></li>
            <li><Link to="/herramientas/calculadora-panadero" className="hover:text-primary transition-colors">Herramientas</Link></li>
            <li><Link to="/mi-perfil" className="hover:text-primary transition-colors">Mi perfil</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Contacto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href="https://wa.me/5215559663086"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                WhatsApp: 55 5966 3086
              </a>
            </li>
            <li>
              <a href="https://gabybernal.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                gabybernal.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
        Hecho con <Heart className="h-3 w-3 text-primary fill-primary" /> por Gaby Bernal © {new Date().getFullYear()}
      </div>
    </div>
  </footer>
);

export default Footer;
