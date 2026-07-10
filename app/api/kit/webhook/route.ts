import { NextResponse } from "next/server";
import { confirmSubscriber } from "@/lib/supabase/queries/subscribers";

// Webhook de Kit para el evento "subscriber activate" (el usuario confirmó desde
// el correo de verificación). Marca el correo como confirmado en Supabase.
//
// Se protege con un token compartido en la query (?token=), porque Kit no firma
// los webhooks. Registrar el webhook con esa URL (ver KIT_WEBHOOK_SECRET).
export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.KIT_WEBHOOK_SECRET;
  if (!secret || url.searchParams.get("token") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Kit envía `{ subscriber: { email_address } }`; toleramos variantes por si el
  // payload difiere (email en otra clave o al nivel raíz).
  const b = body as {
    subscriber?: { email_address?: string; email?: string };
    email_address?: string;
    email?: string;
  };
  const email =
    b.subscriber?.email_address ?? b.subscriber?.email ?? b.email_address ?? b.email;
  if (!email) {
    return NextResponse.json({ error: "no email in payload" }, { status: 400 });
  }

  try {
    await confirmSubscriber(email);
  } catch {
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
