import { DollarSign, Users, BookOpen, TrendingUp, Eye, ShoppingCart, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClasses } from "@/hooks/useClasses";

const recentSales = [
  { user: "María López", class: "Pan Artesanal desde Cero", amount: "$499", date: "Hace 2h" },
  { user: "Ana García", class: "Repostería Fina", amount: "$599", date: "Hace 5h" },
  { user: "Laura Martínez", class: "Cocina Mexicana Tradicional", amount: "$449", date: "Hace 8h" },
  { user: "Carmen Ruiz", class: "Pasta Fresca Italiana", amount: "$399", date: "Hace 1d" },
  { user: "Isabel Torres", class: "Smoothie Bowls y Desayunos", amount: "$299", date: "Hace 1d" },
];

const AdminDashboard = () => {
  const { data: classes = [], isLoading } = useClasses();

  const stats = [
    { label: "Ingresos totales", value: "$24,580", icon: DollarSign, change: "+12.5%", color: "text-emerald-600" },
    { label: "Usuarios registrados", value: "1,247", icon: Users, change: "+8.2%", color: "text-blue-600" },
    { label: "Clases activas", value: String(classes.length), icon: BookOpen, change: "+1", color: "text-primary" },
    { label: "Ventas este mes", value: "89", icon: ShoppingCart, change: "+23%", color: "text-amber-600" },
  ];

  const popularClasses = classes
    .map((c) => ({ ...c, sales: Math.floor(Math.random() * 80) + 20 }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  if (isLoading) {
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <span className={`text-xs font-medium ${s.color}`}>{s.change}</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Ventas recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSales.map((sale, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{sale.user}</p>
                  <p className="text-xs text-muted-foreground">{sale.class}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{sale.amount}</p>
                  <p className="text-xs text-muted-foreground">{sale.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Clases más populares
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularClasses.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <span className="text-lg font-bold text-muted-foreground/50 w-6">#{i + 1}</span>
                <img src={c.image_url || "/placeholder.svg"} alt={c.title} className="h-10 w-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.sales} ventas · ${c.price}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
