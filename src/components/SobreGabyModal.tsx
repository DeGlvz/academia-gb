import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SobreGabyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SobreGabyModal = ({ open, onOpenChange }: SobreGabyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Sobre Gaby Bernal</DialogTitle>
        </DialogHeader>
        <ScrollArea className="pr-4 h-[calc(85vh-80px)]">
          <div className="space-y-4 text-muted-foreground">
            <p>
              Gaby Bernal es una <strong>chef panadera y repostera mexicana</strong> que ha consolidado una carrera destacada como presentadora y líder de Thermomix. Su enfoque profesional combina las técnicas tradicionales de la alta cocina con la tecnología culinaria moderna.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-4">Trayectoria Profesional</h3>
            
            <div className="space-y-2">
              <p>
                <strong>🎓 Formación y Especialidad:</strong> Es chef especializada en panadería y repostería, formación que adquirió tras descubrir su pasión por la cocina a través del uso de herramientas tecnológicas.
              </p>
              <p>
                <strong>🍽️ Experta en Thermomix:</strong> Con más de seis años de experiencia como usuaria y distribuidora, se ha convertido en una de las figuras más reconocidas de la marca, compartiendo tips y recetas para maximizar el uso de este robot de cocina.
              </p>
              <p>
                <strong>👩‍🍳 Educadora Culinaria:</strong> Dirige su propia escuela culinaria y ofrece cursos digitales a través de plataformas como Hotmart, donde enseña desde técnicas básicas hasta procesos avanzados de repostería.
              </p>
              <p>
                <strong>📱 Presencia Digital:</strong> A través de sus canales de YouTube e Instagram, comparte contenido bajo el sello <span className="font-medium">"Gaby Bernal en tu cocina"</span>, enfocado en facilitar la cocina profesional para el hogar.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-4">Perfil Personal</h3>
            <p>
              Antes de dedicarse de lleno a la gastronomía, Gaby Bernal manejaba su propia empresa de artículos promocionales. Su transición al mundo culinario nació de su interés por compartir productos que beneficien la vida cotidiana de las personas, integrando hoy en día incluso el uso de aceites esenciales en su estilo de vida.
            </p>

            <div className="pt-4 border-t">
              <p className="text-sm">
                📸 <a href="https://www.instagram.com/gabybernyanza/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Instagram</a> • 
                🎥 <a href="https://www.youtube.com/c/CocinaconGabyBernalBreadSweet" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">YouTube</a> • 
                🌐 <a href="https://gabybernal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gabybernal.com</a>
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SobreGabyModal;
