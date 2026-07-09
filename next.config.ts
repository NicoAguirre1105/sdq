import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
