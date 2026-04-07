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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface HeaderProps {
  onSearchClick?: () => void;
  onSobreGabyClick?: () => void;
}

const Header = ({ onSearchClick, onSobreGabyClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img src={logo} alt="Gaby Bernal en tu Cocina" className="h-8 sm:h-10 object-contain max-w-[140px] sm:max-w-[180px]" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Inicio
          </Link>

          {/* Submenú Clases */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium text-foreground/70 hover:text-primary bg-transparent">
                  Clases
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-56 p-2 bg-popover rounded-md shadow-lg border">
                    <Link
                      to="/clases"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    >
                      📚 Catálogo de clases
                    </Link>
                    <Link
                      to="/#clases-gratis"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    >
                      🎁 Clases gratis
                    </Link>
                    {user && (
                      <Link
                        to="/mi-perfil"
                        className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                      >
                        📊 Mi progreso
                      </Link>
                    )}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Submenú Herramientas */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium text-foreground/70 hover:text-primary bg-transparent">
                  Herramientas
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-56 p-2 bg-popover rounded-md shadow-lg border">
                    <Link
                      to="/herramientas/calculadora-panadero"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    >
                      🧮 Calculadora Panadera Pro
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Sobre Gaby (Modal) */}
          <button
            onClick={onSobreGabyClick}
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            Sobre Gaby
          </button>
        </nav>

        {/* Right side: Search + Cart + Auth */}
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
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild className="gap-1.5">
              <Link to="/auth"><LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Iniciar sesión</span></Link>
            </Button>
          )}

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t bg-background px-4 py-4 space-y-3 animate-fade-in">
          <Link to="/" className="block text-base font-medium" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
          <Link to="/clases" className="block text-base font-medium" onClick={() => setIsMenuOpen(false)}>📚 Catálogo de clases</Link>
          <Link to="/#clases-gratis" className="block text-base font-medium" onClick={() => setIsMenuOpen(false)}>🎁 Clases gratis</Link>
          {user && (
            <Link to="/mi-perfil" className="block text-base font-medium" onClick={() => setIsMenuOpen(false)}>📊 Mi progreso</Link>
          )}
          <Link to="/herramientas/calculadora-panadero" className="block text-base font-medium" onClick={() => setIsMenuOpen(false)}>🧮 Calculadora Panadera Pro</Link>
          <button onClick={() => { onSobreGabyClick?.(); setIsMenuOpen(false); }} className="block text-base font-medium">Sobre Gaby</button>
          {!user && (
            <Link to="/auth" className="block text-base font-medium text-primary" onClick={() => setIsMenuOpen(false)}>Iniciar sesión</Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
