"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";

export type SettingsFormState = { error?: string; success?: boolean };

export async function updateHeroHeadline(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();
  const hero_headline = String(formData.get("hero_headline") ?? "").trim();
  if (!hero_headline) return { error: "El título no puede quedar vacío." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ hero_headline })
    .eq("id", true);
  if (error) return { error: "No se pudo guardar el título." };

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
