import Link from "next/link";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS } from "@/lib/nav-links";

export function Footer() {

  return (
    <footer className="border-t border-white/8 bg-black">
      <Container className="flex flex-col items-center gap-6 px-4.5 py-8 text-center md:px-10 md:py-10">
        <Link href="/" className="flex items-center">
          <BrandLockup
            magSrc="/img/mag_large.svg"
            magWidth={2799}
            magHeight={384}
            logoClassName="h-10 md:h-12"
            magClassName="h-6 md:h-7"
          />
        </Link>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-body text-[13px] font-semibold text-blanco-hueso/70">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-blanco-hueso">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/mafia_azul_grana/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-blanco-hueso/70 transition-colors hover:text-blanco-hueso"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/MafiaAzulGranaQficial"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-blanco-hueso/70 transition-colors hover:text-blanco-hueso"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@mafiaazulgranaoficial?_r=1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-blanco-hueso/70 transition-colors hover:text-blanco-hueso"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v6.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
            </svg>
          </a>
        </div>
      </Container>

      <Container className="flex flex-col items-center gap-1.5 border-t border-white/10 px-4.5 py-6 text-center font-body text-xs text-blanco-hueso/50 md:px-10">
        <p>
          © 2026 Mafia Azul Grana. Todos los derechos reservados.{" "}
          <Link
            href="/terminos/servicio"
            className="underline transition-colors hover:text-blanco-hueso"
          >
            Términos del servicio
          </Link>{" "}
          ·{" "}
          <Link href="/terminos" className="underline transition-colors hover:text-blanco-hueso">
            Términos de la suscripción
          </Link>
        </p>
        <p>
          Sitio web creado por{" "}
          <a
            href="https://www.linkedin.com/in/nicolas-aguirre-5a2a483ab/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blanco-hueso/70 underline transition-colors hover:text-blanco-hueso"
          >
            Nicolas Aguirre
          </a>
        </p>
        <p>v1.2.0</p>
      </Container>
    </footer>
  );
}
