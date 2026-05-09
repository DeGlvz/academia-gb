import { useState } from "react";
import { Database, Table, Copy, Download, CheckCircle, RefreshCw, Sprout, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { dbSchema } from "@/components/admin/config/dbSchema";
import { generateMySQLScript } from "@/components/admin/config/generateMySQL";
import SeedTab from "@/components/admin/config/SeedTab";
import CategoriasTab from "@/components/admin/config/CategoriasTab";

const AdminConfiguracion = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const mysqlScript = generateMySQLScript();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mysqlScript);
    setCopied(true);
    toast({ title: "Copiado al portapapeles" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([mysqlScript], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gaby-bernal-schema-${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Archivo descargado", description: "gaby-bernal-schema.sql" });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-muted-foreground text-sm mt-1">Esquema de base de datos, seed de datos y herramientas de exportación</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: dbSchema.length, label: "Tablas" },
          { value: dbSchema.reduce((s, t) => s + t.columns.length, 0), label: "Columnas" },
          { value: dbSchema.filter((t) => t.columns.some((c) => c.fk)).length, label: "Con FK" },
          { value: "PostgreSQL", label: "Motor actual" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="schema">
        <TabsList>
          <TabsTrigger value="schema" className="gap-1.5">
            <Database className="h-3.5 w-3.5" /> Esquema
          </TabsTrigger>
          <TabsTrigger value="mysql" className="gap-1.5">
            <Table className="h-3.5 w-3.5" /> Exportar MySQL
          </TabsTrigger>
          <TabsTrigger value="seed" className="gap-1.5">
            <Sprout className="h-3.5 w-3.5" /> Seed Clases
          </TabsTrigger>
          <TabsTrigger value="categorias" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Categorías
          </TabsTrigger>
        </TabsList>

        {/* ── Schema Tab ── */}
        <TabsContent value="schema" className="space-y-4 mt-4">
          {/* ... contenido existente ... */}
        </TabsContent>

        {/* ── MySQL Export Tab ── */}
        <TabsContent value="mysql" className="space-y-4 mt-4">
          {/* ... contenido existente ... */}
        </TabsContent>

        {/* ── Seed Tab ── */}
        <TabsContent value="seed" className="mt-4">
          <SeedTab />
        </TabsContent>

        {/* ── Categorías Tab ── */}
        <TabsContent value="categorias" className="mt-4">
          <CategoriasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminConfiguracion;
