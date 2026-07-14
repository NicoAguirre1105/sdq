// URL pública del sitio, usada para armar links absolutos (correos de Kit, QR de PDFs).
// NEXT_PUBLIC_SITE_URL manda; este fallback es solo por si falta esa env var.
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://mafiaazulgrana.org";
}
