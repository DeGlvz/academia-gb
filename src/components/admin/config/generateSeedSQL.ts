import { supabase } from "@/integrations/supabase/client";
import type { ClassWithLessons } from "@/hooks/useClasses";

function esc(val: string): string {
  return val.replace(/'/g, "''");
}

function toSlug(title: string): string {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function generateSeedSQL(classes: ClassWithLessons[]): string {
  const lines: string[] = [
    "-- ══════════════════════════════════════════════════════",
    "-- Seed: Clases y Lecciones — Gaby Bernal en tu Cocina",
    `-- Generado: ${new Date().toISOString()}`,
    "-- ══════════════════════════════════════════════════════",
    "",
  ];

  for (const cls of classes) {
    const slug = cls.slug;
    const models = `'{${(cls.compatible_models || []).join(",")}}'`;
    const isPublic = cls.is_public ? "true" : "false";

    lines.push(`-- Clase: ${cls.title}`);
    lines.push(`INSERT INTO classes (title, slug, description, long_description, category, price, instructor, duration, compatible_models, is_public, is_published)`);
    lines.push(`VALUES ('${esc(cls.title)}', '${esc(slug)}', '${esc(cls.description || "")}', '${esc(cls.long_description || "")}', '${esc(cls.category)}', ${cls.price}, '${esc(cls.instructor)}', '${esc(cls.duration || "")}', ${models}::thermomix_model[], ${isPublic}, true)`);
    lines.push(`ON CONFLICT (slug) DO NOTHING;`);
    lines.push("");

    if (cls.lessons.length > 0) {
      lines.push(`-- Lecciones de: ${cls.title}`);
      for (const lesson of cls.lessons) {
        const videoUrl = lesson.video_url ? `'${esc(lesson.video_url)}'` : "NULL";
        lines.push(
          `INSERT INTO lessons (class_id, title, duration, video_url, sort_order, is_free)` +
          ` VALUES ((SELECT id FROM classes WHERE slug = '${esc(slug)}'), '${esc(lesson.title)}', '${esc(lesson.duration || "")}', ${videoUrl}, ${lesson.sort_order}, ${lesson.is_free});`
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function generateMySQLSeedSQL(classes: ClassWithLessons[]): string {
  const lines: string[] = [
    "-- ══════════════════════════════════════════════════════",
    "-- MySQL Seed: Clases y Lecciones — Gaby Bernal en tu Cocina",
    `-- Generado: ${new Date().toISOString()}`,
    "-- ══════════════════════════════════════════════════════",
    "",
  ];

  for (const cls of classes) {
    const slug = cls.slug;
    const models = JSON.stringify(cls.compatible_models || []);
    const isPublic = cls.is_public ? "1" : "0";

    lines.push(`-- Clase: ${cls.title}`);
    lines.push(`INSERT IGNORE INTO \`classes\` (\`title\`, \`slug\`, \`description\`, \`long_description\`, \`category\`, \`price\`, \`instructor\`, \`duration\`, \`compatible_models\`, \`is_public\`, \`is_published\`)`);
    lines.push(`VALUES ('${esc(cls.title)}', '${esc(slug)}', '${esc(cls.description || "")}', '${esc(cls.long_description || "")}', '${esc(cls.category)}', ${cls.price}, '${esc(cls.instructor)}', '${esc(cls.duration || "")}', '${models}', ${isPublic}, 1);`);
    lines.push("");

    if (cls.lessons.length > 0) {
      lines.push(`-- Lecciones de: ${cls.title}`);
      for (const lesson of cls.lessons) {
        const videoUrl = lesson.video_url ? `'${esc(lesson.video_url)}'` : "NULL";
        lines.push(
          `INSERT INTO \`lessons\` (\`class_id\`, \`title\`, \`duration\`, \`video_url\`, \`sort_order\`, \`is_free\`)` +
          ` VALUES ((SELECT \`id\` FROM \`classes\` WHERE \`slug\` = '${esc(slug)}'), '${esc(lesson.title)}', '${esc(lesson.duration || "")}', ${videoUrl}, ${lesson.sort_order}, ${lesson.is_free ? 1 : 0});`
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}
