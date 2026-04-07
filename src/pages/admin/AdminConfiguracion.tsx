import { useState } from "react";
import { Database, Table, Copy, Download, CheckCircle, RefreshCw, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { dbSchema } from "@/components/admin/config/dbSchema";
import { generateMySQLScript } from "@/components/admin/config/generateMySQL";
import SeedTab from "@/components/admin/config/SeedTab";

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
        </TabsList>

        {/* ── Schema Tab ── */}
        <TabsContent value="schema" className="space-y-4 mt-4">
          {dbSchema.map((table) => (
            <Card key={table.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  {table.name}
                  <Badge variant="secondary" className="text-[10px] font-normal ml-auto">
                    {table.columns.length} columnas
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{table.description}</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-t border-b text-left">
                        <th className="px-4 py-2 font-medium text-muted-foreground">Columna</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">Tipo (PG)</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">Tipo (MySQL)</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground text-center">Nullable</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">Default</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">FK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.columns.map((col) => (
                        <tr key={col.name} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-2 font-medium text-foreground flex items-center gap-1.5">
                            {col.pk && <Badge className="text-[8px] px-1 py-0">PK</Badge>}
                            {col.name}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground font-mono">{col.type}</td>
                          <td className="px-4 py-2 text-muted-foreground font-mono">{col.mysqlType}</td>
                          <td className="px-4 py-2 text-center">
                            {col.nullable ? (
                              <span className="text-muted-foreground">✓</span>
                            ) : (
                              <span className="text-foreground font-medium">NOT NULL</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground font-mono text-[10px]">
                            {col.default || "—"}
                          </td>
                          <td className="px-4 py-2">
                            {col.fk ? (
                              <Badge variant="outline" className="text-[10px]">{col.fk}</Badge>
                            ) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── MySQL Export Tab ── */}
        <TabsContent value="mysql" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                Script de creación MySQL
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Este script genera las tablas equivalentes en MySQL. Los UUIDs se almacenan como CHAR(36) y los arrays de PostgreSQL como JSON.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCopy}>
                  {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
                <Button size="sm" className="gap-1.5" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  Descargar .sql
                </Button>
              </div>
              <Separator />
              <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-[500px] overflow-y-auto text-foreground whitespace-pre">
                {mysqlScript}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Seed Tab ── */}
        <TabsContent value="seed" className="mt-4">
          <SeedTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminConfiguracion;
