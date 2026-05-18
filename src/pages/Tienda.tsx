import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
}

const Tienda = () => {
  const { toast } = useToast();
  const { items, addItem, removeItem, updateQuantity, getCartTotal } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);

  // Filtrar solo productos de la tienda (type: 'product')
  const cartProducts = items.filter(item => item.type === 'product');

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error loading products:", error);
        toast({ title: "Error", description: "No se pudieron cargar los productos", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      type: "product",
      title: product.name,
      price: product.price,
      image: product.image_url || "/placeholder.svg",
      quantity: 1,
    });
    toast({ title: "Agregado al carrito", description: product.name });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId, "product");
    } else {
      updateQuantity(productId, "product", newQuantity);
    }
  };

  const handleWhatsAppOrder = () => {
    if (cartProducts.length === 0) {
      toast({ title: "Carrito vacío", description: "Agrega productos para enviar tu pedido", variant: "destructive" });
      return;
    }

    const productList = cartProducts.map(item => 
      `• ${item.title} x${item.quantity} = $${(item.price * item.quantity).toLocaleString()} MXN`
    ).join("%0A");
    
    const total = getCartTotal("product");
    const message = `¡Hola Gaby! Me interesa hacer el siguiente pedido:%0A%0A${productList}%0A%0A📦 TOTAL: $${total.toLocaleString()} MXN%0A%0A¡Gracias!`;
    
    window.open(`https://wa.me/5215559663086?text=${message}`, "_blank");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "accesorio": return "🔧 Accesorio";
      case "libro": return "📚 Libro";
      case "utensilio": return "🍴 Utensilio";
      default: return category;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando productos...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b bg-secondary/20">
          <div className="container px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Tienda</h1>
            <p className="text-muted-foreground mt-1">Accesorios, libros y utensilios para tu Thermomix</p>
          </div>
        </div>

        <div className="container px-4 py-8">
          {/* Botón flotante del carrito */}
          {cartProducts.length > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button 
                onClick={() => setShowCart(!showCart)}
                className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
              >
                <ShoppingCart className="h-6 w-6" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white">
                  {cartProducts.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                </Badge>
              </Button>
            </div>
          )}

          {/* Panel lateral del carrito */}
          {showCart && cartProducts.length > 0 && (
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l shadow-xl flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Mi carrito</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartProducts.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                    <img src={item.image} alt={item.title} className="h-16 w-16 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity || 1}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto text-destructive" onClick={() => removeItem(item.id, "product")}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(getCartTotal("product"))}</span>
                </div>
                <Button className="w-full gap-2" onClick={handleWhatsAppOrder}>
                  <ShoppingCart className="h-4 w-4" />
                  Enviar pedido por WhatsApp
                </Button>
              </div>
            </div>
          )}

          {/* Grid de productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="h-full hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="aspect-square overflow-hidden rounded-t-lg bg-muted/30">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(product.category)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-display line-clamp-1">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full gap-2" 
                    variant="default"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Agregar al carrito
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Próximamente más productos</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tienda;
