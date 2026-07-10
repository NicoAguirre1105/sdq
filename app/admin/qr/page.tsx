import { CANTICOS } from "@/lib/canticos";
import { getSiteUrl } from "@/lib/site-url";
import { QrPdfForm } from "@/components/admin/QrPdfForm";

export default function AdminQrPage() {
  return (
    <>
      <header className="border-b border-azul-marino/10 bg-white px-6 py-4">
        <h1 className="font-display text-3xl text-tinta">QR PARA IMPRIMIR</h1>
        <p className="font-mono text-[10px] text-tinta/45">
          Genera un PDF con código QR para volantes o carteles de la barra
        </p>
      </header>

      <div className="px-6 py-6">
        <QrPdfForm
          canticos={CANTICOS.map((c) => ({ slug: c.slug, title: c.title }))}
          siteUrl={getSiteUrl()}
        />
      </div>
    </>
  );
}
