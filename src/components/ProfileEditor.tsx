import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Instagram, Facebook, Tv, Globe } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileEditorProps {
  profile: {
    name: string;
    email: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    website: string;
    thermomixModels: string[];
    foodPreferences: string[];
    registeredAt: string;
    avatar: string | null;
  };
}

const FOOD_CATEGORIES = [
  "Panadería",
  "Repostería",
  "Básicos",
  "Cocina Práctica",
  "Vegano",
  "Vegetariano",
  "Keto",
  "Sin Gluten",
  "Sin Azúcar",
];

const THERMOMIX_MODELS = ["TM31", "TM5", "TM6", "TM7"];

const ProfileEditor = ({ profile }: ProfileEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || "");
  const [facebookUser, setFacebookUser] = useState(profile.facebook || "");
  const [instagram, setInstagram] = useState(profile.instagram || "");
  const [tiktok, setTikTok] = useState(profile.tiktok || "");
  const [website, setWebsite] = useState(profile.website || "");
  
  const [selectedModels, setSelectedModels] = useState<string[]>(
    profile.thermomixModels || []
  );
  const [planToBuy, setPlanToBuy] = useState(false);
  const [noThermomix, setNoThermomix] = useState(
    !profile.thermomixModels || profile.thermomixModels.length === 0
  );
  
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    profile.foodPreferences || []
  );

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setWhatsapp(profile.whatsapp || "");
    setFacebookUser(profile.facebook || "");
    setInstagram(profile.instagram || "");
    setTikTok(profile.tiktok || "");
    setWebsite(profile.website || "");
    setSelectedModels(profile.thermomixModels || []);
    setNoThermomix(!profile.thermomixModels || profile.thermomixModels.length === 0);
    setSelectedPreferences(profile.foodPreferences || []);
  }, [profile]);

  const isModelsDisabled = noThermomix;

  const handleSelectAllPreferences = () => {
    if (selectedPreferences.length === FOOD_CATEGORIES.length) {
      setSelectedPreferences([]);
    } else {
      setSelectedPreferences([...FOOD_CATEGORIES]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    let finalModels: string[];
    if (noThermomix) {
      finalModels = [];
    } else {
      finalModels = selectedModels;
    }
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          whatsapp: whatsapp,
          facebook: facebookUser,
          instagram: instagram,
          tiktok: tiktok,
          website: website,
          thermomix_models: finalModels,
          food_preferences: selectedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      if (email !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });
        if (emailError) throw emailError;
        toast({
          title: "Correo actualizado",
          description: "Se ha enviado un enlace de confirmación a tu nuevo correo.",
        });
      }
      
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido guardados correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Información personal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-display">Información personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Nombre completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="w-full min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Correo electrónico</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm">Teléfono / WhatsApp</Label>
              <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+52 55 1234 5678" className="w-full min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-sm">Facebook (usuario)</Label>
              <Input id="facebook" value={facebookUser} onChange={(e) => setFacebookUser(e.target.value)} placeholder="tu.usuario" className="w-full min-h-[44px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mis redes sociales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-display">Mis redes sociales</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">Opcional - Comparte tus redes para conectar con otras alumnas</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2 text-sm"><Instagram className="h-4 w-4" /> Instagram</Label>
              <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@tu_usuario" className="w-full min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok" className="flex items-center gap-2 text-sm"><Tv className="h-4 w-4" /> TikTok</Label>
              <Input id="tiktok" value={tiktok} onChange={(e) => setTikTok(e.target.value)} placeholder="@tu_usuario" className="w-full min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4" /> Sitio web</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://tusitio.com" className="w-full min-h-[44px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modelos Thermomix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-display">Modelos Thermomix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Modelos que tengo (puedes seleccionar varios)</Label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
              {THERMOMIX_MODELS.map((model) => (
                <div key={model} className="flex items-center space-x-2">
                  <Checkbox
                    id={`model-${model}`}
                    checked={selectedModels.includes(model)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedModels([...selectedModels, model]);
                      } else {
                        setSelectedModels(selectedModels.filter((m) => m !== model));
                      }
                    }}
                    disabled={isModelsDisabled}
                  />
                  <Label htmlFor={`model-${model}`} className={`text-sm font-normal cursor-pointer ${isModelsDisabled ? "text-muted-foreground" : ""}`}>
                    {model}
                  </Label>
                </div>
              ))}
            </div>
            {selectedModels.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Tienes {selectedModels.length} modelo(s) seleccionado(s): {selectedModels.join(", ")}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="plan-to-buy" checked={planToBuy} onCheckedChange={(checked) => setPlanToBuy(!!checked)} />
            <Label htmlFor="plan-to-buy" className="text-sm font-normal cursor-pointer">Planeo comprar (referencia futura)</Label>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="no-thermomix"
              checked={noThermomix}
              onCheckedChange={(checked) => {
                setNoThermomix(!!checked);
                if (checked) setSelectedModels([]);
              }}
            />
            <Label htmlFor="no-thermomix" className="text-sm font-normal cursor-pointer">No tengo Thermomix (modo exploración)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Preferencias de alimentación */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-display">Preferencias de alimentación</CardTitle>
          <Button variant="outline" size="sm" onClick={handleSelectAllPreferences} className="gap-2 text-sm min-h-[44px]">
            {selectedPreferences.length === FOOD_CATEGORIES.length ? "Deseleccionar todos" : "Seleccionar todos"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
            {FOOD_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`pref-${category}`}
                  checked={selectedPreferences.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPreferences([...selectedPreferences, category]);
                    } else {
                      setSelectedPreferences(
                        selectedPreferences.filter((p) => p !== category)
                      );
                    }
                  }}
                />
                <Label htmlFor={`pref-${category}`} className="text-sm font-normal cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 min-h-[44px] min-w-[120px]">
          <Save className="h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileEditor;
