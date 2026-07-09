"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { removeFromKit } from "@/lib/kit";

export async function deleteSubscriber(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("subscribers")
    .select("kit_subscriber_id")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("subscribers").delete().eq("id", id);
  await removeFromKit(existing?.kit_subscriber_id ?? null);

  revalidatePath("/admin/suscriptores");
}
