import { useState } from "react";
import { Save, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminContenido = () => {
  const { toast } = useToast();

  const [hero, setHero] = useState({
    badge: "🍳 Academia Online",
    title: "Cocina con Gaby Bernal en tu cocina",
    subtitle:
      "Domina tu Thermomix con clases exclusivas, recetas paso a paso y herramientas profesionales diseñadas para ti.",
    ctaPrimary: "Ver Clases",
    ctaSecondary: "Conoce más",
  });

  const [cta, setCta] = useState({
    title: "¿Lista para comenzar?",
    subtitle:
      "Únete a cientos de alumnas que ya cocinan como profesionales con su Thermomix.",
    buttonText: "Explorar Clases",
  });

  const [testimonials, setTestimonials] = useState([
    { name: "María López", text: "Las clases de Gaby transformaron mi forma de cocinar con la Thermomix. ¡Increíble!", rating: 5 },
    { name: "Ana García", text: "La Calculadora Panadero Pro es una joya. Mis panes nunca habían quedado tan bien.", rating: 5 },
    { name: "Laura Martínez", text: "Contenido de primera calidad. Cada clase vale completamente la pena.", rating: 5 },
  ]);

  const handleSave = (section: string) => {
    toast({ title: `"${section}" guardado`, description: "Los cambios se aplicarán en la landing." });
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Contenido</h1>
        <p className="text-muted-foreground text-sm mt-1">Edita los textos de la landing page</p>
      </div>

      {/* Hero */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sección Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Badge</Label>
            <Input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Título principal</Label>
            <Input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Textarea value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Botón primario</Label>
              <Input value={hero.ctaPrimary} onChange={(e) => setHero({ ...hero, ctaPrimary: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Botón secundario</Label>
              <Input value={hero.ctaSecondary} onChange={(e) => setHero({ ...hero, ctaSecondary: e.target.value })} />
            </div>
          </div>
          <Button onClick={() => handleSave("Hero")} className="gap-2">
            <Save className="h-4 w-4" /> Guardar Hero
          </Button>
        </CardContent>
      </Card>

      {/* CTA Banner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Banner CTA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={cta.title} onChange={(e) => setCta({ ...cta, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Textarea value={cta.subtitle} onChange={(e) => setCta({ ...cta, subtitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Texto del botón</Label>
            <Input value={cta.buttonText} onChange={(e) => setCta({ ...cta, buttonText: e.target.value })} />
          </div>
          <Button onClick={() => handleSave("Banner CTA")} className="gap-2">
            <Save className="h-4 w-4" /> Guardar CTA
          </Button>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Testimonios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {testimonials.map((t, i) => (
            <div key={i} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Testimonio {i + 1}</span>
                <div className="flex gap-0.5 ml-auto">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 cursor-pointer ${
                        s < t.rating ? "text-primary fill-primary" : "text-muted-foreground"
                      }`}
                      onClick={() => {
                        const updated = [...testimonials];
                        updated[i] = { ...updated[i], rating: s + 1 };
                        setTestimonials(updated);
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nombre</Label>
                  <Input
                    value={t.name}
                    onChange={(e) => {
                      const updated = [...testimonials];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setTestimonials(updated);
                    }}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Texto</Label>
                  <Textarea
                    value={t.text}
                    onChange={(e) => {
                      const updated = [...testimonials];
                      updated[i] = { ...updated[i], text: e.target.value };
                      setTestimonials(updated);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button onClick={() => handleSave("Testimonios")} className="gap-2">
            <Save className="h-4 w-4" /> Guardar Testimonios
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContenido;
