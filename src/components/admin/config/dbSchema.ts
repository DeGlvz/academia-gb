/* ── Schema definition (mirrors the actual DB) ── */
export interface Column {
  name: string;
  type: string;
  mysqlType: string;
  nullable: boolean;
  default?: string;
  pk?: boolean;
  fk?: string;
}

export interface TableSchema {
  name: string;
  description: string;
  columns: Column[];
}

export const dbSchema: TableSchema[] = [
  {
    name: "user_roles",
    description: "Roles de usuarios del sistema (admin, moderator, user)",
    columns: [
      { name: "id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, default: "gen_random_uuid()", pk: true },
      { name: "user_id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, fk: "auth.users(id)" },
      { name: "role", type: "app_role", mysqlType: "ENUM('admin','moderator','user')", nullable: false },
    ],
  },
  {
    name: "profiles",
    description: "Perfiles de usuarios con preferencias y modelo de Thermomix",
    columns: [
      { name: "id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, default: "gen_random_uuid()", pk: true },
      { name: "user_id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, fk: "auth.users(id)" },
      { name: "full_name", type: "TEXT", mysqlType: "VARCHAR(255)", nullable: true },
      { name: "avatar_url", type: "TEXT", mysqlType: "VARCHAR(500)", nullable: true },
      { name: "thermomix_model", type: "thermomix_model", mysqlType: "ENUM('TM31','TM5','TM6','TM7')", nullable: true },
      { name: "food_preferences", type: "food_preference[]", mysqlType: "JSON", nullable: true, default: "'{}'" },
      { name: "created_at", type: "TIMESTAMPTZ", mysqlType: "DATETIME", nullable: false, default: "now()" },
      { name: "updated_at", type: "TIMESTAMPTZ", mysqlType: "DATETIME", nullable: false, default: "now()" },
    ],
  },
  {
    name: "classes",
    description: "Catálogo de clases de cocina con Thermomix",
    columns: [
      { name: "id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, default: "gen_random_uuid()", pk: true },
      { name: "title", type: "TEXT", mysqlType: "VARCHAR(255)", nullable: false },
      { name: "slug", type: "TEXT", mysqlType: "VARCHAR(255)", nullable: false },
      { name: "description", type: "TEXT", mysqlType: "TEXT", nullable: true },
      { name: "long_description", type: "TEXT", mysqlType: "TEXT", nullable: true },
      { name: "category", type: "TEXT", mysqlType: "VARCHAR(100)", nullable: false },
      { name: "price", type: "NUMERIC(10,2)", mysqlType: "DECIMAL(10,2)", nullable: false, default: "0" },
      { name: "image_url", type: "TEXT", mysqlType: "VARCHAR(500)", nullable: true },
      { name: "video_url", type: "TEXT", mysqlType: "VARCHAR(500)", nullable: true },
      { name: "pdf_url", type: "TEXT", mysqlType: "VARCHAR(500)", nullable: true },
      { name: "instructor", type: "TEXT", mysqlType: "VARCHAR(255)", nullable: false, default: "'Gaby Bernal'" },
      { name: "duration", type: "TEXT", mysqlType: "VARCHAR(50)", nullable: true },
      { name: "compatible_models", type: "thermomix_model[]", mysqlType: "JSON", nullable: true, default: "'{TM5,TM6,TM7}'" },
      { name: "is_public", type: "BOOLEAN", mysqlType: "TINYINT(1)", nullable: false, default: "false" },
      { name: "is_published", type: "BOOLEAN", mysqlType: "TINYINT(1)", nullable: false, default: "true" },
      { name: "created_at", type: "TIMESTAMPTZ", mysqlType: "DATETIME", nullable: false, default: "now()" },
      { name: "updated_at", type: "TIMESTAMPTZ", mysqlType: "DATETIME", nullable: false, default: "now()" },
    ],
  },
  {
    name: "lessons",
    description: "Lecciones individuales dentro de cada clase",
    columns: [
      { name: "id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, default: "gen_random_uuid()", pk: true },
      { name: "class_id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, fk: "classes(id)" },
      { name: "title", type: "TEXT", mysqlType: "VARCHAR(255)", nullable: false },
      { name: "duration", type: "TEXT", mysqlType: "VARCHAR(50)", nullable: true },
      { name: "video_url", type: "TEXT", mysqlType: "VARCHAR(500)", nullable: true },
      { name: "sort_order", type: "INT", mysqlType: "INT", nullable: false, default: "0" },
      { name: "is_free", type: "BOOLEAN", mysqlType: "TINYINT(1)", nullable: false, default: "false" },
      { name: "created_at", type: "TIMESTAMPTZ", mysqlType: "DATETIME", nullable: false, default: "now()" },
    ],
  },
  {
    name: "enrolled_classes",
    description: "Registro de accesos/inscripciones de alumnos a clases",
    columns: [
      { name: "id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, default: "gen_random_uuid()", pk: true },
      { name: "user_id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, fk: "auth.users(id)" },
      { name: "class_id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, fk: "classes(id)" },
      { name: "enrolled_at", type: "TIMESTAMPTZ", mysqlType: "DATETIME", nullable: false, default: "now()" },
    ],
  },
  {
    name: "purchase_attempts",
    description: "Intentos de compra vía WhatsApp para seguimiento de interés",
    columns: [
      { name: "id", type: "UUID", mysqlType: "CHAR(36)", nullable: false, default: "gen_random_uuid()", pk: true },
      { name: "user_id", type: "UUID", mysqlType: "CHAR(36)", nullable: true, fk: "auth.users(id)" },
      { name: "session_id", type: "TEXT", mysqlType: "VARCHAR(255)", nullable: true },
      { name: "items", type: "JSONB", mysqlType: "JSON", nullable: false, default: "'[]'" },
      { name: "total", type: "NUMERIC(10,2)", mysqlType: "DECIMAL(10,2)", nullable: false, default: "0" },
      { name: "created_at", type: "TIMESTAMPTZ", mysqlType: "DATETIME", nullable: false, default: "NOW()" },
    ],
  },
];
