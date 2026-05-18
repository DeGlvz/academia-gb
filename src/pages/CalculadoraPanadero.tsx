import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, Calculator, Save, Download, Trash2, Plus, Scale, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Ingredient {
  name: string;
  percentage: number;
}

interface SavedFormula {
  id: string;
  name: string;
  flourWeight: number;
  ingredients: Ingredient[];
  pieces: number;
}

const DEFAULT_INGREDIENTS: Ingredient[] = [
  { name: "Agua", percentage: 65 },
  { name: "Sal", percentage: 2 },
  { name: "Levadura", percentage: 1.5 },
  { name: "Azúcar", percentage: 5 },
  { name: "Grasa", percentage: 8 },
];

const STORAGE_KEY = "gaby-baker-formulas";

function loadFormulas(): SavedFormula[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFormulas(formulas: SavedFormula[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formulas));
}

const LockedView = ({ message }: { message: string }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="py-12 space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-foreground">Calculadora Panadero Pro</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
          </div>
          <Button asChild className="gap-2 font-body">
            <Link to="/clases">Ver clases de Panadería</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
    <Footer />
  </div>
);

const CalculadoraPanadero = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessMessage, setAccessMessage] = useState("");
  const [config, setConfig] = useState<any>(null);
  
  const [flourWeight, setFlourWeight] = useState(1000);
  const [pieces, setPieces] = useState(1);
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [formulaName, setFormulaName] = useState("");
  const [savedFormulas, setSavedFormulas] = useState<SavedFormula[]>(loadFormulas);

  // Cargar configuración de la herramienta
  useEffect(() => {
    const loadConfig = async () => {
      const { data } = await supabase
        .from("tools_config")
        .select("*")
        .eq("tool_name", "calculadora_panadero")
        .single();
      if (data) {
        setConfig(data);
        setIngredients(data.default_ingredients || DEFAULT_INGREDIENTS);
      }
    };
    loadConfig();
  }, []);

  // Verificar rol de admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  // Verificar acceso a la calculadora
  useEffect(() => {
    const checkAccess = async () => {
      if (isAdmin) {
        setHasAccess(true);
        return;
      }

      if (!user) {
        setHasAccess(false);
        setAccessMessage("Inicia sesión para usar esta herramienta");
        return;
      }

      try {
        const { data: toolConfig, error: configError } = await supabase
          .from("tools_config")
          .select("*")
          .eq("tool_name", "calculadora_panadero")
          .single();

        if (configError || !toolConfig?.is_enabled) {
          setHasAccess(false);
          setAccessMessage("Esta herramienta está temporalmente deshabilitada");
          return;
        }

        if (!toolConfig.required_class_id) {
          setHasAccess(true);
          return;
        }

        const { data: enrollment } = await supabase
          .from("enrolled_classes")
          .select("id")
          .eq("user_id", user.id)
          .eq("class_id", toolConfig.required_class_id)
          .maybeSingle();

        if (enrollment) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          setAccessMessage("Esta herramienta exclusiva está disponible para alumnas que hayan adquirido la clase requerida");
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setHasAccess(false);
        setAccessMessage("Error al verificar acceso. Intenta de nuevo.");
      }
    };

    if (user !== undefined) {
      checkAccess();
    }
  }, [user, isAdmin]);

  const computed = useMemo(() => {
    return ingredients.map((ing) => {
      const totalGrams = (ing.percentage / 100) * flourWeight;
      return { ...ing, totalGrams: Math.round(totalGrams * 10) / 10, perPiece: Math.round((totalGrams / pieces) * 10) / 10 };
    });
  }, [flourWeight, pieces, ingredients]);

  const totalWeight = useMemo(() => Math.round((flourWeight + computed.reduce((s, i) => s + i.totalGrams, 0)) * 10) / 10, [flourWeight, computed]);

  const updateIngredient = (idx: number, field: keyof Ingredient, value: string | number) => {
    setIngredients((prev) => prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing)));
  };
  const removeIngredient = (idx: number) => { setIngredients((prev) => prev.filter((_, i) => i !== idx)); };
  const addIngredient = () => { setIngredients((prev) => [...prev, { name: "Nuevo", percentage: 0 }]); };

  const handleSave = () => {
    if (!formulaName.trim()) { toast({ title: "Escribe un nombre", variant: "destructive" }); return; }
    const formula: SavedFormula = { id: Date.now().toString(), name: formulaName.trim(), flourWeight, ingredients, pieces };
    const updated = [...savedFormulas, formula];
    setSavedFormulas(updated);
    saveFormulas(updated);
    setFormulaName("");
    toast({ title: "¡Fórmula guardada!", description: formula.name });
  };

  const loadFormula = (f: SavedFormula) => { setFlourWeight(f.flourWeight); setIngredients(f.ingredients); setPieces(f.pieces); toast({ title: "Fórmula cargada", description: f.name }); };
  const deleteFormula = (id: string) => { const updated = savedFormulas.filter((f) => f.id !== id); setSavedFormulas(updated); saveFormulas(updated); toast({ title: "Fórmula eliminada" }); };

  const handleExport = () => {
    const lines = [`🍞 ${formulaName || "Fórmula Panadero Pro"}`, `Harina: ${flourWeight}g (100%)`, ...computed.map((i) => `${i.name}: ${i.totalGrams}g (${i.percentage}%)`), `──────────`, `Peso total: ${totalWeight}g`, pieces > 1 ? `Piezas: ${pieces} (${Math.round(totalWeight / pieces)}g c/u)` : "", "", "Calculado con Calculadora Panadero Pro — Gaby Bernal en tu Cocina"].filter(Boolean).join("\n");
    navigator.clipboard.writeText(lines);
    toast({ title: "¡Copiado al portapapeles!" });
  };

  if (hasAccess === null || !config) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hasAccess) {
    return <LockedView message={accessMessage || "Inicia sesión para usar esta herramienta"} />;
  }

  const displayName = config?.tool_name_display || "Calculadora Panadero Pro";
  const unitSymbol = config?.unit === 'kg' ? 'kg' : config?.unit === 'oz' ? 'oz' : 'g';
  const unitMultiplier = config?.unit === 'kg' ? 0.001 : config?.unit === 'oz' ? 0.035274 : 1;

  const convertWeight = (grams: number) => {
    const converted = Math.round(grams * unitMultiplier * 10) / 10;
    return `${converted}${unitSymbol}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 py-8 max-w-4xl">
        <Link to="/clases" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Volver a clases
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground">Calcula los gramos exactos de cada ingrediente</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flour" className="text-sm font-medium">Harina ({unitSymbol})</Label>
                    <Input id="flour" type="number" min={1} value={flourWeight} onChange={(e) => setFlourWeight(Number(e.target.value) || 0)} className="text-lg font-semibold" />
                    <p className="text-xs text-muted-foreground">Base = 100%</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pieces" className="text-sm font-medium flex items-center gap-1"><Scale className="h-3.5 w-3.5" /> Piezas</Label>
                    <Input id="pieces" type="number" min={1} value={pieces} onChange={(e) => setPieces(Math.max(1, Number(e.target.value) || 1))} className="text-lg font-semibold" />
                    <p className="text-xs text-muted-foreground">Para escalar la receta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-body flex items-center justify-between">
                  Ingredientes
                  <Button size="sm" variant="outline" className="gap-1 text-xs font-body" onClick={addIngredient}>
                    <Plus className="h-3.5 w-3.5" /> Agregar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                  <span className="col-span-4">Ingrediente</span>
                  <span className="col-span-2 text-center">%</span>
                  <span className="col-span-2 text-center">Total</span>
                  <span className="col-span-2 text-center">Por pieza</span>
                  <span className="col-span-2" />
                </div>
                <div className="flex flex-wrap sm:grid sm:grid-cols-12 gap-2 items-center bg-primary/5 rounded-lg px-3 py-2.5">
                  <span className="w-full sm:w-auto sm:col-span-4 text-sm font-semibold text-foreground">Harina</span>
                  <span className="sm:col-span-2 text-center text-sm font-bold text-primary">100%</span>
                  <span className="sm:col-span-2 text-center text-sm font-semibold">{convertWeight(flourWeight)}</span>
                  <span className="sm:col-span-2 text-center text-sm text-muted-foreground">{pieces > 1 && <>{convertWeight(flourWeight / pieces)}/pieza</>}</span>
                  <span className="hidden sm:block sm:col-span-2" />
                </div>
                {computed.map((ing, idx) => (
                  <div key={idx} className="flex flex-wrap sm:grid sm:grid-cols-12 gap-2 items-center px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors border sm:border-0">
                    <div className="flex-1 min-w-[120px] sm:col-span-4">
                      <Input value={ing.name} onChange={(e) => updateIngredient(idx, "name", e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="w-16 sm:w-auto sm:col-span-2">
                      <Input type="number" min={0} step={0.5} value={ing.percentage} onChange={(e) => updateIngredient(idx, "percentage", Number(e.target.value) || 0)} className="h-8 text-sm text-center" />
                    </div>
                    <span className="text-sm font-medium sm:col-span-2 sm:text-center">{convertWeight(ing.totalGrams)}</span>
                    <span className="text-sm text-muted-foreground sm:col-span-2 sm:text-center">{pieces > 1 ? `${convertWeight(ing.totalGrams / pieces)}/pza` : ""}</span>
                    <div className="sm:col-span-2 flex justify-end ml-auto">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeIngredient(idx)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex flex-wrap sm:grid sm:grid-cols-12 gap-2 items-center px-3 py-2.5 bg-secondary rounded-lg">
                  <span className="w-full sm:w-auto sm:col-span-4 text-sm font-bold text-foreground">Total masa</span>
                  <span className="hidden sm:block sm:col-span-2" />
                  <span className="text-sm font-bold text-foreground sm:col-span-2 sm:text-center">{convertWeight(totalWeight)}</span>
                  <span className="text-sm font-semibold text-muted-foreground sm:col-span-2 sm:text-center">{pieces > 1 ? `${convertWeight(totalWeight / pieces)}/pza` : ""}</span>
                  <span className="hidden sm:block sm:col-span-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input placeholder="Nombre de la fórmula…" value={formulaName} onChange={(e) => setFormulaName(e.target.value)} className="flex-1" />
                  <Button className="gap-2 font-body" onClick={handleSave}><Save className="h-4 w-4" /> Guardar</Button>
                  <Button variant="outline" className="gap-2 font-body" onClick={handleExport}><Download className="h-4 w-4" /> Exportar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-body">Fórmulas guardadas</CardTitle>
              </CardHeader>
              <CardContent>
                {savedFormulas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aún no tienes fórmulas guardadas.</p>
                ) : (
                  <div className="space-y-2">
                    {savedFormulas.map((f) => (
                      <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => loadFormula(f)}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{f.name}</p>
                          <p className="text-xs text-muted-foreground">{f.flourWeight}g harina · {f.ingredients.length} ing.</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => { e.stopPropagation(); deleteFormula(f.id); }}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {config?.show_tips && config?.tips?.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">💡 Tips rápidos</h3>
                  <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                    {config.tips.map((tip: string, idx: number) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CalculadoraPanadero;
