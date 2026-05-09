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

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

const CreateUserModal = ({ open, onOpenChange, onUserCreated }: CreateUserModalProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "alumno" as "admin" | "moderador" | "alumno",
  });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({ title: "Error", description: "Todos los campos son requeridos", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          email_confirm: true,
          user_metadata: { full_name: newUser.full_name },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || "Error al crear usuario");
      }

      const userId = data.id;

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          full_name: newUser.full_name,
          role: newUser.role,
          account_status: "activo",
        });

      if (profileError) throw profileError;

      if (newUser.role === "admin") {
        await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });
      }

      toast({ 
        title: "✅ Usuario creado", 
        description: `${newUser.email} creado correctamente` 
      });
      
      setNewUser({ email: "", password: "", full_name: "", role: "alumno" });
      onUserCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo usuario</DialogTitle>
          <DialogDescription>
            Completa los datos para crear un nuevo usuario.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Correo electrónico *</Label>
            <Input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Contraseña *</Label>
            <Input
              type="password"
              placeholder="********"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
          </div>
          <div className="space-y-2">
            <Label>Nombre completo *</Label>
            <Input
              placeholder="Nombre Apellido"
              value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={newUser.role}
              onValueChange={(v) => setNewUser({ ...newUser, role: v as any })}
            >
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
          <Button onClick={handleCreateUser} disabled={isCreating}>
            {isCreating ? "Creando..." : "Crear usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
