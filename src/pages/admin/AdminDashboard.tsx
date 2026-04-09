import { useState, useEffect } from "react";
import { DollarSign, Users, BookOpen, TrendingUp, Eye, ShoppingCart, Loader2, CalendarCheck, Target, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useClasses } from "@/hooks/useClasses";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface DashboardStats {
  total_revenue: number;
  total_users: number;
  total_classes: number;
  total_sales: number;
  revenue_change: number;
  users_change: number;
  classes_change: number;
  sales_change: number;
}

interface CrmSummary {
  total_notes: number;
  pending_notes: number;
  completed_notes: number;
  upcoming_followups: number;
}

interface UpcomingFollowup {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  note: string;
  next_action_date: string;
  next_action: string;
  potential_level: string;
}

interface HighPotentialUser {
  user_id: string;
  user_name: string;
  user_email: string;
  total_spent: number;
  enrolled_count: number;
  lesson_progress: number;
  potential_level: string;
  last_note_date: string;
}

interface RecentNote {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  note: string;
  potential_level: string;
  next_action: string;
  created_at: string;
}

interface PopularClass {
  id: string;
  title: string;
  image_url: string;
  price: number;
  sales: number;
}

const AdminDashboard = () => {
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const [stats, setStats] = useState<DashboardStats>({
    total_revenue: 0,
    total_users: 0,
    total_classes: 0,
    total_sales: 0,
    revenue_change: 0,
    users_change: 0,
    classes_change: 0,
    sales_change: 0,
  });
  const [crmSummary, setCrmSummary] = useState<CrmSummary | null>(null);
  const [upcomingFollowups, setUpcomingFollowups] = useState<UpcomingFollowup[]>([]);
  const [highPotentialUsers, setHighPotentialUsers] = useState<HighPotentialUser[]>([]);
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [popularClasses, setPopularClasses] = useState<PopularClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Obtener usuarios (profiles)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      if (profilesError) throw profilesError;
      const totalUsers = profiles?.length || 0;

      // 2. Obtener clases inscritas para calcular ingresos y ventas
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrolled_classes")
        .select("*, classes(*)");
      if (enrollError) throw enrollError;

      const totalSales = enrollments?.length || 0;
      const totalRevenue = enrollments?.reduce((sum, e) => sum + (e.classes?.price || 0), 0) || 0;

      // 3. Obtener clases populares (más vendidas)
      const classSalesMap = new Map<string, number>();
      enrollments?.forEach(e => {
        const classId = e.class_id;
        classSalesMap.set(classId, (classSalesMap.get(classId) || 0) + 1);
      });

      const popularWithSales = classes
        .map(c => ({
          id: c.id,
          title: c.title,
          image_url: c.image_url,
          price: c.price,
          sales: classSalesMap.get(c.id) || 0,
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setPopularClasses(popularWithSales);

      // 4. Calcular cambios (simplificado - comparar con mes anterior)
      // Por ahora usamos valores mock para cambios, luego se puede mejorar
      setStats({
        total_revenue: totalRevenue,
        total_users: totalUsers,
        total_classes: classes.length,
        total_sales: totalSales,
        revenue_change: 12.5,
        users_change: 8.2,
        classes_change: classes.length > 0 ? 5 : 0,
        sales_change: totalSales > 0 ? 15 : 0,
      });

      // 5. CRM: Obtener notas
      const { data: allNotes, error: notesError } = await supabase
        .from("crm_notes")
        .select("*");
      if (notesError) throw notesError;

      const total = allNotes?.length || 0;
      const pending = allNotes?.filter(n => n.status === "pendiente").length || 0;
      const completed = allNotes?.filter(n => n.status === "completada").length || 0;
      const today = new Date().toISOString().split("T")[0];
      const upcoming = allNotes?.filter(n => n.next_action_date && n.next_action_date >= today && n.status === "pendiente").length || 0;

      setCrmSummary({ total_notes: total, pending_notes: pending, completed_notes: completed, upcoming_followups: upcoming });

      // 6. Próximos seguimientos (próximos 7 días)
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      const sevenDaysLaterStr = sevenDaysLater.toISOString().split("T")[0];

      const upcomingData = allNotes?.filter(n => 
        n.next_action_date && 
        n.next_action_date >= today && 
        n.next_action_date <= sevenDaysLaterStr &&
        n.status === "pendiente"
      ) || [];

      const upcomingWithUsers = await Promise.all(
        upcomingData.slice(0, 5).map(async (note) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", note.user_id)
            .single();
          return {
            id: note.id,
            user_id: note.user_id,
            user_name: profile?.full_name || "Usuario",
            user_email: profile?.email || "",
            note: note.note,
            next_action_date: note.next_action_date,
            next_action: note.next_action,
            potential_level: note.potential_level,
          };
        })
      );
      setUpcomingFollowups(upcomingWithUsers);

      // 7. Alumnos con alto potencial
      const highPotentialNotes = allNotes?.filter(n => n.potential_level === "alto") || [];
      const highPotentialUserIds = [...new Set(highPotentialNotes.map(n => n.user_id))];

      const highPotentialData = await Promise.all(
        highPotentialUserIds.slice(0, 5).map(async (userId) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", userId)
            .single();

          const userEnrollments = enrollments?.filter(e => e.user_id === userId) || [];
          const totalSpent = userEnrollments.reduce((sum, e) => sum + (e.classes?.price || 0), 0);
          
          // Calcular progreso aproximado
          const { data: progress } = await supabase
            .from("lesson_progress")
            .select("*")
            .eq("user_id", userId);
          
          const progressPercent = progress?.length ? Math.min(progress.length * 10, 100) : 0;

          return {
            user_id: userId,
            user_name: profile?.full_name || "Usuario",
            user_email: profile?.email || "",
            total_spent: totalSpent,
            enrolled_count: userEnrollments.length,
            lesson_progress: progressPercent,
            potential_level: "alto",
            last_note_date: highPotentialNotes.find(n => n.user_id === userId)?.created_at?.split("T")[0] || "",
          };
        })
      );
      setHighPotentialUsers(highPotentialData);

      // 8. Notas recientes
      const recentNotesData = allNotes?.slice(0, 5).map(async (note) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("user_id", note.user_id)
          .single();
        return {
          id: note.id,
          user_id: note.user_id,
          user_name: profile?.full_name || "Usuario",
          user_email: profile?.email || "",
          note: note.note,
          potential_level: note.potential_level,
          next_action: note.next_action,
          created_at: note.created_at,
        };
      }) || [];

      const recentResolved = await Promise.all(recentNotesData);
      setRecentNotes(recentResolved);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [classes]);

  const getPotentialBadge = (level: string) => {
    switch (level) {
      case "alto": return <Badge className="bg-red-100 text-red-700 border-red-200">🔥 Alto</Badge>;
      case "medio": return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">🟡 Medio</Badge>;
      default: return <Badge className="bg-green-100 text-green-700 border-green-200">⚪ Bajo</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "whatsapp": return "📱";
      case "email": return "📧";
      case "llamada": return "📞";
      case "descuento": return "🎁";
      default: return "📝";
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Vista general de tu plataforma</p>
      </div>

      {/* Stats principales - Datos reales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Ingresos totales</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(stats.total_revenue)}</p>
              <span className="text-xs font-medium text-emerald-600">+{stats.revenue_change}%</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Usuarios registrados</p>
              <p className="text-xl font-bold text-foreground">{stats.total_users}</p>
              <span className="text-xs font-medium text-blue-600">+{stats.users_change}%</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Clases activas</p>
              <p className="text-xl font-bold text-foreground">{stats.total_classes}</p>
              <span className="text-xs font-medium text-primary">+{stats.classes_change}%</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Ventas totales</p>
              <p className="text-xl font-bold text-foreground">{stats.total_sales}</p>
              <span className="text-xs font-medium text-amber-600">+{stats.sales_change}%</span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen CRM */}
      {crmSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600">Total notas</p>
                <p className="text-xl font-bold text-blue-700">{crmSummary.total_notes}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600">Pendientes</p>
                <p className="text-xl font-bold text-yellow-700">{crmSummary.pending_notes}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600">Completadas</p>
                <p className="text-xl font-bold text-green-700">{crmSummary.completed_notes}</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600">Próximos seguimientos</p>
                <p className="text-xl font-bold text-purple-700">{crmSummary.upcoming_followups}</p>
              </div>
              <CalendarCheck className="h-8 w-8 text-purple-400" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Próximos seguimientos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Próximos seguimientos
              <Button variant="ghost" size="sm" className="ml-auto text-xs" asChild>
                <Link to="/admin/usuarios">Ver todos →</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingFollowups.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay seguimientos pendientes</p>
            ) : (
              upcomingFollowups.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/usuarios/${f.user_id}`} className="font-medium text-sm hover:text-primary hover:underline">
                        {f.user_name}
                      </Link>
                      {getPotentialBadge(f.potential_level)}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{f.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{getActionIcon(f.next_action)} {f.next_action === "whatsapp" ? "WhatsApp" : f.next_action === "email" ? "Email" : f.next_action === "llamada" ? "Llamada" : "Descuento"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(f.next_action_date)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Alumnos con alto potencial */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Alumnos con alto potencial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highPotentialUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay alumnos con alto potencial</p>
            ) : (
              highPotentialUsers.map((u) => (
                <div key={u.user_id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-red-100 text-red-700 text-xs">
                        {u.user_name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link to={`/admin/usuarios/${u.user_id}`} className="font-medium text-sm hover:text-primary hover:underline">
                        {u.user_name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>💰 {formatCurrency(u.total_spent)}</span>
                        <span>📚 {u.enrolled_count} clases</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Progress value={u.lesson_progress} className="h-1.5 w-20 mb-1" />
                    <p className="text-xs text-muted-foreground">{u.lesson_progress}% progreso</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notas recientes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Notas de seguimiento recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay notas recientes</p>
            ) : (
              recentNotes.map((note) => (
                <div key={note.id} className="py-2 border-b last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <Link to={`/admin/usuarios/${note.user_id}`} className="text-sm font-medium hover:text-primary hover:underline">
                      {note.user_name}
                    </Link>
                    <span className="text-xs text-muted-foreground">{formatDate(note.created_at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{note.note}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getPotentialBadge(note.potential_level)}
                    <span className="text-xs text-muted-foreground">{getActionIcon(note.next_action)} {note.next_action}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Clases más populares - Datos reales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Clases más populares
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularClasses.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay clases con ventas</p>
            ) : (
              popularClasses.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="text-lg font-bold text-muted-foreground/50 w-6">#{i + 1}</span>
                  <img src={c.image_url || "/placeholder.svg"} alt={c.title} className="h-10 w-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.sales} ventas · {c.price === 0 ? "Gratis" : formatCurrency(c.price)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
