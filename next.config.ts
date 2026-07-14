import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ponytail: "output: standalone" se probó acá para un deploy en cPanel (build
  // mínimo sin devDependencies, por cuota de disco ajustada) — sacado mientras ese
  // deploy está pausado esperando a soporte del hosting. Vercel no lo necesita
  // (arma su propio paquete). Volver a agregarlo si se retoma cPanel.
  // Hay un package-lock.json suelto en el home del usuario (C:\Users\nicof) además del
  // del proyecto; sin esto Turbopack infiere el home como root del workspace y avisa.
  turbopack: {
    root: __dirname,
  },
  images: {
    // Imágenes servidas desde Supabase Storage (buckets públicos).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // El dominio *.vercel.app queda accesible en paralelo al dominio real y
  // Vercel no lo redirige solo — lo mandamos al dominio real para no dejar
  // dos URLs "vivas" del mismo sitio (SEO/confusión de usuarios).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "sdq-cyan.vercel.app" }],
        destination: "https://www.mafiaazulgrana.org/:path*",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "mafia-azul-grana",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Ruteamos los requests del browser a Sentry vía rewrite para evitar que
  // ad-blockers los bloqueen (no hay middleware que choque con esta ruta).
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
