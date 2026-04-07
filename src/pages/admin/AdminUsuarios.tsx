import { useState, useMemo, useEffect } from "react";
import { Search, MoreHorizontal, Filter, CalendarDays, BookOpen, X, ShoppingCart, Shield, ShieldOff, CreditCard, User, Mail, Calendar, DollarSign, UtensilsCrossed } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useClasses } from "@/hooks/useClasses";
import { foodPreferences, type FoodPreference } from "@/data/classes";
import { supabase } from "@/integrations/supabase/client";

/* ── Extended mock user with preferences & enrolled classes ── */
interface AdminUser {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  totalSpent: number;
  status: "activo" | "inactivo";
  foodPreferences: FoodPreference[];
  enrolledClassIds: string[];
  lastPurchaseAttempt: string | null;
  isAdmin: boolean;
}

const mockUsers: AdminUser[] = [
  { id: "u1", name: "María López", email: "maria@email.com", registeredAt: "2025-01-15", totalSpent: 1297, status: "activo", foodPreferences: ["Panadería", "Repostería"], enrolledClassIds: ["class-1", "class-4", "class-pub-1"], lastPurchaseAttempt: "2025-03-14T18:30:00Z", isAdmin: false },
  { id: "u2", name: "Ana García", email: "ana@email.com", registeredAt: "2025-02-20", totalSpent: 898, status: "activo", foodPreferences: ["Cocina Práctica", "Sin Gluten"], enrolledClassIds: ["class-2", "class-5"], lastPurchaseAttempt: "2025-03-16T10:15:00Z", isAdmin: false },
  { id: "u3", name: "Laura Martínez", email: "laura@email.com", registeredAt: "2025-03-01", totalSpent: 499, status: "activo", foodPreferences: ["Panadería"], enrolledClassIds: ["class-1"], lastPurchaseAttempt: null, isAdmin: false },
  { id: "u4", name: "Carmen Ruiz", email: "carmen@email.com", registeredAt: "2024-11-10", totalSpent: 1746, status: "activo", foodPreferences: ["Repostería", "Keto"], enrolledClassIds: ["class-1", "class-3", "class-4", "class-6"], lastPurchaseAttempt: "2025-03-10T22:45:00Z", isAdmin: false },
  { id: "u5", name: "Isabel Torres", email: "isabel@email.com", registeredAt: "2025-01-28", totalSpent: 299, status: "inactivo", foodPreferences: ["Vegano"], enrolledClassIds: ["class-3"], lastPurchaseAttempt: "2025-02-01T14:00:00Z", isAdmin: false },
  { id: "u6", name: "Patricia Sánchez", email: "patricia@email.com", registeredAt: "2024-12-05", totalSpent: 2145, status: "activo", foodPreferences: ["Cocina Práctica", "Básicos"], enrolledClassIds: ["class-1", "class-2", "class-4", "class-5", "class-6"], lastPurchaseAttempt: "2025-03-17T09:00:00Z", isAdmin: false },
  { id: "u7", name: "Rosa Hernández", email: "rosa@email.com", registeredAt: "2025-02-14", totalSpent: 0, status: "inactivo", foodPreferences: [], enrolledClassIds: [], lastPurchaseAttempt: null, isAdmin: false },
  { id: "u8", name: "Elena Díaz", email: "elena@email.com", registeredAt: "2025-03-10", totalSpent: 748, status: "activo", foodPreferences: ["Sin Azúcar", "Vegetariano"], enrolledClassIds: ["class-3", "class-5"], lastPurchaseAttempt: "2025-03-15T16:20:00Z", isAdmin: false },
];

const AdminUsuarios = () => {
  const { toast } = useToast();
  const { data: dbClasses = [] } = useClasses();
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [filterPref, setFilterPref] = useState<FoodPreference | "Todas">("Todas");
  const [filterClass, setFilterClass] = useState<string>("Todas");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [accessUser, setAccessUser] = useState<AdminUser | null>(null);
  const [accessClasses, setAccessClasses] = useState<string[]>([]);
  const [paymentOrderNumber, setPaymentOrderNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transferencia");
  const [profileUser, setProfileUser] = useState<AdminUser | null>(null);

  const paidClasses = dbClasses.filter((c) => !c.is_public);

  const hasActiveFilters = filterPref !== "Todas" || filterClass !== "Todas" || filterDateFrom || filterDateTo;

  const clearFilters = () => { setFilterPref("Todas"); setFilterClass("Todas"); setFilterDateFrom(""); setFilterDateTo(""); };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const textMatch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const prefMatch = filterPref === "Todas" || u.foodPreferences.includes(filterPref);
      const classMatch = filterClass === "Todas" || u.enrolledClassIds.includes(filterClass);
      const dateFromMatch = !filterDateFrom || u.registeredAt >= filterDateFrom;
      const dateToMatch = !filterDateTo || u.registeredAt <= filterDateTo;
      return textMatch && prefMatch && classMatch && dateFromMatch && dateToMatch;
    });
  }, [users, search, filterPref, filterClass, filterDateFrom, filterDateTo]);

  const openAccessDialog = (user: AdminUser) => {
    setAccessUser(user);
    setAccessClasses([...user.enrolledClassIds]);
    setPaymentOrderNumber("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Transferencia");
  };
  const toggleAccess = (classId: string) => { setAccessClasses((prev) => prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]); };
  const saveAccess = () => {
    if (!accessUser) return;
    setUsers((prev) => prev.map((u) => u.id === accessUser.id ? { ...u, enrolledClassIds: accessClasses } : u));
    toast({ title: "Accesos actualizados", description: `Se actualizaron los accesos de ${accessUser.name}` });
    setAccessUser(null);
  };

  const toggleAdmin = async (user: AdminUser) => {
    if (user.isAdmin) {
      // Remove admin role — for real users this would delete from user_roles
      const { error } = await supabase.from("user_roles").delete().eq("user_id", user.id).eq("role", "admin");
      if (!error || user.id.startsWith("u")) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isAdmin: false } : u));
        toast({ title: "Rol removido", description: `${user.name} ya no es administrador` });
      }
    } else {
      // Add admin role
      const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" as any });
      if (!error || user.id.startsWith("u")) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isAdmin: true } : u));
        toast({ title: "Rol asignado", description: `${user.name} ahora es administrador` });
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Control de Alumnos</h1>
        <p className="text-muted-foreground text-sm mt-1">{users.length} alumnos registrados</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: users.length, label: "Total" },
          { value: users.filter((u) => u.status === "activo").length, label: "Activos" },
          { value: users.filter((u) => u.enrolledClassIds.length > 0).length, label: "Con clases" },
          { value: `$${users.reduce((s, u) => s + u.totalSpent, 0).toLocaleString()}`, label: "Ingresos" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>

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
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Preferencia alimenticia</Label>
              <Select value={filterPref} onValueChange={(v) => setFilterPref(v as any)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Todas">Todas</SelectItem>{foodPreferences.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Clase adquirida</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Todas">Todas</SelectItem>{paidClasses.map((c) => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Desde</Label><Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="h-9 text-xs" /></div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Hasta</Label><Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="h-9 text-xs" /></div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">{filtered.length} alumno{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-medium text-muted-foreground">Alumno</th>
                  <th className="p-3 font-medium text-muted-foreground hidden md:table-cell">Registro</th>
                  <th className="p-3 font-medium text-muted-foreground hidden lg:table-cell">Preferencias</th>
                  <th className="p-3 font-medium text-muted-foreground text-center">Clases</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Total</th>
                  <th className="p-3 font-medium text-muted-foreground hidden md:table-cell"><span className="flex items-center gap-1 justify-center"><ShoppingCart className="h-3.5 w-3.5" /> Últ. Intento</span></th>
                  <th className="p-3 font-medium text-muted-foreground text-center">Estado</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{u.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                        <div><p className="font-medium text-foreground">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell text-xs">{u.registeredAt}</td>
                    <td className="p-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {u.foodPreferences.length > 0 ? u.foodPreferences.slice(0, 2).map((p) => (<Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>)) : <span className="text-xs text-muted-foreground">—</span>}
                        {u.foodPreferences.length > 2 && <Badge variant="outline" className="text-[10px]">+{u.foodPreferences.length - 2}</Badge>}
                      </div>
                    </td>
                    <td className="p-3 text-center font-medium">{u.enrolledClassIds.length}</td>
                    <td className="p-3 text-right font-medium">${u.totalSpent}</td>
                    <td className="p-3 text-center hidden md:table-cell">
                      {u.lastPurchaseAttempt ? <span className="text-xs text-muted-foreground">{new Date(u.lastPurchaseAttempt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</span> : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Badge variant={u.status === "activo" ? "default" : "secondary"} className="text-xs">{u.status}</Badge>
                        {u.isAdmin && <Badge variant="outline" className="text-xs border-primary text-primary gap-0.5"><Shield className="h-3 w-3" />Admin</Badge>}
                      </div>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openAccessDialog(u)}><BookOpen className="h-3.5 w-3.5 mr-2" /> Asignar accesos</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleAdmin(u)}>
                            {u.isAdmin ? <><ShieldOff className="h-3.5 w-3.5 mr-2" /> Quitar admin</> : <><Shield className="h-3.5 w-3.5 mr-2" /> Hacer admin</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setProfileUser(u)}>Ver perfil</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Desactivar</DropdownMenuItem>
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

      <Dialog open={!!accessUser} onOpenChange={(open) => !open && setAccessUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Asignar accesos — {accessUser?.name}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Marca las clases a las que este alumno tendrá acceso.</p>

          {/* Payment info */}
          <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Datos del pago</p>
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
                  <SelectItem value="Otro">Otro</SelectItem>
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
                    <p className="text-xs text-muted-foreground">{c.category} · ${c.price} MXN</p>
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
      {/* Profile dialog */}
      <Dialog open={!!profileUser} onOpenChange={(open) => !open && setProfileUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Perfil del alumno</DialogTitle></DialogHeader>
          {profileUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {profileUser.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{profileUser.name}</p>
                  <p className="text-xs text-muted-foreground">{profileUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Registro</p>
                  <p className="text-sm font-medium text-foreground">{profileUser.registeredAt}</p>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Total gastado</p>
                  <p className="text-sm font-medium text-foreground">${profileUser.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><UtensilsCrossed className="h-3 w-3" /> Preferencias</p>
                <div className="flex flex-wrap gap-1">
                  {profileUser.foodPreferences.length > 0
                    ? profileUser.foodPreferences.map((p) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)
                    : <span className="text-xs text-muted-foreground">Sin preferencias</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><BookOpen className="h-3 w-3" /> Clases ({profileUser.enrolledClassIds.length})</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {profileUser.enrolledClassIds.length > 0
                    ? profileUser.enrolledClassIds.map((cid) => {
                        const cls = dbClasses.find((c) => c.id === cid);
                        return <p key={cid} className="text-xs text-foreground">{cls?.title ?? cid}</p>;
                      })
                    : <span className="text-xs text-muted-foreground">Sin clases asignadas</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={profileUser.status === "activo" ? "default" : "secondary"}>{profileUser.status}</Badge>
                {profileUser.isAdmin && <Badge variant="outline" className="border-primary text-primary gap-0.5"><Shield className="h-3 w-3" /> Admin</Badge>}
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cerrar</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsuarios;
