import { NextResponse } from "next/server";
import { getSubscribersForSync, deleteSubscriberByEmail, confirmSubscriber } from "@/lib/supabase/queries/subscribers";
import { getKitSubscriberState } from "@/lib/kit";

// El plan free de Kit no tiene Automations, así que ninguno de los dos webhooks
// que Kit debería disparar (confirmación de doble opt-in, baja de cumplimiento vía
// SU link uno-clic — ver app/api/kit/webhook/route.ts) se registra de verdad: no
// hay forma de darle esa acción desde el dashboard. Sin esto, un suscriptor que ya
// está "active" en Kit se queda `confirmed = false` en Supabase para siempre, y uno
// que se dio de baja en Kit se queda en la tabla igual.
//
// Este cron sincroniza por polling una vez al día (ver vercel.json): por cada
// suscriptor pendiente en Supabase, consulta su estado real en Kit y reconcilia en
// la dirección que corresponda. Un solo fetch a Kit por email — antes eran dos
// crons separados que hubieran repreguntado lo mismo para cada suscriptor pendiente.
// No es tiempo real a propósito — alcanza con que las dos fuentes no diverjan por
// más de un día, y Hobby de Vercel limita a 2 cron jobs por proyecto (ya usado por
// este + keep-alive), así que sumar un tercero no era gratis.
//
// Mismo criterio de auth que app/api/cron/keep-alive: Vercel manda
// `Authorization: Bearer $CRON_SECRET` en sus propias invocaciones programadas.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const subscribers = await getSubscribersForSync();

  let confirmed = 0;
  let removed = 0;
  for (const { email, confirmed: alreadyConfirmed } of subscribers) {
    const state = await getKitSubscriberState(email);
    if (state && state !== "active") {
      await deleteSubscriberByEmail(email);
      removed++;
    } else if (state === "active" && !alreadyConfirmed) {
      await confirmSubscriber(email);
      confirmed++;
    }
  }

  return NextResponse.json({ ok: true, checked: subscribers.length, confirmed, removed });
}
