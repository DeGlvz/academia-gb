import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Clases from "./pages/Clases.tsx";
import ClaseDetalle from "./pages/ClaseDetalle.tsx";
import NotFound from "./pages/NotFound.tsx";
import CalculadoraPanadero from "./pages/CalculadoraPanadero.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Auth from "./pages/Auth.tsx";
import BlogBasicos from "./pages/BlogBasicos.tsx";
import BlogPostDetalle from "./pages/BlogPostDetalle.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminClases from "./pages/admin/AdminClases.tsx";
import AdminUsuarios from "./pages/admin/AdminUsuarios.tsx";
import AdminContenido from "./pages/admin/AdminContenido.tsx";
import AdminConfiguracion from "./pages/admin/AdminConfiguracion.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import UserProfile from "./pages/admin/UserProfile.tsx";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/clases" element={<Clases />} />
              <Route path="/clases/:slug" element={<ClaseDetalle />} />
              <Route path="/herramientas/calculadora-panadero" element={<CalculadoraPanadero />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/mi-perfil" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* Rutas del blog */}
              <Route path="/basicos" element={<BlogBasicos />} />
              <Route path="/blog/:slug" element={<BlogPostDetalle />} />
              <Route path="/admin/usuarios/:id" element={<ProtectedRoute requireAdmin><UserProfile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="clases" element={<AdminClases />} />
                <Route path="usuarios" element={<AdminUsuarios />} />
                <Route path="contenido" element={<AdminContenido />} />
                <Route path="configuracion" element={<AdminConfiguracion />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
