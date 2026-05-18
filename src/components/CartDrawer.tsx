import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, MessageCircle, X, CheckCircle, Loader2, LogIn } from "lucide-react";
import { recordPurchaseAttempt } from "@/lib/purchaseAttempts";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CartDrawer = () => {
  const { items, removeItem, clearCart, total, count } = useCart();
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState("");
  const [userModel, setUserModel] = useState("");

  // 🔧 Cargar datos del usuario desde profiles
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, thermomix_models")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setUserName(data.full_name || "");
          const models = data.thermomix_models;
          if (models && models.length > 0) {
            setUserModel(models.join(", "));
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };
    loadUserProfile();
  }, [user]);

  const buildWhatsAppUrl = (orderNumber: string) => {
    const itemsList = items.map((i) => `• ${i.title} — $${i.price} MXN`).join("\n");
    
    // 🔧 Usar datos reales del usuario
    const finalName = userName || "[Tu nombre]";
    const finalModel = userModel || "[Tu modelo]";
    
    const message = `¡Hola Gaby! 👋 Vengo de tu App 'En tu Cocina'. 🧑‍🍳

Me interesa adquirir lo siguiente:
🛍️ Pedido: ${orderNumber}
${itemsList}
💰 Total estimado: $${total} MXN

Mi nombre es: ${finalName}
Mi modelo de Thermomix es: ${finalModel}

¿Me podrías compartir los datos para el pago? ¡Gracias!`;
    
    return `https://wa.me/5215559663086?text=${encodeURIComponent(message)}`;
  };

  const handleConfirmSend = async () => {
    if (!user) {
      window.location.href = "/auth?redirect=/clases";
      return;
    }

    setSending(true);
    try {
      const orderNumber = await recordPurchaseAttempt(
        items.map((i) => ({ title: i.title, price: i.price }))
      );
      const url = buildWhatsAppUrl(orderNumber);
      window.open(url, "_blank", "noopener,noreferrer");
      clearCart();
      setConfirmOpen(false);
    } finally {
      setSending(false);
    }
  };

  const openConfirmDialog = () => {
    if (!user) {
      window.location.href = "/auth?redirect=/clases";
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Mi carrito ({count})
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center">
                Tu carrito está vacío.<br />Explora el catálogo de clases.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {items.map((item) => (
                  <div key={item.classId} className="flex gap-3 items-start">
                    <img src={item.image} alt={item.title} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-sm font-semibold text-primary">${item.price} MXN</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => removeItem(item.classId)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3 pt-4">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span className="text-foreground">${total} MXN</span>
                </div>

                {user ? (
                  <Button
                    className="w-full gap-2 font-body"
                    size="lg"
                    onClick={openConfirmDialog}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Finalizar por WhatsApp
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button className="w-full gap-2 font-body" size="lg" asChild>
                      <Link to="/auth">
                        <LogIn className="h-4 w-4" />
                        Iniciar sesión para comprar
                      </Link>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Necesitas iniciar sesión para enviar tu pedido
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-destructive hover:text-destructive"
                  onClick={clearCart}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Vaciar carrito
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Confirmation Dialog ──────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Confirmar pedido
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Revisa tu pedido antes de enviarlo por WhatsApp:
            </p>

            <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
              {items.map((item) => (
                <div key={item.classId} className="flex justify-between text-sm">
                  <span className="text-foreground truncate pr-4">{item.title}</span>
                  <span className="font-medium text-foreground shrink-0">${item.price}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="text-primary">${total} MXN</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Al confirmar se generará un número de pedido, se abrirá WhatsApp con tu pedido y el carrito se vaciará.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Revisar carrito
            </Button>
            <Button onClick={handleConfirmSend} disabled={sending} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              Enviar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CartDrawer;
