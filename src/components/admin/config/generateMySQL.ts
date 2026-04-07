import { dbSchema } from "./dbSchema";

export function generateMySQLScript(): string {
  const lines: string[] = [
    "-- ══════════════════════════════════════════════════════",
    "-- MySQL Schema Export — Gaby Bernal en tu Cocina",
    `-- Generado: ${new Date().toISOString()}`,
    "-- ══════════════════════════════════════════════════════",
    "",
    "SET FOREIGN_KEY_CHECKS = 0;",
    "",
  ];

  for (const table of dbSchema) {
    lines.push(`-- ${table.description}`);
    lines.push(`CREATE TABLE IF NOT EXISTS \`${table.name}\` (`);

    const colLines: string[] = [];
    const pks: string[] = [];
    const fks: string[] = [];
    const uniques: string[] = [];

    for (const col of table.columns) {
      let def = `  \`${col.name}\` ${col.mysqlType}`;
      if (!col.nullable) def += " NOT NULL";
      if (col.default) {
        const d = col.default
          .replace("gen_random_uuid()", "UUID()")
          .replace("now()", "CURRENT_TIMESTAMP")
          .replace("NOW()", "CURRENT_TIMESTAMP")
          .replace("false", "0")
          .replace("true", "1");
        def += ` DEFAULT ${d}`;
      }
      colLines.push(def);
      if (col.pk) pks.push(col.name);
      if (col.fk) {
        const refTable = col.fk.replace("auth.users(id)", "users(id)");
        fks.push(`  FOREIGN KEY (\`${col.name}\`) REFERENCES \`${refTable.split("(")[0]}\`(\`${refTable.split("(")[1]?.replace(")", "") || "id"}\`)`);
      }
    }

    if (pks.length) colLines.push(`  PRIMARY KEY (${pks.map((p) => `\`${p}\``).join(", ")})`);

    if (table.name === "user_roles") uniques.push("  UNIQUE KEY `uq_user_role` (`user_id`, `role`)");
    if (table.name === "enrolled_classes") uniques.push("  UNIQUE KEY `uq_enrollment` (`user_id`, `class_id`)");
    if (table.name === "profiles") uniques.push("  UNIQUE KEY `uq_profile_user` (`user_id`)");
    if (table.name === "classes") uniques.push("  UNIQUE KEY `uq_class_slug` (`slug`)");

    const allLines = [...colLines, ...uniques, ...fks];
    lines.push(allLines.join(",\n"));
    lines.push(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    lines.push("");
  }

  lines.push("SET FOREIGN_KEY_CHECKS = 1;");
  return lines.join("\n");
}
