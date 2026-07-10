import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { requireAdmin } from "@/lib/auth";
import { getCantico } from "@/lib/canticos";
import { getSiteUrl } from "@/lib/site-url";

const AZUL_MARINO = rgb(0x0b / 255, 0x2e / 255, 0x6b / 255);
const ROJO_BANDERA = rgb(0xc8 / 255, 0x1d / 255, 0x25 / 255);
const TINTA = rgb(0x14 / 255, 0x17 / 255, 0x1c / 255);
const GRIS = rgb(0.45, 0.45, 0.45);

function drawCentered(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  y: number,
  color = TINTA
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - width) / 2, y, size, font, color });
}

// Genera un PDF A4 imprimible con un QR que apunta a Cánticos (o a un cántico
// puntual). Route Handler (no Server Action) porque devuelve un binario para
// descarga; requireAdmin() acá es imprescindible — /api no está bajo el gate de
// proxy.ts como sí lo está /admin/*.
export async function GET(request: Request) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target");
  const slug = searchParams.get("slug");

  let url: string;
  let title: string;
  let caption: string;
  let filename: string;

  if (target === "cantico") {
    const cantico = slug ? getCantico(slug) : undefined;
    if (!cantico) return new Response("Cántico no encontrado", { status: 404 });
    url = `${getSiteUrl()}/canticos/${cantico.slug}`;
    title = cantico.title.toUpperCase();
    caption = "Escanea el código para aprender la letra";
    filename = `qr-${cantico.slug}.pdf`;
  } else {
    url = `${getSiteUrl()}/canticos`;
    title = "CÁNTICOS DE LA HINCHADA";
    caption = "Escanea el código para ver todos los cánticos";
    filename = "qr-canticos.pdf";
  }

  const qrPngBytes = await QRCode.toBuffer(url, {
    type: "png",
    width: 640,
    margin: 1,
    color: { dark: "#0B2E6B", light: "#FFFFFF" },
  });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 en puntos
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: height - 16, width, height: 16, color: ROJO_BANDERA });
  page.drawRectangle({ x: 0, y: 0, width, height: 16, color: AZUL_MARINO });

  const logoBytes = await readFile(path.join(process.cwd(), "public/img/logoSDQ.png"));
  const logo = await pdfDoc.embedPng(logoBytes);
  const logoWidth = 70;
  const logoHeight = (logo.height / logo.width) * logoWidth;
  page.drawImage(logo, {
    x: (width - logoWidth) / 2,
    y: height - 130,
    width: logoWidth,
    height: logoHeight,
  });

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  drawCentered(page, "MAFIA AZUL GRANA", fontBold, 13, height - 165, AZUL_MARINO);

  // Achica el título si no entra en una sola línea (nombres de cántico largos).
  let titleSize = 30;
  while (fontBold.widthOfTextAtSize(title, titleSize) > width - 80 && titleSize > 14) {
    titleSize -= 2;
  }
  drawCentered(page, title, fontBold, titleSize, height - 215, TINTA);

  const qrImage = await pdfDoc.embedPng(qrPngBytes);
  const qrSize = 300;
  const qrY = height / 2 - qrSize / 2 - 20;
  page.drawImage(qrImage, { x: (width - qrSize) / 2, y: qrY, width: qrSize, height: qrSize });

  drawCentered(page, caption, fontRegular, 14, qrY - 34, TINTA);
  drawCentered(page, url, fontRegular, 10, qrY - 56, GRIS);

  const pdfBytes = await pdfDoc.save();

  return new Response(new Uint8Array(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
