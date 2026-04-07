import { useState } from "react";
import { Upload, Copy, Download, CheckCircle, AlertTriangle, Loader2, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useClasses } from "@/hooks/useClasses";
import { generateSeedSQL, generateMySQLSeedSQL } from "./generateSeedSQL";

const SeedTab = () => {
  const { toast } = useToast();
  const { data: classes = [], isLoading } = useClasses();
  const [copied, setCopied] = useState<"pg" | "mysql" | null>(null);

  const pgSeed = generateSeedSQL(classes);
  const mysqlSeed = generateMySQLSeedSQL(classes);

  const handleCopy = async (type: "pg" | "mysql") => {
    await navigator.clipboard.writeText(type === "pg" ? pgSeed : mysqlSeed);
    setCopied(type);
    toast({ title: "Copiado al portapapeles" });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (type: "pg" | "mysql") => {
    const content = type === "pg" ? pgSeed : mysqlSeed;
    const suffix = type === "pg" ? "postgresql" : "mysql";
    const blob = new Blob([content], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seed-classes-${suffix}-${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Archivo descargado" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{classes.length}</p><p className="text-xs text-muted-foreground">Clases en BD</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{classes.reduce((s, c) => s + c.lessons.length, 0)}</p><p className="text-xs text-muted-foreground">Lecciones totales</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{classes.filter((c) => c.is_public).length}</p><p className="text-xs text-muted-foreground">Clases públicas</p></CardContent></Card>
      </div>

      {/* PostgreSQL seed script */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Script Seed — PostgreSQL
          </CardTitle>
          <p className="text-xs text-muted-foreground">Genera INSERTs a partir de las clases actualmente en la base de datos.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleCopy("pg")}>
              {copied === "pg" ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === "pg" ? "Copiado" : "Copiar"}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleDownload("pg")}>
              <Download className="h-3.5 w-3.5" /> Descargar .sql
            </Button>
          </div>
          <Separator />
          <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-[400px] overflow-y-auto text-foreground whitespace-pre">{pgSeed}</pre>
        </CardContent>
      </Card>

      {/* MySQL seed script */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Script Seed — MySQL
            <Badge variant="secondary" className="text-[10px] ml-auto">Exportable</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleCopy("mysql")}>
              {copied === "mysql" ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === "mysql" ? "Copiado" : "Copiar"}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleDownload("mysql")}>
              <Download className="h-3.5 w-3.5" /> Descargar .sql
            </Button>
          </div>
          <Separator />
          <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-[400px] overflow-y-auto text-foreground whitespace-pre">{mysqlSeed}</pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeedTab;
