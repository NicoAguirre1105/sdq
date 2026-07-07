import Link from "next/link";
import { BrandCrest } from "@/components/ui/BrandCrest";
import { Container } from "@/components/ui/Container";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { NAV_LINKS } from "@/lib/nav-links";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/8 bg-black">
      <Container className="flex flex-col gap-8 px-4.5 py-8 md:flex-row md:justify-between md:px-10 md:py-10">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-3">
            <BrandCrest size="sm" />
            <span className="font-display text-[19px] leading-[0.9] text-blanco-hueso tracking-[0.06em]">
              DEPORTIVO
              <br />
              <span className="text-dorado-escudo">QUITO</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Logo de la barra, prototipo. Cuando exista el asset real, reemplazar por:
                <Image src="/barras/logo-mafia.png" alt="La Mafia" width={36} height={36} /> */}
            <PhotoPlaceholder
              label="LOGO MAFIA"
              tone="dorado"
              className="h-9 w-9 flex-none rounded-full"
            />
            <span className="font-body text-xs text-blanco-hueso/50">La Mafia Azul y Oro</span>
          </div>
        </div>

        <nav className="flex flex-col gap-3 font-body text-[13px] font-semibold text-blanco-hueso/70 md:items-end">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-blanco-hueso">
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>

      <Container className="flex flex-col gap-1.5 border-t border-white/10 px-4.5 py-6 font-body text-xs text-blanco-hueso/50 md:px-10">
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
