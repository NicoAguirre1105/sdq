import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 renombró la convención `middleware` a `proxy` (mismo comportamiento).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Todo menos assets estáticos; incluye /admin (protegido) y refresca sesión en el resto.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)",
  ],
};
