import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, Calculator, Award, ChevronRight, CheckCircle, User,
  Menu, X, LayoutDashboard, LogOut, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileEditor from "@/components/ProfileEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: enrolledClasses = [] } = useQuery({
    queryKey: ["enrolled-classes", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("enrolled_classes")
        .select("*, classes(*)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: blogProgress = [] } = useQuery({
    queryKey: ["blog-progress", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_progress")
        .select("*")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Alumna";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
  
  const totalLessons = 0;
  const completedLessons = 0;
  const overallProgress = 0;
  
  const readPostIds = new Set(blogProgress.map((bp: any) => bp.post_id));
  const readCount = blogPosts.filter((post: any) => readPostIds.has(post.id)).length;
  const blogProgressPercent = blogPosts.length > 0 ? Math.round((readCount / blogPosts.length) * 100) : 0;
  
  const hasCalculadoraAccess = enrolledClasses.some((ec: any) => ec.classes?.slug === "pan-artesanal-desde-cero");

  const profileData = {
    name: displayName,
    email: user?.email ?? "",
    whatsapp: profile?.whatsapp || "",
    facebook: profile?.facebook || "",
    instagram: profile?.instagram || "",
    tiktok: profile?.tiktok || "",
    website: profile?.website || "",
    thermomixModels: profile?.thermomix_models ?? [],
    foodPreferences: profile?.food_preferences ?? [],
    registeredAt: profile?.created_at?.split("T")[0] ?? "",
    avatar: profile?.avatar_url ?? null,
  };

  const menuItems = [
    { id: "perfil", label: "Mi perfil", icon: User },
    { id: "clases", label: "Mis clases", icon: BookOpen, count: enrolledClasses.length },
    { id: "blog", label: "Mi blog", icon: BookOpen, count: readCount },
    { id: "progreso", label: "Mi progreso", icon: Clock },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 flex">
        {/* Sidebar - colapsable en móvil */}
        <>
          {/* Overlay para móvil */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Botón para abrir sidebar en móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-6 left-6 z-50 rounded-full shadow-lg bg-primary text-primary-foreground md:hidden h-12 w-12"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar-background border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header del sidebar */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Menú de navegación */}
              <nav className="flex-1 py-4 space-y-1 px-3">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      activeTab === item.id
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Botón de cerrar sesión */}
              <div className="p-3 border-t">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </aside>
        </>

        {/* Contenido principal */}
        <main className="flex-1 overflow-auto">
          <div className="w-full px-4 py-6 md:py-8">
            <div className="w-full max-w-4xl mx-auto">
              {/* Perfil */}
              {activeTab === "perfil" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">{displayName}</h1>
                      <p className="text-sm text-muted-foreground">Miembro desde {profileData.registeredAt}</p>
                    </div>
                  </div>
                  <ProfileEditor profile={profileData} />
                </motion.div>
              )}

              {/* Mis clases */}
              {activeTab === "clases" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">Mis clases</h1>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/clases">Ver catálogo</Link>
                    </Button>
                  </div>

                  {enrolledClasses.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Aún no tienes clases adquiridas.</p>
                        <Button className="mt-4" asChild>
                          <Link to="/clases">Explorar clases</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {enrolledClasses.map((ec: any) => (
                        <Card key={ec.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex gap-4">
                            {ec.classes?.image_url && (
                              <img src={ec.classes.image_url} alt={ec.classes.title} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="text-sm font-semibold text-foreground truncate">{ec.classes?.title}</p>
                              <p className="text-xs text-muted-foreground">{ec.classes?.category}</p>
                              <p className="text-xs text-primary">{formatCurrency(ec.classes?.price)}</p>
                              <Button size="sm" variant="outline" className="mt-2 text-xs" asChild>
                                <Link to={`/clases/${ec.classes?.slug}`}>Ver clase</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Mi blog */}
              {activeTab === "blog" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">Mi blog</h1>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/basicos">Ver todos</Link>
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progreso de lectura</span>
                        <span className="text-sm font-bold text-primary">{blogProgressPercent}%</span>
                      </div>
                      <Progress value={blogProgressPercent} className="h-2" />
                      <p className="text-xs text-muted-foreground">{readCount} de {blogPosts.length} artículos leídos</p>
                    </CardContent>
                  </Card>

                  {blogPosts.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Próximamente más artículos.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {blogPosts.map((post: any) => {
                        const isRead = readPostIds.has(post.id);
                        return (
                          <Card key={post.id} className={`hover:shadow-md transition-shadow ${isRead ? "border-green-200 bg-green-50/30" : ""}`}>
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {isRead ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                                  )}
                                  <p className={`text-sm font-medium ${isRead ? "text-muted-foreground" : "text-foreground"}`}>
                                    {post.title}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 ml-6">
                                  {new Date(post.created_at).toLocaleDateString("es-MX")} · {post.read_time || 5} min lectura
                                </p>
                              </div>
                              <Button size="sm" variant="ghost" asChild>
                                <Link to={`/blog/${post.slug}`}>
                                  {isRead ? "Leer otra vez" : "Leer artículo"}
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Mi progreso */}
              {activeTab === "progreso" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">Mi progreso</h1>
                  
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progreso general de clases</span>
                          <span className="text-sm font-bold text-primary">{overallProgress}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">{completedLessons} de {totalLessons} lecciones completadas</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progreso del blog</span>
                          <span className="text-sm font-bold text-primary">{blogProgressPercent}%</span>
                        </div>
                        <Progress value={blogProgressPercent} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">{readCount} de {blogPosts.length} artículos leídos</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-sm font-semibold mb-3">Mis herramientas</h3>
                      <div className={`p-4 rounded-lg border ${hasCalculadoraAccess ? "bg-primary/5 border-primary/20" : "opacity-60 bg-muted/30"}`}>
                        <div className="flex items-start gap-3">
                          <Calculator className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold">Calculadora Panadero Pro</h4>
                            <p className="text-xs text-muted-foreground mt-1">Calcula porcentajes exactos para tus recetas de pan.</p>
                            {hasCalculadoraAccess ? (
                              <Button size="sm" className="mt-3" asChild>
                                <Link to="/herramientas/calculadora-panadero">Usar calculadora</Link>
                              </Button>
                            ) : (
                              <p className="text-xs text-destructive mt-2">Requiere la clase "Pan Artesanal desde Cero"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
