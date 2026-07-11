import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";

// Ping periódico para que Supabase no pause el proyecto por inactividad (free
// tier: pausa a los ~7 días sin llamadas). Programado por vercel.json (crons).
// Vercel autentica sus propias invocaciones mandando `Authorization: Bearer
// $CRON_SECRET` cuando esa env var está seteada — no hace falta más que
// verificarla acá.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("seasons").select("id").limit(1);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
