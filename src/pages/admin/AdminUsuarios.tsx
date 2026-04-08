import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MoreHorizontal, Filter, CalendarDays, BookOpen, X, ShoppingCart, Shield, ShieldOff, CreditCard, User, Mail, Calendar, DollarSign, UtensilsCrossed, GraduationCap, TrendingUp, Info, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useClasses } from "@/hooks/useClasses";
import { foodPreferences, type FoodPreference } from "@/data/classes";
import { supabase } from "@/integrations/supabase/client";

interface UserWithDetails {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string;
  total_spent: number;
  enrolled_count: number;
  lesson_progress: number;
  blog_progress: number;
  role: "admin" | "moderador" | "alumno";
  account_status: "activo" | "inactivo" | "suspendido" | "pendiente";
  food_preferences: FoodPreference[];
  enrolled_classes: any[];
}

const AdminUsuarios = () => {
  const { toast } = useToast();
  const { data: dbClasses = [] } = useClasses();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPref, setFilterPref] = useState<FoodPreference | "Todas">("Todas");
  const [filterClass, setFilterClass] = useState<string>("Todas");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterRole, setFilterRole] = useState<string>("Todos");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [showFilters, setShowFilters] = useState(false);

  const [accessUser, setAccessUser] = useState<UserWithDetails | null>(null);
  const [accessClasses, setAccessClasses] = useState<string[]>([]);
  const [paymentOrderNumber, setPaymentOrderNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transferencia");
  const [profileUser, setProfileUser] = useState<UserWithDetails | null>(null);

  // Cargar usuarios reales desde Supabase
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Obtener perfiles de usuarios
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Obtener roles de user_roles (para compatibilidad)
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Obtener clases inscritas
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrolled_classes")
        .select("*, classes(*)");

      if (enrollError) throw enrollError;

      // Obtener progreso de lecciones
      const { data: lessonProgress, error: progressError } = await supabase
        .from("lesson_progress")
        .select("*");

      if (progressError) throw progressError;

      // Obtener progreso de blog
      const { data: blogProgress, error: blogError } = await supabase
        .from("blog_progress")
        .select("*");

      if (blogError) throw blogError;

      // Obtener total de lecciones por clase
      const { data: lessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, class_id");

      if (lessonsError) throw lessonsError;

      // Mapear datos
      const adminUserIds = roles?.filter(r => r.role === "admin").map(r => r.user_id) || [];
      
      const usersWithDetails: UserWithDetails[] = (profiles || []).map(profile => {
        const userEnrollments = enrollments?.filter(e => e.user_id === profile.user_id) || [];
        const enrolledClassIds = userEnrollments.map(e => e.class_id);
        
        // Calcular progreso de lecciones
        const userProgress = lessonProgress?.filter(p => p.user_id === profile.user_id) || [];
        const totalLessonsForUser = enrolledClassIds.reduce((total, classId) => {
          const classLessons = lessons?.filter(l => l.class_id === classId) || [];
          return total + classLessons.length;
        }, 0);
        const lessonProgressPercent = totalLessonsForUser > 0 
          ? Math.round((userProgress.length / totalLessonsForUser) * 100) 
          : 0;
        
        // Calcular progreso de blog
        const totalBlogPosts = 0;
        const blogProgressPercent = 0;
        
        // Calcular total gastado
        const totalSpent = userEnrollments.reduce((sum, e) => {
          const classData = dbClasses.find(c => c.id === e.class_id);
          return sum + (classData?.price || 0);
        }, 0);
        
        // Determinar rol
        let role: "admin" | "moderador" | "alumno" = "alumno";
        if (adminUserIds.includes(profile.user_id)) {
          role = "admin";
        } else if (profile.role === "moderador") {
          role = "moderador";
        }
        
        return {
          id: profile.user_id,
          email: profile.email || "",
          full_name: profile.full_name || "Sin nombre",
          created_at: profile.created_at?.split("T")[0] || "—",
          last_sign_in_at: profile.updated_at?.split("T")[0] || "—",
          total_spent: totalSpent,
          enrolled_count: userEnrollments.length,
          lesson_progress: lessonProgressPercent,
          blog_progress: blogProgressPercent,
          role: role,
          account_status: profile.account_status || "activo",
          food_preferences: profile.food_preferences || [],
          enrolled_classes: userEnrollments,
        };
      });

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({ title: "Error", description: "No se pudieron cargar los usuarios", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const paidClasses = dbClasses.filter((c) => !c.is_public && c.price > 0);

  const hasActiveFilters = filterPref !== "Todas" || filterClass !== "Todas" || filterDateFrom || filterDateTo || filterRole !== "Todos" || filterStatus !== "Todos";

  const clearFilters = () => { 
    setFilterPref("Todas"); 
    setFilterClass("Todas"); 
    setFilterDateFrom(""); 
    setFilterDateTo("");
    setFilterRole("Todos");
    setFilterStatus("Todos");
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const textMatch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const prefMatch = filterPref === "Todas" || u.food_preferences.includes(filterPref);
      const classMatch = filterClass === "Todas" || u.enrolled_classes.some(e => e.class_id === filterClass);
      const dateFromMatch = !filterDateFrom || u.created_at >= filterDateFrom;
      const dateToMatch = !filterDateTo || u.created_at <= filterDateTo;
      const roleMatch = filterRole === "Todos" || u.role === filterRole;
      const statusMatch = filterStatus === "Todos" || u.account_status === filterStatus;
      return textMatch && prefMatch && classMatch && dateFromMatch && dateToMatch && roleMatch && statusMatch;
    });
  }, [users, search, filterPref, filterClass, filterDateFrom, filterDateTo, filterRole, filterStatus]);

  const openAccessDialog = (user: UserWithDetails) => {
    setAccessUser(user);
    setAccessClasses(user.enrolled_classes.map(e => e.class_id));
    setPaymentOrderNumber("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Transferencia");
  };

  const toggleAccess = (classId: string) => { 
    setAccessClasses((prev) => prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]); 
  };

  const saveAccess = async () => {
    if (!accessUser) return;
    
    try {
      await supabase
        .from("enrolled_classes")
        .delete()
        .eq("user_id", accessUser.id);
      
      for (const classId of accessClasses) {
        await supabase
          .from("enrolled_classes")
          .insert({ user_id: accessUser.id, class_id: classId });
      }
      
      if (paymentOrderNumber) {
        await supabase
          .from("purchase_attempts")
          .insert({
            user_id: accessUser.id,
            order_number: paymentOrderNumber,
            items: accessClasses,
            total: 0,
            payment_method: paymentMethod,
            payment_date: paymentDate,
          });
      }
      
      toast({ title: "Accesos actualizados", description: `Se actualizaron los accesos de ${accessUser.full_name}` });
      setAccessUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error saving access:", error);
      toast({ title: "Error", description: "No se pudieron guardar los accesos", variant: "destructive" });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Actualizar en profiles
      await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("user_id", userId);
      
      // Si es admin, también actualizar user_roles
      if (newRole === "admin") {
        await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" });
      } else {
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
      }
      
      toast({ title: "Rol actualizado", description: `El rol se ha actualizado correctamente` });
      loadUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({ title: "Error", description: "No se pudo actualizar el rol", variant: "destructive" });
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await supabase
        .from("profiles")
        .update({ account_status: newStatus })
        .eq("user_id", userId);
      
      toast({ title: "Estado actualizado", description: `El estado se ha actualizado correctamente` });
      loadUsers();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="h-3 w-3" />;
      case "moderador": return <ShieldOff className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "text-purple-600 bg-purple-50 border-purple-200";
      case "moderador": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo": return "bg-green-100 text-green-700";
      case "inactivo": return "bg-gray-100 text-gray-700";
      case "suspendido": return "bg-red-100 text-red-700";
      case "pendiente": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return "text-green-600";
    if (progress >= 30) return "text-yellow-600";
    return "text-blue-600";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Control de Alumnos</h1>
        <p className="text-muted-foreground text-sm mt-1">{users.length} alumnos registrados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { value: users.length, label: "Total", icon: User },
          { value: users.filter((u) => u.enrolled_count > 0).length, label: "Con clases", icon: BookOpen },
          { value: users.filter((u) => u.lesson_progress > 0).length, label: "Con progreso", icon: TrendingUp },
          { value: `${Math.round(users.reduce((s, u) => s + u.lesson_progress, 0) / (users.length || 1))}%`, label: "Progreso promedio", icon: GraduationCap },
          { value: formatCurrency(users.reduce((s, u) => s + u.total_spent, 0)), label: "Ingresos", icon: DollarSign },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <s.icon className="h-4 w-4 text-muted-foreground mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant={showFilters || hasActiveFilters ? "default" : "outline"} size="sm" className="gap-1.5 self-start" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4" /> Filtros
          {hasActiveFilters && <span className="ml-1 bg-primary-foreground text-primary text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">!</span>}
        </Button>
        {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs self-start"><X className="h-3.5 w-3.5" /> Limpiar filtros</Button>}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Preferencia</Label>
              <Select value={filterPref} onValueChange={(v) => setFilterPref(v as any)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Todas">Todas</SelectItem>{foodPreferences.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Clase</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Todas">Todas</SelectItem>{paidClasses.map((c) => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rol</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderador">Moderador</SelectItem>
                  <SelectItem value="alumno">Alumno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Desde</Label><Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="h-9 text-xs" /></div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Hasta</Label><Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="h-9 text-xs" /></div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">{filtered.length} alumno{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>

      {/* Tabla de usuarios */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-medium text-muted-foreground">Alumno</th>
                  <th className="p-3 font-medium text-muted-foreground">Matrícula</th>
                  <th className="p-3 font-medium text-muted-foreground">Rol</th>
                  <th className="p-3 font-medium text-muted-foreground">Estado</th>
                  <th className="p-3 font-medium text-muted-foreground text-center">Clases</th>
                  <th className="p-3 font-medium text-muted-foreground text-center">Progreso</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Total</th>
                  <th className="p-3 w-10"></th>
                 </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {u.full_name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <Link 
                              to={`/admin/usuarios/${u.id}`} 
                              className="font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {u.full_name}
                            </Link>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Haz clic para ver perfil completo<br/>con métricas y seguimiento CRM</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                     </td>
                    <td className="p-3 text-muted-foreground text-xs">{u.created_at}</td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={`h-6 text-xs gap-1 ${getRoleColor(u.role)}`}>
                            {getRoleIcon(u.role)}
                            {u.role === "admin" ? "Admin" : u.role === "moderador" ? "Moderador" : "Alumno"}
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => updateUserRole(u.id, "alumno")}>
                            <User className="h-3.5 w-3.5 mr-2" /> Alumno
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(u.id, "moderador")}>
                            <ShieldOff className="h-3.5 w-3.5 mr-2" /> Moderador
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserRole(u.id, "admin")}>
                            <Shield className="h-3.5 w-3.5 mr-2" /> Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={`h-6 text-xs ${getStatusColor(u.account_status)}`}>
                            {u.account_status === "activo" && "🟢 Activo"}
                            {u.account_status === "inactivo" && "⚪ Inactivo"}
                            {u.account_status === "suspendido" && "🔴 Suspendido"}
                            {u.account_status === "pendiente" && "🟡 Pendiente"}
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => updateUserStatus(u.id, "activo")}>
                            🟢 Activo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserStatus(u.id, "inactivo")}>
                            ⚪ Inactivo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserStatus(u.id, "suspendido")}>
                            🔴 Suspendido
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateUserStatus(u.id, "pendiente")}>
                            🟡 Pendiente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="p-3 text-center font-medium">{u.enrolled_count}</td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-xs font-medium ${getProgressColor(u.lesson_progress)}`}>
                          {u.lesson_progress}%
                        </span>
                        <Progress value={u.lesson_progress} className="h-1.5 w-16" />
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">{formatCurrency(u.total_spent)}</td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openAccessDialog(u)}>
                            <BookOpen className="h-3.5 w-3.5 mr-2" /> Asignar accesos
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/usuarios/${u.id}`}>
                              <User className="h-3.5 w-3.5 mr-2" /> Ver perfil completo
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Asignar accesos */}
      <Dialog open={!!accessUser} onOpenChange={(open) => !open && setAccessUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar accesos — {accessUser?.full_name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Marca las clases a las que este alumno tendrá acceso.</p>

          <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Datos del pago (opcional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nº Pedido</Label>
                <Input placeholder="GBC-00001" value={paymentOrderNumber} onChange={(e) => setPaymentOrderNumber(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fecha de pago</Label>
                <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Método de pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferencia">Transferencia bancaria</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Tarjeta">Tarjeta de crédito/débito</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {paidClasses.map((c) => {
              const checked = accessClasses.includes(c.id);
              return (
                <label key={c.id} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}>
                  <Checkbox checked={checked} onCheckedChange={() => toggleAccess(c.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.category} · {formatCurrency(c.price)}</p>
                  </div>
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={saveAccess}>Guardar accesos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsuarios;
