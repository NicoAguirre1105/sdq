import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getSiteUrl } from "@/lib/site-url";
import { Clarity } from "@/components/layout/Clarity";
import "./globals.css";

// Fuentes auto-hospedadas (no dependen de fonts.googleapis.com en build/dev).
// Archivos originales: Bebas Neue, IBM Plex Sans e JetBrains Mono (Google Fonts, licencia OFL).
const bebasNeue = localFont({
  src: "./fonts/bebas-neue-400.woff2",
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
});

const ibmPlexSans = localFont({
  src: "./fonts/ibm-plex-sans-variable.woff2",
  weight: "400 700",
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-variable.woff2",
  weight: "400 700",
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = getSiteUrl();
const title = "Mafia Azul Grana | SD Quito";
const description = "Portal de la hinchada de Sociedad Deportivo Quito";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Mafia Azul Grana",
    locale: "es_EC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B2E6B",
};

// JSON-LD (GEO/AEO): entidad de la hinchada para buscadores y motores de
// respuesta con IA. sameAs queda vacío hasta que existan cuentas oficiales de
// redes sociales — agregar ahí cuando se creen.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: "Mafia Azul Grana",
  description,
  url: siteUrl,
  logo: `${siteUrl}/img/logoSDQ_color.png`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-body">
        {children}
        <Clarity />
      </body>
    </html>
  );
}
