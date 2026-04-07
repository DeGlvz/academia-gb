import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl">Gaby Bernal</span>
          <span className="text-xs text-muted-foreground ml-1">en tu Cocina</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary">Inicio</Link>
          <Link to="/clases" className="text-sm font-medium hover:text-primary">Clases</Link>
          <Link to="/herramientas/calculadora-panadero" className="text-sm font-medium hover:text-primary">Calculadora</Link>
          <a href="#sobre-gaby" className="text-sm font-medium hover:text-primary">Sobre Gaby</a>
          {user && <Link to="/mi-perfil" className="text-sm font-medium hover:text-primary">Mi Perfil</Link>}
        </nav>

        <div className="flex items-center gap-2">
          {!user && (
            <Link to="/auth" className="text-sm font-medium hover:text-primary">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
