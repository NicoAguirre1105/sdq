import Link from "next/link";
import { BrandLockup } from "@/components/ui/BrandLockup";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS } from "@/lib/nav-links";

export function Footer() {
  const year = new Date().getFullYear();

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
      </Container>

      <Container className="flex flex-col items-center gap-1.5 border-t border-white/10 px-4.5 py-6 text-center font-body text-xs text-blanco-hueso/50 md:px-10">
        <p>© {year} Sociedad Deportivo Quito. Todos los derechos reservados.</p>
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
      </Container>
    </footer>
  );
}
