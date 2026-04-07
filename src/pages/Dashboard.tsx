import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Facebook, Youtube, Globe, Save } from "lucide-react";

interface ProfileEditorProps {
  profile: {
    name: string;
    email: string;
    whatsapp: string;
    facebook: string;
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
  
  // Modelos Thermomix
  const [selectedModels, setSelectedModels] = useState<string[]>(
    profile.thermomixModel ? [profile.thermomixModel] : []
  );
  const [planToBuy, setPlanToBuy] = useState(false);
  const [noThermomix, setNoThermomix] = useState(false);
  
  // Preferencias de alimentación
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    profile.foodPreferences || []
  );

  // Efecto para deshabilitar modelos si "No tengo Thermomix" está activado
  const isModelsDisabled = noThermomix;

  // Seleccionar/Deseleccionar todos
  const handleSelectAllPreferences = () => {
    if (selectedPreferences.length === FOOD_CATEGORIES.length) {
      setSelectedPreferences([]);
    } else {
      setSelectedPreferences([...FOOD_CATEGORIES]);
    }
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    // Determinar el modelo final (si no tiene Thermomix, guardar "none")
    let finalModel: string;
    if (noThermomix) {
      finalModel = "none";
    } else if (selectedModels.length > 0) {
      finalModel = selectedModels[0]; // Por ahora guarda el primero
    } else {
      finalModel = "TM6"; // default
    }
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          whatsapp: whatsapp,
          facebook: facebookUser,
          thermomix_model: finalModel,
          food_preferences: selectedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      // También actualizar email en auth.users (requiere confirmación)
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

  // Redes sociales de Gaby
  const socialLinks = [
    { name: "Instagram", icon: <Instagram className="h-4 w-4" />, handle: "@gabybernalcocina", url: "https://instagram.com/gabybernalcocina" },
    { name: "Facebook", icon: <Facebook className="h-4 w-4" />, handle: "/gabybernalcocina", url: "https://facebook.com/gabybernalcocina" },
    { name: "YouTube", icon: <Youtube className="h-4 w-4" />, handle: "/c/GabyBernalCocina", url: "https://youtube.com/c/GabyBernalCocina" },
    { name: "Web", icon: <Globe className="h-4 w-4" />, handle: "gabybernal.com", url: "https://gabybernal.com" },
  ];

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
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Teléfono / WhatsApp</Label>
              <Input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook (usuario)</Label>
              <Input
                id="facebook"
                value={facebookUser}
                onChange={(e) => setFacebookUser(e.target.value)}
                placeholder="tu.usuario"
              />
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
                  <Label
                    htmlFor={`model-${model}`}
                    className={`text-sm font-normal ${isModelsDisabled ? "text-muted-foreground" : ""}`}
                  >
                    {model}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="plan-to-buy"
              checked={planToBuy}
              onCheckedChange={(checked) => setPlanToBuy(!!checked)}
            />
            <Label htmlFor="plan-to-buy" className="text-sm font-normal">
              Planeo comprar (referencia futura)
            </Label>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="no-thermomix"
              checked={noThermomix}
              onCheckedChange={(checked) => {
                setNoThermomix(!!checked);
                if (checked) {
                  setSelectedModels([]);
                }
              }}
            />
            <Label htmlFor="no-thermomix" className="text-sm font-normal">
              No tengo Thermomix (modo exploración)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Preferencias de alimentación */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-display">Preferencias de alimentación</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAllPreferences}
            className="gap-2"
          >
            {selectedPreferences.length === FOOD_CATEGORIES.length
              ? "Deseleccionar todos"
              : "Seleccionar todos"}
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

      {/* Redes sociales de Gaby */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Sígueme</CardTitle>
          <p className="text-sm text-muted-foreground">Conoce más de Gaby en sus redes sociales</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {social.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{social.name}</p>
                  <p className="text-xs text-muted-foreground">{social.handle}</p>
                </div>
              </a>
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
