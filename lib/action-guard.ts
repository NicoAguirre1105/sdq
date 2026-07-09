// Envuelve una server action usada con useActionState para que, si la llamada al
// servidor falla por transporte (sin internet, servidor caído), en vez de que Next
// muestre su overlay de error, el form reciba un estado con `error` y lo muestre en
// el toast como cualquier otra validación.
//
// redirect()/notFound() lanzan errores de control de flujo de Next (con `digest`) que
// DEBEN propagarse para que la navegación ocurra — esos se relanzan, no se tragan.

type ErrorState = { error?: string };

const OFFLINE_MESSAGE =
  "No se pudo conectar con el servidor. Revisa tu conexión e intentá de nuevo.";

function isNextControlFlowError(err: unknown): boolean {
  const digest = (err as { digest?: unknown })?.digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
  );
}

export function withOfflineGuard<S extends ErrorState>(
  action: (prev: S, formData: FormData) => S | Promise<S>
): (prev: S, formData: FormData) => Promise<S> {
  return async (prev, formData) => {
    try {
      return await action(prev, formData);
    } catch (err) {
      if (isNextControlFlowError(err)) throw err;
      return { error: OFFLINE_MESSAGE } as S;
    }
  };
}
