import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useClasses } from "@/hooks/useClasses";
import { thermomixModels, type ThermomixModel } from "@/data/classes";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ContentType = "all" | "paid" | "free" | "blog";
type SortBy = "relevance" | "price_asc" | "price_desc" | "date";

const ALL_MODELS: ThermomixModel[] = ["TM31", "TM5", "TM6", "TM7"];

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const { data: classes = [], isLoading } = useClasses();
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [selectedModels, setSelectedModels] = useState<ThermomixModel[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("relevance");
  const [results, setResults] = useState<any[]>([]);

  // Filtrar clases de paga (price > 0)
  const paidClasses = classes.filter(c => c.price > 0);
  // Clases gratis (price === 0) excluyendo blogs
  const freeClasses = classes.filter(c => c.price === 0 && c.slug !== "basicos-de-tu-thermomix");

  useEffect(() => {
    if (!open) {
      // Resetear cuando se cierra el modal
      setSearchQuery("");
      setContentType("all");
      setSelectedModels([]);
      setSortBy("relevance");
      setResults([]);
      return;
    }

    let filtered: any[] = [];

    if (contentType === "paid" || contentType === "all") {
      filtered = [...filtered, ...paidClasses.map(c => ({ ...c, type: "paid" }))];
    }
    if (contentType === "free" || contentType === "all") {
      filtered = [...filtered, ...freeClasses.map(c => ({ ...c, type: "free" }))];
    }
    // TODO: Agregar blog posts cuando la tabla exista

    // Filtrar por texto
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por modelos
    if (selectedModels.length > 0) {
      filtered = filtered.filter(c =>
        (c.compatible_models || []).some((m: string) => selectedModels.includes(m as ThermomixModel))
      );
    }

    // Ordenar
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_desc":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "date":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        // relevance - mantener orden original
        break;
    }

    setResults(filtered);
  }, [open, searchQuery, contentType, selectedModels, sortBy, paidClasses, freeClasses]);

  const toggleModel = (model: ThermomixModel) => {
    setSelectedModels(prev =>
      prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setContentType("all");
    setSelectedModels([]);
    setSortBy("relevance");
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "paid": return "💰 De paga";
      case "free": return "🎁 Gratis";
      default: return "📚 Clase";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Búsqueda avanzada</DialogTitle>
          <DialogDescription>
            Encuentra clases, recetas y contenido educativo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Buscador principal */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de contenido */}
            <div className="space-y-2">
              <Label>Tipo de contenido</Label>
              <RadioGroup value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">Todo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label htmlFor="paid">Clases de paga</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free">Clases gratis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="blog" id="blog" />
                    <Label htmlFor="blog">Blog (Próximamente)</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Ordenar */}
            <div className="space-y-2">
              <Label>Ordenar por</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevancia</SelectItem>
                  <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="date">Más recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Modelos Thermomix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Modelos compatibles</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedModels(selectedModels.length === ALL_MODELS.length ? [] : [...ALL_MODELS])}
                className="text-xs"
              >
                {selectedModels.length === ALL_MODELS.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-4">
              {ALL_MODELS.map((model) => (
                <div key={model} className="flex items-center space-x-2">
                  <Checkbox
                    id={`search-model-${model}`}
                    checked={selectedModels.includes(model)}
                    onCheckedChange={() => toggleModel(model)}
                  />
                  <Label htmlFor={`search-model-${model}`} className="cursor-pointer">
                    {model}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {(searchQuery || contentType !== "all" || selectedModels.length > 0 || sortBy !== "relevance") && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3 w-3" /> Limpiar filtros
              </Button>
            </div>
          )}

          {/* Resultados */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {results.length} resultado{results.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {results.map((result) => (
                <Link
                  key={result.id}
                  to={`/clases/${result.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{result.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {result.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-muted">
                        {getTypeLabel(result.type)}
                      </span>
                      {result.price > 0 && (
                        <span className="text-sm font-semibold text-primary">
                          ${result.price}
                        </span>
                      )}
                      {result.price === 0 && result.type !== "blog" && (
                        <span className="text-sm font-semibold text-green-600">Gratis</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {results.length === 0 && !isLoading && (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron resultados. Intenta con otros filtros.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
