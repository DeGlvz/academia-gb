import { useState } from "react";
import { Menu, X, User, Shield, LogOut, LogIn } from "lucide-react";
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

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Clases", href: "/clases" },
    { label: "Calculadora", href: "/herramientas/calculadora-panadero" },
    { label: "Sobre Gaby", href: "#sobre" },
  ];

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Gaby Bernal en tu Cocina" className="h-8 sm:h-10 object-contain max-w-[140px] sm:max-w-[180px]" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) =>
            item.href.startsWith("/") ? (
              <Link key={item.label} to={item.href} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">{item.label}</Link>
            ) : (
              <a key={item.label} href={item.href} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">{item.label}</a>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
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

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden border-t bg-background px-4 py-4 space-y-3 animate-fade-in">
          {navItems.map((item) =>
            item.href.startsWith("/") ? (
              <Link key={item.label} to={item.href} className="block text-base font-medium text-foreground/80 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>{item.label}</Link>
            ) : (
              <a key={item.label} href={item.href} className="block text-base font-medium text-foreground/80 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>{item.label}</a>
            )
          )}
          {!user && (
            <Link to="/auth" className="block text-base font-medium text-primary" onClick={() => setIsMenuOpen(false)}>
              Iniciar sesión
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;