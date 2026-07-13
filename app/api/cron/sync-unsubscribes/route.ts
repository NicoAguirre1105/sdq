import { NextResponse } from "next/server";
import { getAllSubscriberEmails, deleteSubscriberByEmail } from "@/lib/supabase/queries/subscribers";
import { getKitSubscriberState } from "@/lib/kit";

// El plan free de Kit no tiene Automations (no hay acción de webhook disponible),
// así que no hay forma de que Kit nos avise en tiempo real cuando alguien usa SU
// link de baja de cumplimiento (uno-clic, no reemplazable — ver /suscripcion/gestionar
// para el link propio, que sí borra al toque). Este cron sincroniza por polling:
// revisa el estado en Kit de cada suscriptor que tenemos en Supabase y borra los
// que ya no están "active" ahí. No es tiempo real (corre 1 vez por día, ver
// vercel.json) pero evita que las dos fuentes diverjan por mucho tiempo.
//
// Mismo criterio de auth que app/api/cron/keep-alive: Vercel manda
// `Authorization: Bearer $CRON_SECRET` en sus propias invocaciones programadas.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const emails = await getAllSubscriberEmails();

  let removed = 0;
  for (const email of emails) {
    const state = await getKitSubscriberState(email);
    if (state && state !== "active") {
      await deleteSubscriberByEmail(email);
      removed++;
    }
  }

  return NextResponse.json({ ok: true, checked: emails.length, removed });
}
