"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { getAllCanticos } from "@/lib/supabase/queries/canticos";
import type { CanticoLine } from "@/lib/canticos";

export type CanticoFormState = { error?: string };

type ParsedCantico = {
  title: string;
  slug: string;
  classic: boolean;
  youtube_url: string | null;
  start_seconds: number;
  lines: CanticoLine[];
  published: boolean;
};

const ROLES = ["llamada", "coro"];

function parse(formData: FormData): ParsedCantico | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  const youtube_url = String(formData.get("youtube_url") ?? "").trim();
  const rawStart = Number(formData.get("start_seconds"));
  const rawLines = String(formData.get("lines") ?? "");

  if (!title) return { error: "El título es obligatorio." };
  if (!slug) return { error: "El slug no puede quedar vacío." };

  let lines: unknown;
  try {
    lines = JSON.parse(rawLines);
  } catch {
    return { error: "Formato de versos inválido." };
  }
  if (!Array.isArray(lines) || lines.length === 0) {
    return { error: "El cántico necesita al menos un verso." };
  }
  const parsedLines: CanticoLine[] = [];
  for (const line of lines) {
    const role = (line as { role?: unknown })?.role;
    const text = String((line as { text?: unknown })?.text ?? "").trim();
    if (!ROLES.includes(String(role)) || !text) {
      return { error: "Cada verso necesita color y texto." };
    }
    parsedLines.push({ role: role as CanticoLine["role"], text });
  }

  return {
    title,
    slug,
    classic: formData.get("classic") === "on",
    youtube_url: youtube_url || null,
    start_seconds: Number.isInteger(rawStart) && rawStart >= 0 ? rawStart : 0,
    lines: parsedLines,
    published: formData.get("published") === "on",
  };
}

export async function createCantico(
  _prev: CanticoFormState,
  formData: FormData
): Promise<CanticoFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();
  const existing = await getAllCanticos();

  const { error } = await supabase
    .from("canticos")
    .insert({ ...parsed, order_index: existing.length });

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un cántico con ese slug." };
    return { error: "No se pudo guardar el cántico." };
  }

  revalidatePath("/admin/canticos");
  revalidatePath("/canticos");
  redirect("/admin/canticos");
}

export async function updateCantico(
  _prev: CanticoFormState,
  formData: FormData
): Promise<CanticoFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador del cántico." };

  const parsed = parse(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("canticos").update(parsed).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un cántico con ese slug." };
    return { error: "No se pudo actualizar el cántico." };
  }

  revalidatePath("/admin/canticos");
  revalidatePath("/canticos");
  redirect("/admin/canticos");
}

export async function deleteCantico(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("canticos").delete().eq("id", id);

  revalidatePath("/admin/canticos");
  revalidatePath("/canticos");
  redirect("/admin/canticos");
}

// Swap de order_index con el vecino inmediato (arriba/abajo) en la lista ordenada.
export async function moveCantico(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const canticos = await getAllCanticos();
  const index = canticos.findIndex((c) => c.id === id);
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || neighborIndex < 0 || neighborIndex >= canticos.length) return;

  const current = canticos[index];
  const neighbor = canticos[neighborIndex];

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("canticos")
    .update({ order_index: neighbor.order_index })
    .eq("id", current.id);
  await supabase
    .from("canticos")
    .update({ order_index: current.order_index })
    .eq("id", neighbor.id);

  revalidatePath("/admin/canticos");
  revalidatePath("/canticos");
}
