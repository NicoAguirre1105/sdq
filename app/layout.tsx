import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Deportivo Quito",
  description: "Portal de la hinchada de Sociedad Deportivo Quito",
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
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
