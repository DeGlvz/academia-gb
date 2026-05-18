import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/ui/image-upload";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const CATEGORIES = ["accesorio", "libro", "utensilio"];

const AdminProductos = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "accesorio",
    is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Cargar productos
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
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

  useEffect(() => {
    loadProducts();
  }, []);

  // Guardar producto (crear o editar)
  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast({ title: "Error", description: "Nombre y precio son requeridos", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        category: formData.category,
        is_active: formData.is_active,
        sort_order: editingProduct ? editingProduct.sort_order : products.length,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update({ ...productData, updated_at: new Date().toISOString() })
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "Producto actualizado", description: formData.name });
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;
        toast({ title: "Producto creado", description: formData.name });
      }

      setDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar producto
  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) throw error;
      toast({ title: "Producto eliminado", description: productToDelete.name });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Cambiar estado activo/inactivo
  const toggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !product.is_active, updated_at: new Date().toISOString() })
        .eq("id", product.id);

      if (error) throw error;
      toast({ title: product.is_active ? "Producto ocultado" : "Producto visible" });
      loadProducts();
    } catch (error: any) {
      console.error("Error toggling product:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      category: product.category || "accesorio",
      is_active: product.is_active,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "accesorio",
      is_active: true,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "accesorio",
      is_active: true,
    });
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
      <div className="p-6 md:p-8 flex justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona los productos de la tienda</p>
        </div>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-medium text-muted-foreground">Producto</th>
                  <th className="p-3 font-medium text-muted-foreground">Categoría</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Precio</th>
                  <th className="p-3 font-medium text-muted-foreground text-center">Estado</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No hay productos. Crea el primero.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded object-cover" />
                          )}
                          {!product.image_url && (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">Sin img</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                       </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(product.category)}
                        </Badge>
                       </td>
                      <td className="p-3 text-right font-medium">{formatCurrency(product.price)}</td>
                      <td className="p-3 text-center">
                        <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                          {product.is_active ? "Visible" : "Oculto"}
                        </Badge>
                       </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(product)} title={product.is_active ? "Ocultar" : "Mostrar"}>
                            {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(product)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                            setProductToDelete(product);
                            setDeleteDialogOpen(true);
                          }} title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar producto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Set de espátulas"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "accesorio" && "🔧 Accesorio"}
                    {cat === "libro" && "📚 Libro"}
                    {cat === "utensilio" && "🍴 Utensilio"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del producto..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Precio (MXN) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="299.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Imagen</Label>
              <ImageUpload
                bucket="class-images"
                path="productos"
                onUpload={(url) => setFormData({ ...formData, image_url: url })}
                existingUrl={formData.image_url}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Producto visible en la tienda</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProductos;
