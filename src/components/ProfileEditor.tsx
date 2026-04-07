import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Instagram, Facebook, Twitter, Tv, Globe } from "lucide-react";

interface ProfileEditorProps {
  profile: {
    name: string;
    email: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    website: string;
    thermomixModel: "TM31" | "TM5" | "TM6" | "TM7";
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
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados del formulario
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || "");
  const [facebookUser, setFacebookUser] = useState(profile.facebook || "");
  
  // Redes sociales del alumno
  const [instagram, setInstagram] = useState(profile.instagram || "");
  const [twitter, setTwitter] = useState(profile.twitter || "");
  const [tiktok, setTikTok] = useState(profile.tiktok || "");
  const [website, setWebsite] = useState(profile.website || "");
  
  // Modelos Thermomix
  const [selectedModels, setSelectedModels] = useState<string[]>(
    profile.thermomixModel && profile.thermomixModel !== "none" ? [profile.thermomixModel] : []
  );
  const [planToBuy, setPlanToBuy] = useState(false);
  const [noThermomix, setNoThermomix] = useState(profile.thermomixModel === "none");
  
  // Preferencias de alimentación
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    profile.foodPreferences || []
  );

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
    
    let finalModel: string;
    if (noThermomix) {
      finalModel = "none";
    } else if (selectedModels.length > 0) {
      finalModel = selectedModels[0];
    } else {
      finalModel = "TM6";
    }
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          whatsapp: whatsapp,
          facebook: facebookUser,
          instagram: instagram,
          twitter: twitter,
          tiktok: tiktok,
          website: website,
          thermomix_model: finalModel,
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
          <CardTitle className="text-lg font-display">Información personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Teléfono / WhatsApp</Label>
              <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+52 55 1234 5678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook (usuario)</Label>
              <Input id="facebook" value={facebookUser} onChange={(e) => setFacebookUser(e.target.value)} placeholder="tu.usuario" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mis redes sociales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Mis redes sociales</CardTitle>
          <p className="text-sm text-muted-foreground">Opcional - Comparte tus redes para conectar con otras alumnas</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</Label>
              <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@tu_usuario" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2"><Twitter className="h-4 w-4" /> X / Twitter</Label>
              <Input id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@tu_usuario" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok" className="flex items-center gap-2"><Tv className="h-4 w-4" /> TikTok</Label>
              <Input id="tiktok" value={tiktok} onChange={(e) => setTikTok(e.target.value)} placeholder="@tu_usuario" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Sitio web</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://tusitio.com" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modelos Thermomix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Modelos Thermomix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Modelos que tengo</Label>
            <div className="flex flex-wrap gap-4">
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
                  <Label htmlFor={`model-${model}`} className={`text-sm font-normal ${isModelsDisabled ? "text-muted-foreground" : ""}`}>
                    {model}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="plan-to-buy" checked={planToBuy} onCheckedChange={(checked) => setPlanToBuy(!!checked)} />
            <Label htmlFor="plan-to-buy" className="text-sm font-normal">Planeo comprar (referencia futura)</Label>
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
            <Label htmlFor="no-thermomix" className="text-sm font-normal">No tengo Thermomix (modo exploración)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Preferencias de alimentación */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-display">Preferencias de alimentación</CardTitle>
          <Button variant="outline" size="sm" onClick={handleSelectAllPreferences} className="gap-2">
            {selectedPreferences.length === FOOD_CATEGORIES.length ? "Deseleccionar todos" : "Seleccionar todos"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FOOD_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`pref-${category}`}
                  checked={selectedPreferences.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      set
                      setSelectedPreferences([...selectedPreferences, category]);
                    } else {
                      setSelectedPreferences(
                        selectedPreferences.filter((p) => p !== category)
                      );
                    }
                  }}
                />
                <Label htmlFor={`pref-${category}`} className="text-sm font-normal">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileEditor;
