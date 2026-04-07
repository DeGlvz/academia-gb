import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbClass = Tables<"classes">;
export type DbLesson = Tables<"lessons">;

export interface ClassWithLessons extends DbClass {
  lessons: DbLesson[];
}

async function fetchClasses(): Promise<ClassWithLessons[]> {
  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!classes || classes.length === 0) return [];

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("*")
    .order("sort_order", { ascending: true });

  if (lessonsError) throw lessonsError;

  return classes.map((c) => ({
    ...c,
    lessons: (lessons || []).filter((l) => l.class_id === c.id),
  }));
}

async function fetchClassBySlug(slug: string): Promise<ClassWithLessons | null> {
  const { data: cls, error } = await supabase
    .from("classes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!cls) return null;

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("*")
    .eq("class_id", cls.id)
    .order("sort_order", { ascending: true });

  if (lessonsError) throw lessonsError;

  return { ...cls, lessons: lessons || [] };
}

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });
}

export function useClassBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["class", slug],
    queryFn: () => fetchClassBySlug(slug!),
    enabled: !!slug,
  });
}
