import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/client";

// Ping periódico para que Supabase no pause el proyecto por inactividad (free
// tier: pausa a los ~7 días sin llamadas). Programado por vercel.json (crons).
// Vercel autentica sus propias invocaciones mandando `Authorization: Bearer
// $CRON_SECRET` cuando esa env var está seteada — no hace falta más que
// verificarla acá.
//
// De paso pinguea el Supabase de otro proyecto personal (no deployado en
// Vercel, sin cron propio) para que tampoco se pause — reutiliza esta misma
// corrida diaria en vez de sumar otro cron.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const { error: sdqError } = await supabase.from("seasons").select("id").limit(1);

  const otherClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_AC!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_AC!
  );
  const { error: otherError } = await otherClient.from("empresas").select("id").limit(1);

  if (sdqError || otherError) {
    return NextResponse.json(
      { ok: false, sdqError: sdqError?.message, otherError: otherError?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
