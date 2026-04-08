import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Mail, Calendar, Shield, MoreVertical, 
  BookOpen, TrendingUp, DollarSign, Clock, Target, 
  Plus, Send, AlertCircle, CheckCircle, Star, Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useClasses } from "@/hooks/useClasses";

interface UserProfileData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string;
  total_spent: number;
  total_purchases: number;
  average_ticket: number;
  last_purchase_date: string;
  days_since_last_purchase: number;
  average_progress: number;
  upsell_score: "alto" | "medio" | "bajo";
  is_admin: boolean;
  status: "activo" | "inactivo" | "suspendido";
  food_preferences: string[];
  enrolled_classes: any[];
  notes: any[];
  sales: any[];
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: classes = [] } = useClasses();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("seguimiento");
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [newSale, setNewSale] = useState({
    class_id: "",
    amount: "",
    payment_method: "Transferencia",
    order_number: "",
  });

  // Cargar datos del usuario
  const loadUserData = async () => {
    if (!id) return;
    setIsLoading(true);
    
    try {
      // 1. Obtener perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", id)
        .single();
      
      if (profileError) throw profileError;
      
      // 2. Obtener roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", id);
      
      if (rolesError) throw rolesError;
      
      // 3. Obtener clases inscritas
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrolled_classes")
        .select("*, classes(*)")
        .eq("user_id", id);
      
      if (enrollError) throw enrollError;
      
      // 4. Obtener progreso de lecciones
      const { data: progress, error: progressError } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", id);
      
      if (progressError) throw progressError;
      
      // 5. Obtener analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", id)
        .single();
      
      // 6. Obtener notas CRM
      const { data: notes, error: notesError } = await supabase
        .from("user_notes")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      
      if (notesError) throw notesError;
      
      // 7. Obtener ventas manuales
      const { data: sales, error: salesError } = await supabase
        .from("sales_manual")
        .select("*, classes(*)")
        .eq("user_id", id)
        .order("payment_date", { ascending: false });
      
      if (salesError) throw salesError;
      
      // Calcular total de lecciones por clase
      const { data: lessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, class_id");
      
      if (lessonsError) throw lessonsError;
      
      const totalLessonsForUser = (enrollments || []).reduce((total, e) => {
        const classLessons = lessons?.filter(l => l.class_id === e.class_id) || [];
        return total + classLessons.length;
      }, 0);
      const lessonProgressPercent = totalLessonsForUser > 0 
        ? Math.round(((progress?.length || 0) / totalLessonsForUser) * 100)
        : 0;
      
      // Calcular total gastado de clases inscritas
      const totalSpent = (enrollments || []).reduce((sum, e) => {
        return sum + (e.classes?.price || 0);
      }, 0);
      
      // Calcular analytics manualmente si no existe
      const totalPurchases = (enrollments || []).length;
      const lastPurchase = (enrollments || []).length > 0 
        ? (enrollments[0]?.created_at?.split("T")[0] || "")
        : "";
      
      setUser({
        id: profile.user_id,
        email: profile.email || "",
        full_name: profile.full_name || "Sin nombre",
        created_at: profile.created_at?.split("T")[0] || "—",
        last_sign_in_at: profile.updated_at?.split("T")[0] || "—",
        total_spent: analytics?.total_spent || totalSpent,
        total_purchases: analytics?.total_purchases || totalPurchases,
        average_ticket: analytics?.average_ticket || (totalPurchases > 0 ? totalSpent / totalPurchases : 0),
        last_purchase_date: analytics?.last_purchase_date || lastPurchase,
        days_since_last_purchase: analytics?.days_since_last_purchase || 0,
        average_progress: analytics?.average_progress || lessonProgressPercent,
        upsell_score: analytics?.upsell_score || "bajo",
        is_admin: roles?.some(r => r.role === "admin") || false,
        status: "activo" as const,
        food_preferences: profile.food_preferences || [],
        enrolled_classes: enrollments || [],
        notes: notes || [],
        sales: sales || [],
      });
      
    } catch (error) {
      console.error("Error loading user:", error);
      toast({ title: "Error", description: "No se pudo cargar el perfil", variant: "destructive" });
      navigate("/admin/usuarios");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadUserData();
  }, [id]);
  
  const getUpsellColor = (score: string) => {
    switch (score) {
      case "alto": return "text-red-600 bg-red-50 border-red-200";
      case "medio": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-green-600 bg-green-50 border-green-200";
    }
  };
  
  const getUpsellText = (score: string) => {
    switch (score) {
      case "alto": return "🔥 Alto potencial - Recomendar curso premium";
      case "medio": return "🟡 Medio potencial - Ofrecer curso complementario";
      default: return "⚪ Bajo potencial - Enfocar en engagement";
    }
  };
  
  const addNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const { error } = await supabase
        .from("user_notes")
        .insert({
          user_id: id,
          note: newNote,
          note_type: noteType,
        });
      
      if (error) throw error;
      
      toast({ title: "Nota agregada", description: "La nota de seguimiento se ha guardado" });
      setNewNote("");
      setShowNoteDialog(false);
      loadUserData();
    } catch (error) {
      console.error("Error adding note:", error);
      toast({ title: "Error", description: "No se pudo agregar la nota", variant: "destructive" });
    }
  };
  
  const addManualSale = async () => {
    if (!newSale.class_id || !newSale.amount) return;
    
    try {
      const classData = classes.find(c => c.id === newSale.class_id);
      const { error } = await supabase
        .from("sales_manual")
        .insert({
          user_id: id,
          class_id: newSale.class_id,
          amount: parseFloat(newSale.amount),
          payment_method: newSale.payment_method,
          order_number: newSale.order_number,
        });
      
      if (error) throw error;
      
      // También agregar a enrolled_classes
      await supabase
        .from("enrolled_classes")
        .insert({
          user_id: id,
          class_id: newSale.class_id,
        });
      
      toast({ title: "Venta registrada", description: `Se asignó "${classData?.title}" al alumno` });
      setNewSale({ class_id: "", amount: "", payment_method: "Transferencia", order_number: "" });
      setShowSaleDialog(false);
      loadUserData();
    } catch (error) {
      console.error("Error adding sale:", error);
      toast({ title: "Error", description: "No se pudo registrar la venta", variant: "destructive" });
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando perfil...</div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Usuario no encontrado</p>
        <Button asChild className="mt-4">
          <Link to="/admin/usuarios">Volver a alumnos</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="container px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/usuarios">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a alumnos
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">{user.full_name}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user.is_admin ? "default" : "outline"} className="gap-1">
                <Shield className="h-3 w-3" />
                {user.is_admin ? "Admin" : "Alumno"}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                {user.created_at}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container px-6 py-6 max-w-7xl">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${user.total_spent.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Volumen de compra</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${user.average_ticket}</p>
                  <p className="text-xs text-muted-foreground">Ticket promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.days_since_last_purchase || 0} días</p>
                  <p className="text-xs text-muted-foreground">Última compra</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.total_purchases}</p>
                  <p className="text-xs text-muted-foreground">Clases compradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={getUpsellColor(user.upsell_score)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{getUpsellText(user.upsell_score)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview">📊 Resumen</TabsTrigger>
            <TabsTrigger value="classes">📚 Clases</TabsTrigger>
            <TabsTrigger value="sales">💰 Ventas</TabsTrigger>
            <TabsTrigger value="crm">📝 CRM</TabsTrigger>
          </TabsList>
          
          {/* Tab: Resumen */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progreso general</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Clases completadas</span>
                      <span className="text-sm font-medium">{user.average_progress}%</span>
                    </div>
                    <Progress value={user.average_progress} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">{user.enrolled_classes.length}</p>
                      <p className="text-xs text-muted-foreground">Clases inscritas</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">{user.food_preferences.length}</p>
                      <p className="text-xs text-muted-foreground">Preferencias</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comportamiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Última actividad</span>
                    <span className="text-sm font-medium">{user.last_sign_in_at}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Días desde última compra</span>
                    <span className="text-sm font-medium">{user.days_since_last_purchase || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Última compra</span>
                    <span className="text-sm font-medium">{user.last_purchase_date || "—"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab: Clases */}
          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clases inscritas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.enrolled_classes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Sin clases asignadas</p>
                  ) : (
                    user.enrolled_classes.map((enrollment) => (
                      <div key={enrollment.class_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{enrollment.classes?.title}</p>
                          <p className="text-xs text-muted-foreground">{enrollment.classes?.category}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/clases/${enrollment.classes?.slug}`}>Ver clase</Link>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Ventas */}
          <TabsContent value="sales">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Historial de ventas</CardTitle>
                <Button size="sm" onClick={() => setShowSaleDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar venta
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.sales.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Sin ventas registradas</p>
                  ) : (
                    <div className="space-y-2">
                      {user.sales.map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{sale.classes?.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {sale.payment_date} · {sale.payment_method}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">${sale.amount}</p>
                            {sale.order_number && <p className="text-xs text-muted-foreground">#{sale.order_number}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: CRM (Notas) */}
          <TabsContent value="crm">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Notas de seguimiento</CardTitle>
                <Button size="sm" onClick={() => setShowNoteDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar nota
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.notes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Sin notas de seguimiento</p>
                  ) : (
                    user.notes.map((note) => (
                      <div key={note.id} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {note.note_type === "seguimiento" && "📝 Seguimiento"}
                            {note.note_type === "venta" && "💰 Venta"}
                            {note.note_type === "soporte" && "🛠️ Soporte"}
                            {note.note_type === "alerta" && "⚠️ Alerta"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString("es-MX")}
                          </span>
                        </div>
                        <p className="text-sm">{note.note}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog: Agregar nota */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar nota de seguimiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de nota</Label>
              <Select value={noteType} onValueChange={setNoteType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seguimiento">📝 Seguimiento general</SelectItem>
                  <SelectItem value="venta">💰 Venta / Negociación</SelectItem>
                  <SelectItem value="soporte">🛠️ Soporte técnico</SelectItem>
                  <SelectItem value="alerta">⚠️ Alerta / Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nota</Label>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Escribe aquí la nota de seguimiento..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Cancelar</Button>
            <Button onClick={addNote}>Guardar nota</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Registrar venta manual */}
      <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar venta manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Clase *</Label>
              <Select value={newSale.class_id} onValueChange={(v) => setNewSale({ ...newSale, class_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una clase" />
                </SelectTrigger>
                <SelectContent>
                  {classes.filter(c => c.price > 0).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title} - ${c.price}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monto *</Label>
              <Input
                type="number"
                value={newSale.amount}
                onChange={(e) => setNewSale({ ...newSale, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Método de pago</Label>
              <Select value={newSale.payment_method} onValueChange={(v) => setNewSale({ ...newSale, payment_method: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferencia">Transferencia bancaria</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Tarjeta">Tarjeta de crédito/débito</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número de pedido (opcional)</Label>
              <Input
                value={newSale.order_number}
                onChange={(e) => setNewSale({ ...newSale, order_number: e.target.value })}
                placeholder="GBC-00001"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaleDialog(false)}>Cancelar</Button>
            <Button onClick={addManualSale}>Registrar venta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
