/* ── Thermomix Models ─────────────────────────────────── */
export type ThermomixModel = "TM31" | "TM5" | "TM6" | "TM7";
export const thermomixModels: ThermomixModel[] = ["TM31", "TM5", "TM6", "TM7"];

/* ── Categories ───────────────────────────────────────── */
export type ClassCategory =
  | "Panadería"
  | "Pasta"
  | "Saludable"
  | "Repostería"
  | "Sopas"
  | "Cocina Mexicana"
  | "Básicos"
  | "De Mi Cocina a Tu Cocina";

export const categories: ClassCategory[] = [
  "Básicos",
  "De Mi Cocina a Tu Cocina",
  "Panadería",
  "Pasta",
  "Saludable",
  "Repostería",
  "Sopas",
  "Cocina Mexicana",
];

/* ── Food Preferences ─────────────────────────────────── */
export type FoodPreference =
  | "Panadería"
  | "Repostería"
  | "Básicos"
  | "Cocina Práctica"
  | "Vegano"
  | "Vegetariano"
  | "Keto"
  | "Sin Gluten"
  | "Sin Azúcar";

export const foodPreferences: FoodPreference[] = [
  "Panadería",
  "Repostería",
  "Básicos",
  "Cocina Práctica",
  "Vegano",
  "Vegetariano",
  "Keto",
  "Sin Gluten",
  "Sin Azúcar",
];

/* ── Special public categories ────────────────────────── */
export const publicCategories: ClassCategory[] = [
  "Básicos",
  "De Mi Cocina a Tu Cocina",
];
