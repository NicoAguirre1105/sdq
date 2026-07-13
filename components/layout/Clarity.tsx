"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

// No trackear /admin ni /login: es el panel de staff, no tráfico público.
export function Clarity() {
  const pathname = usePathname();
  if (!CLARITY_PROJECT_ID || pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <Script id="clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
    </Script>
  );
}
