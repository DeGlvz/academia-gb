import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClassCategory, ThermomixModel } from "@/data/classes";
import { categories, thermomixModels } from "@/data/classes";

interface ClassFiltersProps {
  selectedCategory: ClassCategory | "Todas";
  selectedModel: ThermomixModel | "Todos";
  onCategoryChange: (cat: ClassCategory | "Todas") => void;
  onModelChange: (model: ThermomixModel | "Todos") => void;
}

const ClassFilters = ({
  selectedCategory,
  selectedModel,
  onCategoryChange,
  onModelChange,
}: ClassFiltersProps) => {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors md:hidden"
      >
        <Filter className="h-4 w-4" />
        {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
      </button>

      <div className={`space-y-4 ${showFilters ? "block" : "hidden md:block"}`}>
        {/* Categories */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Categoría
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategory === "Todas" ? "default" : "outline"}
              onClick={() => onCategoryChange("Todas")}
              className="text-xs font-body h-8"
            >
              Todas
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => onCategoryChange(cat)}
                className="text-xs font-body h-8"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Models */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Modelo Thermomix
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedModel === "Todos" ? "default" : "outline"}
              onClick={() => onModelChange("Todos")}
              className="text-xs font-body h-8"
            >
              Todos
            </Button>
            {thermomixModels.map((model) => (
              <Button
                key={model}
                size="sm"
                variant={selectedModel === model ? "default" : "outline"}
                onClick={() => onModelChange(model)}
                className="text-xs font-body h-8"
              >
                {model}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassFilters;
