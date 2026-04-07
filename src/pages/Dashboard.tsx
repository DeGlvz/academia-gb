import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, Calculator, Award, ChevronRight, CheckCircle, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileEditor from "@/components/ProfileEditor";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();

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

  // Fetch enrolled classes
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

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Alumna";
  const totalLessons = 0;
  const completedLessons = 0;
  const overallProgress = 0;
  const hasCalculadoraAccess = enrolledClasses.some((ec: any) => ec.classes?.slug === "pan-artesanal-desde-cero");

  const profileData = {
    name: displayName,
    email: user?.email ?? "",
    whatsapp: "",
    facebook: "",
    thermomixModel: (profile?.thermomix_model ?? "TM6") as "TM31" | "TM5" | "TM6" | "TM7",
    foodPreferences: (profile?.food_preferences ?? []) as any[],
    registeredAt: profile?.created_at?.split("T")[0] ?? "",
    avatar: profile?.avatar_url ?? null,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container px-4 py-8 max-w-5xl space-y-8">
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

        <ProfileEditor profile={profileData} />

        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial="hidden" animate="visible" variants={staggerContainer}>
          {[
            { icon: <BookOpen className="h-5 w-5 text-primary" />, value: enrolledClasses.length, label: "Clases adquiridas" },
            { icon: <CheckCircle className="h-5 w-5 text-primary" />, value: completedLessons, label: "Lecciones completadas" },
            { icon: <Clock className="h-5 w-5 text-primary" />, value: totalLessons - completedLessons, label: "Lecciones pendientes" },
            { icon: <Award className="h-5 w-5 text-primary" />, value: `${overallProgress}%`, label: "Progreso general" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={staggerItem}>
              <Card><CardContent className="pt-5 pb-4 flex flex-col items-center text-center gap-2">{stat.icon}<span className="text-2xl font-bold text-foreground">{stat.value}</span><span className="text-xs text-muted-foreground leading-tight">{stat.label}</span></CardContent></Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} custom={1}>
          <Card><CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between"><h2 className="text-base font-semibold text-foreground">Progreso general</h2><span className="text-sm font-bold text-primary">{overallProgress}%</span></div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">{completedLessons} de {totalLessons} lecciones completadas</p>
          </CardContent></Card>
        </motion.div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-foreground">Mis clases</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 font-body text-xs"><Link to="/clases">Ver catálogo <ChevronRight className="h-3.5 w-3.5" /></Link></Button>
          </div>
          {enrolledClasses.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Aún no tienes clases adquiridas.</p><Button className="mt-4 font-body" asChild><Link to="/clases">Explorar clases</Link></Button></CardContent></Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {enrolledClasses.map((ec: any) => (
                <Card key={ec.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex gap-4">
                    {ec.classes?.image_url && (
                      <img src={ec.classes.image_url} alt={ec.classes.title} className="h-20 w-20 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground truncate">{ec.classes?.title}</p>
                      <p className="text-xs text-muted-foreground">{ec.classes?.category}</p>
                      <Button size="sm" variant="outline" className="mt-2 text-xs gap-1" asChild>
                        <Link to={`/clases/${ec.classes?.slug}`}>Ver clase <ChevronRight className="h-3 w-3" /></Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

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