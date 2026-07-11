"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export type Tab = {
  key: string;
  label: React.ReactNode;
  href: string;
  active: boolean;
  className: string;
};

// Navegación por tabs con loading state 100% client-side (useTransition +
// router.push), sin loading.tsx/<Suspense> de Server Components: esos dejaban el
// fallback pegado para siempre en este entorno (Next 16.2.10 + Turbopack, bug
// intermitente confirmado). Acá el swap es un solo commit de React al terminar la
// transición, no streaming de RSC — evita ese problema.
export function TabbedContent({
  tabs,
  navClassName,
  ariaLabel,
  prefix,
  suffix,
  fallback,
  children,
}: {
  tabs: Tab[];
  navClassName: string;
  ariaLabel?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fallback: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <nav className={navClassName} aria-label={ariaLabel}>
        {prefix}
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            disabled={isPending}
            aria-current={t.active ? "page" : undefined}
            onClick={() => startTransition(() => router.push(t.href))}
            className={`${t.className} disabled:cursor-wait`}
          >
            {t.label}
          </button>
        ))}
        {suffix}
      </nav>
      {isPending ? fallback : children}
    </>
  );
}
