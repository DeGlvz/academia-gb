import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Save, Calculator, Plus, Trash2, Eye, GripVertical } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CalculadoraPanaderoPreview from "@/components/CalculadoraPanaderoPreview";

interface Ingredient {
  name: string;
  percentage: number;
}

interface ToolConfig {
  id: number;
  tool_name: string;
  is_enabled: boolean;
  required_class_id: string | null;
  default_ingredients: Ingredient[];
  tool_name_display: string;
  unit: string;
  tips: string[];
  show_tips: boolean;
  updated_at: string;
}

const AdminHerramientas = () => {
  const { toast } = useToast();
  const { data: classes = [] } = useClasses();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ToolConfig | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newTip, setNewTip] = useState("");

  // Cargar configuración
  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("tools_config")
        .select("*")
        .eq("tool_name", "calculadora_panadero")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setConfig({
          ...data,
          default_ingredients: data.default_ingredients || [
            { name: "Agua", percentage: 65 },
            { name: "Sal", percentage: 2 },
            { name: "Levadura", percentage: 1.5 },
            { name: "Azúcar", percentage: 5 },
            { name: "Grasa", percentage: 8 },
          ],
          tips: data.tips || [],
          tool_name_display: data.tool_name_display || "Calculadora Panadero Pro",
          unit: data.unit || "g",
          show_tips: data.show_tips ?? true,
        });
      } else {
        // Crear configuración por defecto
        const defaultConfig = {
          tool_name: "calculadora_panadero",
          is_enabled: true,
          required_class_id: null,
          default_ingredients: [
            { name: "Agua", percentage: 65 },
            { name: "Sal", percentage: 2 },
            { name: "Levadura", percentage: 1.5 },
            { name: "Azúcar", percentage: 5 },
            { name: "Grasa", percentage: 8 },
          ],
          tool_name_display: "Calculadora Panadero Pro",
          unit: "g",
          tips: [],
          show_tips: true,
        };
        
        const { data: newConfig, error: insertError } = await supabase
          .from("tools_config")
          .insert(defaultConfig)
          .select()
          .single();

        if (insertError) throw insertError;
        setConfig({ ...newConfig, default_ingredients: defaultConfig.default_ingredients });
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
          default_ingredients: config.default_ingredients,
          tool_name_display: config.tool_name_display,
          unit: config.unit,
          tips: config.tips,
          show_tips: config.show_tips,
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

  // Manejadores de ingredientes
  const updateIngredient = (idx: number, field: keyof Ingredient, value: string | number) => {
    if (!config) return;
    const newIngredients = [...config.default_ingredients];
    newIngredients[idx] = { ...newIngredients[idx], [field]: value };
    setConfig({ ...config, default_ingredients: newIngredients });
  };

  const addIngredient = () => {
    if (!config) return;
    setConfig({
      ...config,
      default_ingredients: [...config.default_ingredients, { name: "Nuevo ingrediente", percentage: 0 }],
    });
  };

  const removeIngredient = (idx: number) => {
    if (!config) return;
    setConfig({
      ...config,
      default_ingredients: config.default_ingredients.filter((_, i) => i !== idx),
    });
  };

  // Manejadores de tips
  const addTip = () => {
    if (!config || !newTip.trim()) return;
    setConfig({ ...config, tips: [...config.tips, newTip.trim()] });
    setNewTip("");
  };

  const updateTip = (idx: number, value: string) => {
    if (!config) return;
    const newTips = [...config.tips];
    newTips[idx] = value;
    setConfig({ ...config, tips: newTips });
  };

  const removeTip = (idx: number) => {
    if (!config) return;
    setConfig({ ...config, tips: config.tips.filter((_, i) => i !== idx) });
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

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Configuración general */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {config.tool_name_display || "Calculadora Panadero Pro"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nombre de la herramienta */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Nombre de la herramienta</Label>
            <Input
              value={config.tool_name_display}
              onChange={(e) => setConfig({ ...config, tool_name_display: e.target.value })}
              placeholder="Calculadora Panadero Pro"
            />
          </div>

          {/* Unidad de medida */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Unidad de medida</Label>
            <Select value={config.unit} onValueChange={(value) => setConfig({ ...config, unit: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">Gramos (g)</SelectItem>
                <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                <SelectItem value="oz">Onzas (oz)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Habilitar herramienta */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Habilitar herramienta</Label>
              <p className="text-xs text-muted-foreground">Activa o desactiva la calculadora</p>
            </div>
            <Switch
              checked={config.is_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, is_enabled: checked })}
            />
          </div>

          {/* Mostrar tips */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Mostrar tips rápidos</Label>
              <p className="text-xs text-muted-foreground">Muestra u oculta los tips en la calculadora</p>
            </div>
            <Switch
              checked={config.show_tips}
              onCheckedChange={(checked) => setConfig({ ...config, show_tips: checked })}
            />
          </div>

          {/* Clase requerida */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Clase requerida para acceso</Label>
            <Select
              value={config.required_class_id || "ninguna"}
              onValueChange={(value) => setConfig({ ...config, required_class_id: value === "ninguna" ? null : value })}
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
              Los administradores siempre tendrán acceso sin restricciones.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edición de ingredientes por defecto */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">🥣 Ingredientes por defecto</CardTitle>
          <Button size="sm" variant="outline" onClick={addIngredient} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Agregar ingrediente
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
            <span className="col-span-6">Ingrediente</span>
            <span className="col-span-3 text-center">%</span>
            <span className="col-span-3" />
          </div>
          {config.default_ingredients.map((ing, idx) => (
            <div key={idx} className="flex flex-wrap sm:grid sm:grid-cols-12 gap-2 items-center">
              <div className="flex-1 min-w-[120px] sm:col-span-6">
                <Input
                  value={ing.name}
                  onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                  className="h-8 text-sm"
                  placeholder="Nombre del ingrediente"
                />
              </div>
              <div className="w-24 sm:w-auto sm:col-span-3">
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={ing.percentage}
                  onChange={(e) => updateIngredient(idx, "percentage", Number(e.target.value) || 0)}
                  className="h-8 text-sm text-center"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeIngredient(idx)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {config.default_ingredients.length === 0 && (
            <p className="text-center text-muted-foreground py-4 text-sm">
              No hay ingredientes. Agrega el primero.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edición de tips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">💡 Tips rápidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {config.tips.map((tip, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="flex-1">
                <Textarea
                  value={tip}
                  onChange={(e) => updateTip(idx, e.target.value)}
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 mt-1" onClick={() => removeTip(idx)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Textarea
              value={newTip}
              onChange={(e) => setNewTip(e.target.value)}
              placeholder="Nuevo tip..."
              rows={2}
              className="text-sm resize-none flex-1"
            />
            <Button variant="outline" onClick={addTip} className="shrink-0 self-start" disabled={!newTip.trim()}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <Button onClick={saveConfig} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar configuración"}
        </Button>
        <Button variant="outline" onClick={() => setPreviewOpen(true)} className="gap-2">
          <Eye className="h-4 w-4" />
          Vista previa
        </Button>
      </div>

      {/* Resumen */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold mb-2">📌 Resumen de configuración</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Estado:</strong> {config.is_enabled ? <span className="text-green-600">✅ Activada</span> : <span className="text-red-600">❌ Desactivada</span>}</li>
            <li>• <strong>Acceso:</strong> {config.required_class_id ? "🔒 Requiere clase específica" : "🔓 Libre para todas las alumnas"}</li>
            <li>• <strong>Ingredientes:</strong> {config.default_ingredients.length} ingredientes configurados</li>
            <li>• <strong>Tips:</strong> {config.tips.length} tips configurados</li>
            <li>• <strong>Administradores:</strong> 👑 Siempre tienen acceso sin restricciones</li>
          </ul>
        </CardContent>
      </Card>

      {/* Modal de vista previa */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista previa: {config.tool_name_display}</DialogTitle>
          </DialogHeader>
          <CalculadoraPanaderoPreview config={config} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHerramientas;
