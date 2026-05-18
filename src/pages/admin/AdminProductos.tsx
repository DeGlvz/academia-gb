import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, PlusCircle } from "lucide-react";
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
  category_id: string;
  category_name?: string;
  category_icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const AdminProductos = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Product form state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
    is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Category form state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "🔧" });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  
  // Delete dialogs
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Cargar productos y categorías
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_categories!left(name, icon)")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      
      const productsWithCategory = (data || []).map(p => ({
        ...p,
        category_name: p.product_categories?.name,
        category_icon: p.product_categories?.icon,
      }));
      setProducts(productsWithCategory);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({ title: "Error", description: "No se pudieron cargar los productos", variant: "destructive" });
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({ title: "Error", description: "No se pudieron cargar las categorías", variant: "destructive" });
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadProducts(), loadCategories()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Generar slug desde nombre
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // ==================== PRODUCTOS ====================
  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category_id) {
      toast({ title: "Error", description: "Nombre, precio y categoría son requeridos", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        image_url: productForm.image_url,
        category_id: productForm.category_id,
        is_active: productForm.is_active,
        sort_order: editingProduct ? editingProduct.sort_order : products.length,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update({ ...productData, updated_at: new Date().toISOString() })
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "Producto actualizado", description: productForm.name });
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;
        toast({ title: "Producto creado", description: productForm.name });
      }

      setProductDialogOpen(false);
      resetProductForm();
      loadProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        image_url: product.image_url || "",
        category_id: product.category_id || "",
        is_active: product.is_active,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category_id: categories[0]?.id || "",
        is_active: true,
      });
    }
    setProductDialogOpen(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category_id: categories[0]?.id || "",
      is_active: true,
    });
  };

  const toggleProductActive = async (product: Product) => {
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

  const deleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) throw error;
      toast({ title: "Producto eliminado", description: productToDelete.name });
      setDeleteProductDialogOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // ==================== CATEGORÍAS (modal rápido) ====================
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
      return;
    }

    setIsCreatingCategory(true);
    try {
      const slug = generateSlug(newCategory.name);
      const { data, error } = await supabase
        .from("product_categories")
        .insert({
          name: newCategory.name,
          slug,
          icon: newCategory.icon || "🔧",
          sort_order: categories.length,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({ title: "Categoría creada", description: newCategory.name });
      await loadCategories();
      setProductForm({ ...productForm, category_id: data.id });
      setCategoryDialogOpen(false);
      setNewCategory({ name: "", icon: "🔧" });
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Productos</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestiona los productos de la tienda</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => openProductDialog()} className="gap-2">
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
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-8">
                      No hay productos. Crea el primero.
                    </td>
                  </tr>
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
                          {product.category_icon} {product.category_name || "Sin categoría"}
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
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleProductActive(product)} title={product.is_active ? "Ocultar" : "Mostrar"}>
                            {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openProductDialog(product)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                            setProductToDelete(product);
                            setDeleteProductDialogOpen(true);
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
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Ej: Set de espátulas"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <div className="flex gap-2">
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="icon" onClick={() => setCategoryDialogOpen(true)} title="Nueva categoría">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Descripción del producto..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Precio (MXN) *</Label>
              <Input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="299.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Imagen</Label>
              <ImageUpload
                bucket="class-images"
                path="productos"
                onUpload={(url) => setProductForm({ ...productForm, image_url: url })}
                existingUrl={productForm.image_url}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={productForm.is_active}
                onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Producto visible en la tienda</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveProduct} disabled={isSaving}>
              {isSaving ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear categoría (rápido) */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Ej: Accesorio, Libro, Utensilio"
              />
            </div>
            <div className="space-y-2">
              <Label>Icono (emojis)</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  placeholder="🔧"
                  className="w-20 text-center"
                />
                <span className="text-sm text-muted-foreground self-center">Ej: 🔧, 📚, 🍴, 🎁, ⚡</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCategory} disabled={isCreatingCategory}>
              {isCreatingCategory ? "Creando..." : "Crear categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para eliminar producto */}
      <AlertDialog open={deleteProductDialogOpen} onOpenChange={setDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProduct}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProductos;
