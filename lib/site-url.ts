// URL pública del sitio, usada para armar links absolutos (correos de Kit, QR de PDFs).
// Fallback al dominio de Vercel hasta que mafiaazulgrana.org esté conectado.
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://sdq-cyan.vercel.app";
}
