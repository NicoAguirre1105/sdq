import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { confirmSubscriber, deleteSubscriberByEmail } from "@/lib/supabase/queries/subscribers";

// Webhook de Kit, un solo endpoint para dos automatizaciones registradas en Kit:
//  - "Subscribes to a form" (activa) → sin ?event= (default, comportamiento original)
//  - "Unsubscribes" → ?event=unsubscribe
// Ambas automatizaciones apuntan a esta misma URL con el mismo ?token= compartido
// (KIT_WEBHOOK_SECRET), porque Kit no firma los webhooks — es lo único que
// distingue una petición legítima de una cualquiera.
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
    if (url.searchParams.get("event") === "unsubscribe") {
      await deleteSubscriberByEmail(email);
    } else {
      await confirmSubscriber(email);
    }
  } catch {
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }

  revalidatePath("/admin/suscriptores");
  return NextResponse.json({ ok: true });
}
