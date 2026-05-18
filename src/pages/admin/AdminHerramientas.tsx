import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useClasses } from "@/hooks/useClasses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ToolConfig {
  id: number;
  tool_name: string;
  is_enabled: boolean;
  required_class_id: string | null;
  updated_at: string;
}

const AdminHerramientas = () => {
  const { toast } = useToast();
  const { data: classes = [] } = useClasses();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ToolConfig | null>(null);

  // Cargar configuración de herramientas
  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("tools_config")
        .select("*")
        .eq("tool_name", "calculadora_panadero")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setConfig(data);
      } else {
        // Crear configuración por defecto
        const { data: newConfig, error: insertError } = await supabase
          .from("tools_config")
          .insert({
            tool_name: "calculadora_panadero",
            is_enabled: true,
            required_class_id: null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setConfig(newConfig);
      }
    } catch (error) {
      console.error("Error loading tools config:", error);
      toast({ title: "Error", description: "No se pudo cargar la configuración", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Guardar configuración
  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("tools_config")
        .update({
          is_enabled: config.is_enabled,
          required_class_id: config.required_class_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config.id);

      if (error) throw error;
      toast({ title: "Configuración guardada", description: "Los cambios se aplicarán inmediatamente." });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({ title: "Error", description: "No se pudo guardar la configuración", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Calculadora Panadero Pro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Habilitar herramienta</Label>
              <p className="text-xs text-muted-foreground">
                Activa o desactiva la calculadora para las alumnas
              </p>
            </div>
            <Switch
              checked={config?.is_enabled || false}
              onCheckedChange={(checked) => setConfig({ ...config!, is_enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Clase requerida para acceso</Label>
            <Select
              value={config?.required_class_id || "ninguna"}
              onValueChange={(value) => setConfig({ ...config!, required_class_id: value === "ninguna" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una clase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguna">Sin restricción (todas las alumnas)</SelectItem>
                {classes.filter(c => c.price > 0).map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Si seleccionas una clase, solo las alumnas que la hayan adquirido podrán usar la calculadora.
              Los administradores siempre tendrán acceso.
            </p>
          </div>

          <div className="pt-2">
            <Button onClick={saveConfig} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar configuración"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold mb-2">📌 Resumen de configuración</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Estado:</strong> {config?.is_enabled ? <span className="text-green-600">✅ Activada</span> : <span className="text-red-600">❌ Desactivada</span>}</li>
            <li>• <strong>Acceso:</strong> {config?.required_class_id ? "🔒 Requiere clase específica" : "🔓 Libre para todas las alumnas"}</li>
            <li>• <strong>Administradores:</strong> 👑 Siempre tienen acceso sin restricciones</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHerramientas;
