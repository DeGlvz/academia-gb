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

/* ── Types ───────────────────────────────────────────── */
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
  { name: "Huevo", percentage: 0 },
];

const STORAGE_KEY = "gaby-baker-formulas";

function loadFormulas(): SavedFormula[] {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
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
  
  const [flourWeight, setFlourWeight] = useState(1000);
  const [pieces, setPieces] = useState(1);
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [formulaName, setFormulaName] = useState("");
  const [savedFormulas, setSavedFormulas] = useState<SavedFormula[]>(loadFormulas);

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
    const checkAccess = async
