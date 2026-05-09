import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompleteProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name?: string;
    role?: string;
  };
  onComplete: () => void;
}

const CompleteProfileModal = ({ open, onOpenChange, user, onComplete }: CompleteProfileModalProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(user.full_name || "");
  const [role, setRole] = useState(user.role || "alumno");

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast({ title: "Error", description: "El nombre completo es requerido", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      // Actualizar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          role: role,
          account_status: "activo",
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Si es admin, también actualizar user_roles
      if (role === "admin") {
        await supabase
          .from("user_roles")
          .upsert({ user_id: user.id, role: "admin" });
      }

      toast({ 
        title: "✅ Perfil completado", 
        description: `${user.email} ahora está activo` 
      });
      
      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error completing profile:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Completar perfil de usuario</DialogTitle>
          <DialogDescription>
            Completa los datos para activar a {user.email}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre completo *</Label>
            <Input
              placeholder="Nombre Apellido"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alumno">👤 Alumno</SelectItem>
                <SelectItem value="moderador">🛡️ Moderador</SelectItem>
                <SelectItem value="admin">👑 Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Activar usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteProfileModal;
