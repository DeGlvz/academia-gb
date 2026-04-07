import { motion } from "framer-motion";
import { slideInLeft, slideInRight, scaleIn } from "@/lib/animations";
import tm7Img from "@/assets/thermomix-tm7.webp";

const CompatibilitySection = () => (
  <section className="py-14 md:py-20">
    <div className="container px-4">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          className="order-2 md:order-1"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={slideInLeft}
        >
          <img
            src={tm7Img}
            alt="Thermomix TM7"
            className="w-full max-w-lg mx-auto rounded-2xl shadow-xl"
          />
        </motion.div>
        <motion.div
          className="order-1 md:order-2 space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={slideInRight}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Compatible con <span className="text-primary">TM5, TM6 y TM7</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Nuestras clases están diseñadas para todos los modelos de Thermomix.
            Selecciona tu modelo y accede a recetas optimizadas para tu equipo.
          </p>
          <div className="flex flex-wrap gap-3">
            {["TM5", "TM6", "TM7"].map((model, i) => (
              <motion.span
                key={model}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold border"
                variants={scaleIn}
                custom={i}
              >
                {model}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default CompatibilitySection;
