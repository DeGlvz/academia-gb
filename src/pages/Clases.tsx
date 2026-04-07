import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClassCard from "@/components/ClassCard";
import ClassFilters from "@/components/ClassFilters";
import { useClasses } from "@/hooks/useClasses";
import type { ClassCategory, ThermomixModel } from "@/data/classes";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { Loader2 } from "lucide-react";

const Clases = () => {
  const [selectedCategory, setSelectedCategory] = useState<ClassCategory | "Todas">("Todas");
  const [selectedModel, setSelectedModel] = useState<ThermomixModel | "Todos">("Todos");
  const { data: classes = [], isLoading } = useClasses();

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const categoryMatch = selectedCategory === "Todas" || c.category === selectedCategory;
      const modelMatch = selectedModel === "Todos" || (c.compatible_models || []).includes(selectedModel);
      return categoryMatch && modelMatch;
    });
  }, [classes, selectedCategory, selectedModel]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="container px-4 space-y-8">
          <motion.div className="space-y-2" initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Nuestras Clases</h1>
            <p className="text-muted-foreground max-w-lg text-justify">
              Explora todas las clases disponibles. 
Las clases bloqueadas requieren compra para acceder al contenido completo.
            </p>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={1}>
            <ClassFilters
              selectedCategory={selectedCategory}
              selectedModel={selectedModel}
              onCategoryChange={setSelectedCategory}
              onModelChange={setSelectedModel}
            />
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {filteredClasses.length} clase{filteredClasses.length !== 1 ? "s" : ""} encontrada{filteredClasses.length !== 1 ? "s" : ""}
              </p>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                key={`${selectedCategory}-${selectedModel}`}
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {filteredClasses.map((c) => (
                  <motion.div key={c.id} variants={staggerItem}>
                    <ClassCard classData={c} isEnrolled={false} />
                  </motion.div>
                ))}
              </motion.div>

              {filteredClasses.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <p className="text-lg text-muted-foreground">No se encontraron clases con esos filtros.</p>
                  <button
                    onClick={() => { setSelectedCategory("Todas"); setSelectedModel("Todos"); }}
                    className="text-primary hover:underline text-sm"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Clases;
