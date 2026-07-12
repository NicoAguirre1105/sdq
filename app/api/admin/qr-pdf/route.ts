import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
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

// Parte un texto en líneas que entran en maxWidth, cortando por palabra.
function wrapLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Copy que promociona el sitio completo — va en los 3 flyers, debajo de lo que ya
// explica cada uno puntualmente (cánticos o el cántico elegido).
const SITE_QR_BODY =
  "En el sitio también encuentras noticias de la MAG, entradas para los partidos, " +
  "promociones de la tienda, la tabla de posiciones al día, el calendario de " +
  "próximas fechas e información del club.";

// Genera un PDF A4 imprimible con un QR que apunta al sitio completo, a Cánticos,
// o a un cántico puntual. Route Handler (no Server Action) porque devuelve un
// binario para descarga; requireAdmin() acá es imprescindible — /api no está bajo
// el gate de proxy.ts como sí lo está /admin/*.
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
  } else if (target === "home") {
    url = getSiteUrl();
    title = "TODO SOBRE LA MAFIA, EN UN SOLO LUGAR";
    caption = "Escanea el código y entra a nuestro sitio web";
    filename = "qr-sitio.pdf";
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
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 en puntos
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: height - 16, width, height: 16, color: ROJO_BANDERA });
  page.drawRectangle({ x: 0, y: 0, width, height: 16, color: AZUL_MARINO });

  // Lockup de marca: escudo Quito (color, va directo sobre blanco) + divisor +
  // logo MAG (mag.svg es blanco sin fondo — necesita un chip oscuro atrás para
  // verse, mismo criterio que BrandLockup.tsx en el sitio). pdf-lib no rasteriza
  // SVG; sharp (ya instalado como dependencia de next/image) lo convierte a PNG.
  //
  // Fuentes: .ttf, no los .woff2 que usa next/font/local en app/layout.tsx. pdf-lib
  // escribe los bytes del font tal cual dentro del PDF (FontFile2) — con el woff2
  // (comprimido) el resultado es un font "inválido" que algunos visores (Chrome,
  // Adobe) muestran como puntos en vez de letras, aunque el texto siga siendo
  // seleccionable/extraíble (pdftotext/MuPDF lo toleran con un warning). Los .ttf
  // son los mismos woff2 descomprimidos una sola vez con fonttools+brotli
  // (`TTFont(x); font.flavor = None; font.save(y)`) — no se regeneran en cada
  // request. Si se actualiza algún font en app/fonts/*.woff2, repetir la conversión.
  const [logoBytes, magSvgBytes, displayFontBytes, bodyFontBytes, monoFontBytes] =
    await Promise.all([
      readFile(path.join(process.cwd(), "public/img/logoSDQ.png")),
      readFile(path.join(process.cwd(), "public/img/mag.svg")),
      readFile(path.join(process.cwd(), "app/fonts/bebas-neue-400.ttf")),
      readFile(path.join(process.cwd(), "app/fonts/ibm-plex-sans-variable.ttf")),
      readFile(path.join(process.cwd(), "app/fonts/jetbrains-mono-variable.ttf")),
    ]);
  const magPngBytes = await sharp(magSvgBytes).resize({ width: 800 }).png().toBuffer();

  const quitoLogo = await pdfDoc.embedPng(logoBytes);
  const magLogo = await pdfDoc.embedPng(magPngBytes);

  const quitoH = 55;
  const quitoW = quitoH * (quitoLogo.width / quitoLogo.height);
  const chipH = 55;
  const chipPadY = 10;
  const chipPadX = 14;
  const magH = chipH - chipPadY * 2;
  const magW = magH * (magLogo.width / magLogo.height);
  const chipW = magW + chipPadX * 2;
  const gap = 16;

  const lockupWidth = quitoW + gap + 1 + gap + chipW;
  const lockupX = (width - lockupWidth) / 2;
  const lockupY = height - 140; // y = base de ambos elementos (coords pdf-lib: origen abajo-izq)

  page.drawImage(quitoLogo, { x: lockupX, y: lockupY, width: quitoW, height: quitoH });

  const dividerX = lockupX + quitoW + gap;
  page.drawLine({
    start: { x: dividerX, y: lockupY },
    end: { x: dividerX, y: lockupY + quitoH },
    thickness: 1,
    color: rgb(0.75, 0.75, 0.75),
  });

  const chipX = dividerX + gap;
  page.drawRectangle({ x: chipX, y: lockupY, width: chipW, height: chipH, color: AZUL_MARINO });
  page.drawImage(magLogo, {
    x: chipX + chipPadX,
    y: lockupY + chipPadY,
    width: magW,
    height: magH,
  });

  // Mismas 3 tipografías que el sitio (app/layout.tsx): Bebas Neue para títulos
  // grandes (font-display), IBM Plex Sans para texto de lectura (font-body),
  // JetBrains Mono para etiquetas chicas/URLs (font-mono).
  const fontDisplay = await pdfDoc.embedFont(displayFontBytes);
  const fontBody = await pdfDoc.embedFont(bodyFontBytes);
  const fontMono = await pdfDoc.embedFont(monoFontBytes);

  drawCentered(page, "MAFIA AZUL GRANA", fontMono, 12, lockupY - 35, AZUL_MARINO);

  // Achica el título si no entra en una sola línea (nombres de cántico largos).
  let titleSize = 34;
  while (fontDisplay.widthOfTextAtSize(title, titleSize) > width - 80 && titleSize > 16) {
    titleSize -= 2;
  }
  drawCentered(page, title, fontDisplay, titleSize, lockupY - 85, TINTA);

  const qrImage = await pdfDoc.embedPng(qrPngBytes);
  const qrSize = 300;
  const qrY = height / 2 - qrSize / 2 - 20;
  page.drawImage(qrImage, { x: (width - qrSize) / 2, y: qrY, width: qrSize, height: qrSize });

  drawCentered(page, caption, fontBody, 14, qrY - 34, TINTA);

  // Párrafo con lo que ya explicamos que hay en el sitio, sumado al caption
  // puntual de arriba (que sigue siendo distinto para cada target).
  const bodyLines = wrapLines(SITE_QR_BODY, fontBody, 11, width - 140);
  const lineHeight = 16;
  bodyLines.forEach((line, i) => {
    drawCentered(page, line, fontBody, 11, qrY - 64 - i * lineHeight, TINTA);
  });
  const urlY = qrY - 64 - bodyLines.length * lineHeight - 12;

  drawCentered(page, url, fontMono, 10, urlY, GRIS);

  const pdfBytes = await pdfDoc.save();

  return new Response(new Uint8Array(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
