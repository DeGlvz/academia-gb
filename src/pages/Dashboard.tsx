import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, Calculator, Award, ChevronRight, CheckCircle, User,
  FileText, Circle, Gift, Settings, Home, TrendingUp, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileEditor from "@/components/ProfileEditor";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inicio");

  // Fetch profile
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

  // Fetch ALL enrolled classes (para luego separar)
  const { data: allEnrolled = [] } = useQuery({
    queryKey: ["all-enrolled", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("enrolled_classes")
        .select("*, classes(*)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Separar clases pagas y gratis
  const enrolledClasses = allEnrolled.filter((ec: any) => ec.classes?.price > 0);
  const freeClasses = allEnrolled.filter((ec: any) => ec.classes?.price === 0);

  // Fetch todas las lecciones de las clases del usuario
  const { data: allLessons = [] } = useQuery({
    queryKey: ["all-lessons", user?.id, allEnrolled.length],
    queryFn: async () => {
      if (allEnrolled.length === 0) return [];
      
      const classIds = allEnrolled.map((ec: any) => ec.class_id);
      
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .in("class_id", classIds);
      
      return data ?? [];
    },
    enabled: !!user && allEnrolled.length > 0,
  });

  // Fetch progreso de lecciones del usuario
  const { data: lessonProgress = [] } = useQuery({
    queryKey: ["lesson-progress", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Calcular progreso general de lecciones (global)
  const totalLessons = allLessons.length;
  const completedLessonsIds = new Set(
    lessonProgress
      .filter((lp: any) => lp.completed === true)
      .map((lp: any) => lp.lesson_id)
  );
  const completedLessons = Array.from(completedLessonsIds).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Fetch blog posts y progress
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
  
  // Calcular progreso de lecturas
  const readPostIds = new Set(blogProgress.map((bp: any) => bp.post_id));
  const readCount = blogPosts.filter((post: any) => readPostIds.has(post.id)).length;
  const blogProgressPercent = blogPosts.length > 0 ? Math.round((readCount / blogPosts.length) * 100) : 0;
  
  const hasCalculadoraAccess = enrolledClasses.some((ec: any) => ec.classes?.slug === "pan-artesanal-desde-cero");

  const profileData = {
    name: displayName,
    email: user?.email ?? "",
    whatsapp: profile?.whatsapp || "",
    facebook: profile?.facebook || "",
    thermomixModel: (profile?.thermomix_model ?? "TM6") as "TM31" | "TM5" | "TM6" | "TM7",
    foodPreferences: (profile?.food_preferences ?? []) as any[],
    registeredAt: profile?.created_at?.split("T")[0] ?? "",
    avatar: profile?.avatar_url ?? null,
  };

  // Stats cards para el inicio
  const statsCards = [
    { icon: <BookOpen className="h-5 w-5 text-primary" />, value: enrolledClasses.length, label: "Clases pagas", color: "bg-blue-50" },
    { icon: <Gift className="h-5 w-5 text-primary" />, value: freeClasses.length, label: "Clases gratis", color: "bg-green-50" },
    { icon: <FileText className="h-5 w-5 text-primary" />, value: readCount, label: "Artículos leídos", color: "bg-purple-50" },
    { icon: <TrendingUp className="h-5 w-5 text-primary" />, value: `${overallProgress}%`, label: "Progreso total", color: "bg-orange-50" },
  ];

  // Últimas actividades (simuladas con datos reales)
  const recentActivities = [
    ...enrolledClasses.slice(0, 2).map((ec: any) => ({
      type: "clase",
      title: ec.classes?.title,
      date: ec.created_at,
      icon: <BookOpen className="h-4 w-4" />,
    })),
    ...freeClasses.slice(0, 1).map((ec: any) => ({
      type: "gratis",
      title: ec.classes?.title,
      date: ec.created_at,
      icon: <Gift className="h-4 w-4" />,
    })),
    ...blogProgress.slice(0, 1).map((bp: any) => {
      const post = blogPosts.find((p: any) => p.id === bp.post_id);
      return {
        type: "lectura",
        title: post?.title,
        date: bp.read_at,
        icon: <FileText className="h-4 w-4" />,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container px-4 py-8 max-w-5xl space-y-8">
        {/* Header con avatar y saludo */}
        <motion.div className="flex flex-col sm:flex-row items-start sm:items-center gap-5" initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border-2 border-primary/30">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-9 w-9 text-primary" />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">¡Hola, {displayName.split(" ")[0]}!</h1>
            <p className="text-sm text-muted-foreground">{user?.email} · {profileData.thermomixModel} · Miembro desde {profileData.registeredAt}</p>
          </div>
        </motion.div>

        {/* TABS: Inicio | Mis clases | Clases gratis | Mi rincón de lectura | Mi perfil */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="inicio" className="gap-2">
              <Home className="h-4 w-4" />
              Inicio
            </TabsTrigger>
            <TabsTrigger value="clases" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Mis clases
            </TabsTrigger>
            <TabsTrigger value="gratis" className="gap-2">
              <Gift className="h-4 w-4" />
              Clases gratis
            </TabsTrigger>
            <TabsTrigger value="lecturas" className="gap-2">
              <FileText className="h-4 w-4" />
              Mi rincón de lectura
            </TabsTrigger>
            <TabsTrigger value="perfil" className="gap-2">
              <Settings className="h-4 w-4" />
              Mi perfil
            </TabsTrigger>
          </TabsList>

          {/* ==================== TAB 1: INICIO ==================== */}
          <TabsContent value="inicio" className="space-y-6">
            {/* Stats Cards */}
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={staggerContainer} initial="hidden" animate="visible">
              {statsCards.map((stat) => (
                <motion.div key={stat.label} variants={staggerItem}>
                  <Card className={`${stat.color} hover:shadow-md transition-shadow`}>
                    <CardContent className="pt-5 pb-4 flex flex-col items-center text-center gap-2">
                      {stat.icon}
                      <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                      <span className="text-xs text-muted-foreground leading-tight">{stat.label}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Progreso Global */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-base font-semibold text-foreground">Tu progreso global</h2>
                  </div>
                  <span className="text-sm font-bold text-primary">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {completedLessons} de {totalLessons} lecciones completadas 
                  {totalLessons === 0 && " (Comienza una clase para ver tu progreso)"}
                </p>
              </CardContent>
            </Card>

            {/* Actividades Recientes */}
            {recentActivities.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-base font-semibold text-foreground">Tu actividad reciente</h2>
                  </div>
                  <div className="space-y-3">
                    {recentActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString("es-MX")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mensaje si no hay actividad */}
            {recentActivities.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aún no hay actividad reciente.</p>
                  <Button className="mt-4 font-body" asChild>
                    <Link to="/clases">Explorar clases</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ==================== TAB 2: MIS CLASES (pagas) ==================== */}
          <TabsContent value="clases" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">Mis clases adquiridas</h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 font-body text-xs">
                <Link to="/clases">Ver catálogo <ChevronRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>

            {enrolledClasses.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Aún no tienes clases adquiridas.</p><Button className="mt-4 font-body" asChild><Link to="/clases">Explorar clases</Link></Button></CardContent></Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {enrolledClasses.map((ec: any) => {
                  const classLessons = allLessons.filter((lesson: any) => lesson.class_id === ec.class_id);
                  const classCompleted = classLessons.filter((lesson: any) => completedLessonsIds.has(lesson.id)).length;
                  const classProgress = classLessons.length > 0 ? Math.round((classCompleted / classLessons.length) * 100) : 0;
                  
                  return (
                    <Card key={ec.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex gap-4">
                        {ec.classes?.image_url && (
                          <img src={ec.classes.image_url} alt={ec.classes.title} className="h-20 w-20 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-foreground truncate">{ec.classes?.title}</p>
                          <p className="text-xs text-muted-foreground">{ec.classes?.category}</p>
                          {classLessons.length > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Progreso</span>
                                <span className="text-primary font-medium">{classProgress}%</span>
                              </div>
                              <Progress value={classProgress} className="h-1.5 mt-1" />
                            </div>
                          )}
                          <Button size="sm" variant="outline" className="mt-2 text-xs gap-1" asChild>
                            <Link to={`/clases/${ec.classes?.slug}`}>Ver clase <ChevronRight className="h-3 w-3" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ==================== TAB 3: CLASES GRATIS ==================== */}
          <TabsContent value="gratis" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">Clases gratis</h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 font-body text-xs">
                <Link to="/#clases-gratis">Ver más gratis <ChevronRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>

            {freeClasses.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Aún no has agregado clases gratis.</p><Button className="mt-4 font-body" asChild><Link to="/#clases-gratis">Explorar clases gratis</Link></Button></CardContent></Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {freeClasses.map((ec: any) => {
                  const classLessons = allLessons.filter((lesson: any) => lesson.class_id === ec.class_id);
                  const classCompleted = classLessons.filter((lesson: any) => completedLessonsIds.has(lesson.id)).length;
                  const classProgress = classLessons.length > 0 ? Math.round((classCompleted / classLessons.length) * 100) : 0;
                  
                  return (
                    <Card key={ec.id} className="hover:shadow-md transition-shadow border-primary/20 bg-primary/5">
                      <CardContent className="p-4 flex gap-4">
                        {ec.classes?.image_url && (
                          <img src={ec.classes.image_url} alt={ec.classes.title} className="h-20 w-20 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <Gift className="h-3.5 w-3.5 text-primary" />
                            <p className="text-sm font-semibold text-foreground truncate">{ec.classes?.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{ec.classes?.category}</p>
                          {classLessons.length > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Progreso</span>
                                <span className="text-primary font-medium">{classProgress}%</span>
                              </div>
                              <Progress value={classProgress} className="h-1.5 mt-1" />
                            </div>
                          )}
                          <Button size="sm" variant="outline" className="mt-2 text-xs gap-1" asChild>
                            <Link to={`/clases/${ec.classes?.slug}`}>Ver clase <ChevronRight className="h-3 w-3" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ==================== TAB 4: MI RINCÓN DE LECTURA ==================== */}
          <TabsContent value="lecturas" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">Mi rincón de lectura</h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 font-body text-xs">
                <Link to="/basicos">Ver todos los artículos <ChevronRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Progreso de lectura</h2>
                  <span className="text-sm font-bold text-primary">{blogProgressPercent}%</span>
                </div>
                <Progress value={blogProgressPercent} className="h-3" />
                <p className="text-xs text-muted-foreground">{readCount} de {blogPosts.length} artículos leídos</p>
              </CardContent>
            </Card>

            {blogPosts.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Próximamente más artículos.</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {blogPosts.map((post: any) => {
                  const isRead = readPostIds.has(post.id);
                  return (
                    <Card key={post.id} className={`hover:shadow-md transition-shadow ${isRead ? "border-green-200 bg-green-50/30" : ""}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isRead ? (
                              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <p className={`text-sm font-medium truncate ${isRead ? "text-muted-foreground" : "text-foreground"}`}>
                              {post.title}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ml-6">
                            {new Date(post.created_at).toLocaleDateString("es-MX")} · {post.read_time || 5} min lectura
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" asChild className="shrink-0">
                          <Link to={`/blog/${post.slug}`}>
                            {isRead ? "Leer otra vez" : "Comenzar a leer"}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ==================== TAB 5: MI PERFIL ==================== */}
          <TabsContent value="perfil" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">Mi perfil</h2>
            </div>
            <ProfileEditor profile={profileData} />
          </TabsContent>
        </Tabs>

        {/* Herramientas */}
        <motion.section className="space-y-4" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
          <h2 className="text-xl font-display font-bold text-foreground">Mis herramientas</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <motion.div variants={staggerItem}>
              <Card className={`transition-all ${hasCalculadoraAccess ? "hover:shadow-md" : "opacity-60"}`}>
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Calculator className="h-5 w-5 text-primary" /></div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">Calculadora Panadero Pro</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Calcula porcentajes exactos para tus recetas de pan.</p>
                    {hasCalculadoraAccess ? (
                      <Button size="sm" variant="outline" className="mt-2 gap-1 font-body text-xs" asChild><Link to="/herramientas/calculadora-panadero"><Calculator className="h-3.5 w-3.5" /> Abrir</Link></Button>
                    ) : (
                      <p className="text-xs text-destructive mt-1">Requiere clase "Pan Artesanal desde Cero"</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={staggerItem}>
              <Card className="opacity-50 border-dashed"><CardContent className="pt-6 flex items-center justify-center h-full min-h-[120px]"><p className="text-sm text-muted-foreground text-center">Más herramientas próximamente…</p></CardContent></Card>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
