import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Phone, Facebook, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { thermomixModels, foodPreferences, type ThermomixModel, type FoodPreference } from "@/data/classes";
import { fadeInUp } from "@/lib/animations";

interface ProfileEditorProps {
  profile: {
    whatsapp?: string;
    facebook?: string;
    thermomixModel: ThermomixModel;
    foodPreferences: FoodPreference[];
  };
}

const ProfileEditor = ({ profile }: ProfileEditorProps) => {
  const { toast } = useToast();
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || "");
  const [facebook, setFacebook] = useState(profile.facebook || "");
  const [model, setModel] = useState<ThermomixModel>(profile.thermomixModel);
  const [preferences, setPreferences] = useState<FoodPreference[]>(profile.foodPreferences);

  const togglePreference = (pref: FoodPreference) => {
    setPreferences((prev) => prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]);
  };

  const handleSave = () => {
    if (whatsapp.trim().length > 0 && whatsapp.trim().length < 8) {
      toast({ title: "WhatsApp inválido", description: "Ingresa un número válido.", variant: "destructive" });
      return;
    }
    toast({ title: "Perfil actualizado", description: "Tus datos se guardaron correctamente." });
  };

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" />Editar perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-1.5 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" />WhatsApp</Label>
              <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+52 55 1234 5678" maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center gap-1.5 text-sm"><Facebook className="h-3.5 w-3.5 text-muted-foreground" />Facebook</Label>
              <Input id="facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="tu.usuario" maxLength={100} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Modelo Thermomix</Label>
            <Select value={model} onValueChange={(v) => setModel(v as ThermomixModel)}>
              <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>{thermomixModels.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="text-sm">Preferencias de alimentación</Label>
            <div className="flex flex-wrap gap-2">
              {foodPreferences.map((pref) => {
                const active = preferences.includes(pref);
                return (<Badge key={pref} variant={active ? "default" : "outline"} className="cursor-pointer select-none transition-colors text-xs px-3 py-1" onClick={() => togglePreference(pref)}>{pref}</Badge>);
              })}
            </div>
            <p className="text-xs text-muted-foreground">Selecciona las categorías que más te interesan</p>
          </div>
          <Button onClick={handleSave} className="gap-2 font-body"><Save className="h-4 w-4" />Guardar cambios</Button>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default ProfileEditor;
