// Reemplaza el fondo del hero que antes era background-image por CSS
// (bg-[url(...)]): el preload scanner del navegador no descubre
// background-image hasta parsear el CSS, mientras que <img>/<picture> en el
// HTML se descubre al instante. Esta imagen suele ser el elemento más grande
// de la página (LCP), así que ese retraso de descubrimiento le pegaba directo
// al Largest Contentful Paint.
export function HeroBackground() {
  return (
    <picture className="absolute inset-0 block">
      <source media="(min-width: 768px)" srcSet="/img/hero.jpg" />
      <img
        src="/img/hero_2.jpg"
        alt=""
        fetchPriority="high"
        loading="eager"
        decoding="async"
        className="size-full object-cover object-center"
      />
    </picture>
  );
}
