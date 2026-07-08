"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
import { VITRINA, TIMELINE, PRESIDENTES, BARRAS, type TimelineDot } from "@/lib/historia";

const DOT_COLOR: Record<TimelineDot, string> = {
  dorado: "bg-dorado-escudo",
  azul: "bg-azul-marino",
  rojo: "bg-rojo-bandera",
};

type Tab = "club" | "barras";

export function HistoriaContent() {
  const [tab, setTab] = useState<Tab>("club");

  return (
    <>
      <nav className="bg-[#081f49]">
        <Container className="flex gap-6 px-4.5 font-mono text-xs font-semibold md:px-10">
          <button
            type="button"
            onClick={() => setTab("club")}
            className={`border-b-2 py-3 tracking-wide transition-colors ${
              tab === "club"
                ? "border-dorado-escudo text-dorado-escudo"
                : "border-transparent text-blanco-hueso/55 hover:text-blanco-hueso"
            }`}
          >
            EL CLUB
          </button>
          {/* <button
            type="button"
            onClick={() => setTab("barras")}
            className={`border-b-2 py-3 tracking-wide transition-colors ${
              tab === "barras"
                ? "border-dorado-escudo text-dorado-escudo"
                : "border-transparent text-blanco-hueso/55 hover:text-blanco-hueso"
            }`}
          >
            LAS BARRAS
          </button> */}
        </Container>
      </nav>

      <section className="relative overflow-hidden bg-[#081f49] px-4.5 py-8 md:px-0 md:py-10">
        <div className="absolute inset-0 bg-[url('/img/hero_2.jpg')] bg-cover bg-center md:bg-[url('/img/hero.jpg')]" />
        <div className="absolute inset-0 bg-[#081f49]/80" />
        <Container className="relative px-0 md:px-10">
          {tab === "club" ? (
            <>
              <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:text-[11px]">
                Desde 1940 · Quito, Ecuador
              </p>
              <h1 className="font-display text-[52px] leading-[0.82] text-blanco-hueso md:text-[76px]">
                85 AÑOS DE <span className="text-rojo-bandera">TRADICIÓN</span>
              </h1>
            </>
          ) : (
            <>
              <p className="mb-4 font-mono text-[10px] tracking-[0.18em] text-dorado-escudo uppercase md:text-[11px]">
                El alma de la tribuna
              </p>
              <h1 className="font-display text-[52px] leading-[0.82] text-blanco-hueso md:text-[74px]">
                LAS BARRAS
              </h1>
            </>
          )}
        </Container>
      </section>

      <section className="bg-blanco-hueso">
        <Container className="px-4.5 py-6 md:px-10 md:py-8">
          {tab === "club" ? <ClubContent /> : <BarrasContent />}
        </Container>
      </section>
    </>
  );
}

function ClubContent() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="mb-3.5 font-display text-[28px] text-tinta md:text-[30px]">LA VITRINA</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {VITRINA.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg p-4.5 ${
                item.highlight
                  ? "border-t-[3px] border-dorado-escudo bg-azul-marino"
                  : "border border-azul-marino/12 bg-white"
              }`}
            >
              <div
                className={`font-display text-4xl leading-[0.8] md:text-5xl ${
                  item.highlight ? "text-dorado-escudo" : "text-azul-marino"
                }`}
              >
                {item.value}
              </div>
              <div
                className={`mt-1 font-mono text-[10px] font-semibold md:text-[11px] ${
                  item.highlight ? "text-blanco-hueso/75" : "text-tinta/55"
                }`}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4.5 font-display text-[28px] text-tinta md:text-[30px]">
          LÍNEA DE TIEMPO
        </h2>
        <div className="border-l-2 border-azul-marino/20 pl-6">
          {TIMELINE.map((event, i) => (
            <div key={event.year} className={i < TIMELINE.length - 1 ? "relative mb-5" : "relative"}>
              <span
                className={`absolute -left-[29px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-blanco-hueso ${DOT_COLOR[event.dot]}`}
              />
              <div className="font-display text-[28px] leading-[0.9] text-rojo-bandera">
                {event.year}
              </div>
              <div className="font-body text-base font-bold text-tinta">{event.title}</div>
              <div className="font-body text-sm leading-relaxed text-tinta/60">
                {event.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3.5 font-display text-[28px] text-tinta md:text-[30px]">PRESIDENTES</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {PRESIDENTES.map((p) => (
            <div
              key={p.name}
              className="rounded-lg border border-azul-marino/12 bg-white px-4 py-3"
            >
              <div className="font-body text-sm font-semibold text-tinta">{p.name}</div>
              <div className="font-mono text-[10px] text-tinta/50">{p.period}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarrasContent() {
  return (
    <div className="flex flex-col gap-4">
      {BARRAS.map((barra) => (
        <div
          key={barra.name}
          className="grid grid-cols-1 overflow-hidden rounded-lg border border-azul-marino/12 bg-white md:grid-cols-[200px_1fr]"
        >
          <PhotoPlaceholder label="FOTO BARRA" tone={barra.tone} className="h-[120px] md:h-auto" />
          <div className="p-5">
            <div className="mb-2 font-display text-3xl leading-[0.9] text-tinta md:text-4xl">
              {barra.name.toUpperCase()}
            </div>
            <div className="mb-2.5 font-mono text-[11px] font-semibold text-azul-marino">
              📅 FUNDADA EN {barra.founded}
            </div>
            <p className="font-body text-sm leading-relaxed text-tinta/65">{barra.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
