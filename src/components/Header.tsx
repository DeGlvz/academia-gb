import { useState } from "react";
import { Menu, X, User, Shield, LogOut, LogIn, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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

interface HeaderProps {
  onSearchClick?: () => void;
  onSobreGabyClick?: () => void;
}

const Header = ({ onSearchClick, onSobreGabyClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img src={logo} alt="Gaby Bernal en tu Cocina" className="h-8 sm:h-10 object-contain" />
          </Link>

          {/* Desktop Navigation - SIMPLIFICADO */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link to="/" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50">
              Inicio
            </Link>

            {/* Dropdown Clases */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-3 py-2 text-sm font-medium h-auto gap-1">
                  Clases <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/clases">📚 Catálogo de clases</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/recetas-gratis">🎁 Clases gratis</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/basicos">📖 Básicos de Thermomix</Link>
                </DropdownMenuItem>
                {user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/#de-mi-cocina">👩‍🍳 De mi cocina a tu cocina</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/mi-perfil">📊 Mi progreso</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dropdown Herramientas */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-3 py-2 text-sm font-medium h-auto gap-1">
                  Herramientas <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/herramientas/calculadora-panadero">🧮 Calculadora Panadera Pro</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/tienda" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50">
              Tienda
            </Link>

            <button
              onClick={onSobreGabyClick}
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50"
            >
              Sobre Gaby
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={onSearchClick} className="rounded-full h-9 w-9">
              <Search className="h-5 w-5" />
            </Button>

            <CartDrawer />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-9 w-9 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.user_metadata?.full_name || "Usuario"}</p>
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
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className="gap-1.5 h-9">
                <Link to="/auth"><LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Iniciar sesión</span></Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          <Link to="/" className="block text-base py-2" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
          
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground px-2">Clases</p>
            <Link to="/clases" className="block text-base pl-3 py-2" onClick={() => setIsMenuOpen(false)}>📚 Catálogo de clases</Link>
            <Link to="/recetas-gratis" className="block text-base pl-3 py-2" onClick={() => setIsMenuOpen(false)}>🎁 Clases gratis</Link>
            <Link to="/basicos" className="block text-base pl-3 py-2" onClick={() => setIsMenuOpen(false)}>📖 Básicos de Thermomix</Link>
            {user && (
              <>
                <Link to="/#de-mi-cocina" className="block text-base pl-3 py-2" onClick={() => setIsMenuOpen(false)}>👩‍🍳 De mi cocina a tu cocina</Link>
                <Link to="/mi-perfil" className="block text-base pl-3 py-2" onClick={() => setIsMenuOpen(false)}>📊 Mi progreso</Link>
              </>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground px-2">Herramientas</p>
            <Link to="/herramientas/calculadora-panadero" className="block text-base pl-3 py-2" onClick={() => setIsMenuOpen(false)}>🧮 Calculadora Panadera Pro</Link>
          </div>

          <Link to="/tienda" className="block text-base py-2" onClick={() => setIsMenuOpen(false)}>Tienda</Link>
          
          <button onClick={() => { onSobreGabyClick?.(); setIsMenuOpen(false); }} className="block text-base py-2 w-full text-left">
            Sobre Gaby
          </button>
          
          {!user && (
            <Link to="/auth" className="block text-base text-primary py-2" onClick={() => setIsMenuOpen(false)}>
              Iniciar sesión
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
