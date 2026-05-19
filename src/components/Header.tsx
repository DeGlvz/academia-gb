import { useState, useEffect } from "react";
import { Menu, X, User, Shield, LogOut, LogIn, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo-gaby-bernal.png";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  onSearchClick?: () => void;
  onSobreGabyClick?: () => void;
}

const Header = ({ onSearchClick, onSobreGabyClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  // Cerrar sesión
  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0" onClick={() => setIsMenuOpen(false)}>
          <img src={logo} alt="Gaby Bernal en tu Cocina" className="h-8 sm:h-10 object-contain max-w-[140px] sm:max-w-[180px]" />
        </Link>

        {/* Botón de menú hamburguesa (visible siempre) */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <img src={logo} alt="Gaby Bernal" className="h-8 object-contain" />
                <span className="text-sm font-normal text-muted-foreground">Menú</span>
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col h-full">
              <nav className="flex-1 py-4 px-2 space-y-1">
                {/* Inicio */}
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🏠 Inicio
                </Link>

                {/* Catálogo de clases */}
                <Link
                  to="/clases"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📚 Catálogo de clases
                </Link>

                {/* Clases gratis */}
                <Link
                  to="/recetas-gratis"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🎁 Clases gratis
                </Link>

                {/* Básicos de Thermomix (blog) */}
                <Link
                  to="/basicos"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  📖 Básicos de Thermomix
                </Link>

                {/* Tienda */}
                <Link
                  to="/tienda"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🛒 Tienda
                </Link>

                {/* Calculadora */}
                <Link
                  to="/herramientas/calculadora-panadero"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🧮 Calculadora Panadera Pro
                </Link>

                {/* Separador si está logueado */}
                {user && <div className="h-px bg-border my-2" />}

                {/* Mi progreso (solo logueado) */}
                {user && (
                  <Link
                    to="/mi-perfil"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📊 Mi progreso
                  </Link>
                )}

                {/* De mi cocina a tu cocina (solo logueado) */}
                {user && (
                  <Link
                    to="/#de-mi-cocina"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👩‍🍳 De mi cocina a tu cocina
                  </Link>
                )}

                {/* Separador */}
                <div className="h-px bg-border my-2" />

                {/* Sobre Gaby (modal) */}
                <button
                  onClick={() => {
                    onSobreGabyClick?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors text-left"
                >
                  👤 Sobre Gaby
                </button>
              </nav>

              {/* Footer del menú móvil */}
              <div className="p-4 border-t space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || user.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        Panel Admin
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Acciones derecha: Búsqueda, Carrito, Avatar */}
        <div className="flex items-center gap-2">
          {/* Botón búsqueda */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            className="rounded-full"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </Button>

          <CartDrawer />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground truncate">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/mi-perfil"><User className="h-4 w-4 mr-2" /> Mi perfil</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin"><Shield className="h-4 w-4 mr-2" /> Panel Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild className="gap-1.5">
              <Link to="/auth"><LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Iniciar sesión</span></Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
