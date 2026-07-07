// Cánticos de la hinchada. Contenido estático.
// ponytail: data en TS en vez de MDX — la letra es estructurada (líneas con rol
// llamada/coro), no prosa; un array tipado es más simple que componentes MDX por
// línea. Si algún día se edita desde el admin, mover a Supabase (tabla `canticos`).
//
// Las letras son de EJEMPLO (originales, placeholder) — reemplazar por las reales.

export type CanticoLine = { role: "llamada" | "coro"; text: string };

export type Cantico = {
  slug: string;
  title: string;
  classic: boolean;
  // youtubeUrl: null hasta tener el video oficial de cada cántico
  youtubeUrl: string | null;
  // startSeconds: segundo exacto donde arranca el cántico (algunos videos
  // tienen varias canciones). 0 = desde el inicio.
  startSeconds: number;
  lines: CanticoLine[];
};

// Convierte una URL de YouTube (watch o youtu.be) en URL de embed con arranque
// en el segundo dado. Sin autoplay (es el default de YouTube).
export function youtubeEmbedUrl(url: string, startSeconds = 0): string | null {
  const id = url.match(/[?&]v=([^&]+)/)?.[1] ?? url.match(/youtu\.be\/([^?]+)/)?.[1];
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?rel=0${startSeconds ? `&start=${startSeconds}` : ""}`;
}

const EJEMPLO: CanticoLine[] = [
  { role: "llamada", text: "Vamos todos a cantar," },
  { role: "coro", text: "que la banda va a alentar," },
  { role: "llamada", text: "con el corazón azul," },
  { role: "coro", text: "nunca te voy a dejar." },
  { role: "llamada", text: "Dale, dale, dale azulgrana," },
  { role: "coro", text: "esta es tu hinchada que nunca se va," },
  { role: "llamada", text: "desde la altura te vengo a alentar," },
  { role: "coro", text: "Deportivo Quito, campeón nacional." },
];

const QUITO_CAMPEON: CanticoLine[] = [
  { role: "llamada", text: "Ya llega la hinchada más conocida del mundo entero," },
  { role: "coro", text: "recorriendo caminos, canchas, ciudades con muchos huevos," },
  { role: "llamada", text: "es el Deportivo Quito, fútbol candente con mucho amor," },
  { role: "coro", text: "al que todos conocemos por la Academia del Ecuador." },
  { role: "llamada", text: "Eh, eh, eh, eh!" },
  { role: "coro", text: "Se viene Quito campeón, Quito campeón, Quito campeón." },
  { role: "llamada", text: "Se viene Quito campeón, Quito campeón, Quito campeón." },
  { role: "coro", text: "Se viene Quito campeón, Quito campeón, Quito campeón." },
  { role: "llamada", text: "Se viene Quito campeón, Quito campeón, Quito campeón." },
];

const LINDO_QUITO: CanticoLine[] = [
  { role: "llamada", text: "Lindo Quito de mi vida," },
  { role: "coro", text: "yo te canto con amor," },
  { role: "llamada", text: "Lindo Quito de mi vida," },
  { role: "coro", text: "yo te canto con amor," },
  { role: "llamada", text: "el marido de la Liga," },
  { role: "coro", text: "es campeón del Ecuador," },
  { role: "llamada", text: "el marido de la Liga," },
  { role: "coro", text: "es campeón del Ecuador." },
];

const AMORES_COMO_EL_NUESTRO: CanticoLine[] = [
  { role: "llamada", text: "Amores como el nuestro cada vez hay menos," },
  { role: "coro", text: "te sigo a todos lados, voy donde juguemos," },
  { role: "llamada", text: "amar a la Academia es cosa de locos," },
  { role: "coro", text: "en la buenas y en la malas, yo no te abandono." },
  { role: "llamada", text: "Esos giles de rojo," },
  { role: "coro", text: "van desapareciendo," },
  { role: "llamada", text: "y los putos de Liga," },
  { role: "coro", text: "todavía están corriendo," },
  { role: "llamada", text: "aguante como el nuestro," },
  { role: "coro", text: "nadie lo puede parar." },
  { role: "llamada", text: "Dale, dale, dale AKD!" },
  { role: "coro", text: "Dale, dale, dale AKD!" },
  { role: "llamada", text: "Dale, dale, dale AKD!" },
  { role: "coro", text: "Dale, dale, dale AKD!" },
];
const NADIE_COMPRENDE_ESTE_AMOR: CanticoLine[] = [
  { role: "llamada", text: "Nadie comprende que este amor se vive así," },
  { role: "coro", text: "por eso vengo!" },
  { role: "llamada", text: "Yo te sigo a todos lados, siempre voy," },
  { role: "coro", text: "siempre te aliento." },
  { role: "llamada", text: "Esta tarde no falles, Quito dame una alegría." },
  { role: "coro", text: "La vuelta vamos a dar," },
  { role: "llamada", text: "si yo por vos daría la vida AKD." },
  { role: "coro", text: "Vamo' AKD," },
  { role: "llamada", text: "Vamo', vamo', vamo', vamo' AKD (x2)" },
  { role: "coro", text: "Vamo' la Academia (x2)" },
  { role: "llamada", text: "Vamo' la AKD (x2)" },
  { role: "coro", text: "Vamo' la Academia (x2)" },
];
const VAMO_AKD: CanticoLine[] = [
  { role: "llamada", text: "[INTRO]" },
  { role: "coro", text: "Vamo' la Academia, vamo', vamo', vamo', vamo' la Academia. [x2]" },
  { role: "llamada", text: "Vamo' la AKD, AKD, Academia. [x2]" },
  { role: "coro", text: "Vamo' la AKD, AKD, AKD." },
  { role: "llamada", text: "AKD! AKD! Vamo' vamo la AKD! [x2]" },
  { role: "coro", text: "---" },
  { role: "coro", text: "Tené' que salir campeones este año," },
  { role: "llamada", text: "ustedes poniendo huevos y yo alentando," },
  { role: "coro", text: "porque te quiero tanto," },
  { role: "llamada", text: "otra vuelta yo quiero dar," },
  { role: "coro", text: "Academia este año no me puedes fallar." },
  { role: "llamada", text: "Vamo' AKD! [x4]" },
];
const QUITO_PONGA_HUEVOS: CanticoLine[] = [
  { role: "llamada", text: "Una banda que no le importa el decenso," },
  { role: "coro", text: "no me importa la mentira de los medios," },
  { role: "llamada", text: "alentamos en las buenas y en las malas," },
  { role: "coro", text: "vuelvo loco fumando la marihuana." },
  { role: "llamada", text: "Vamo' la Academia!" },
  { role: "coro", text: "Quito ponga huevos!" },
  { role: "llamada", text: "Que este aor por vos es verdadero," },
  { role: "coro", text: "voy descontrolado con el Quito a todos lados," },
  { role: "llamada", text: "Quito, yo por vos, estoy llevado." },
];

// Video/startSeconds de ejemplo — reemplazar por el oficial de cada cántico.
const YT = "https://www.youtube.com/watch?v=Ws-J40TX-1c";

export const CANTICOS: Cantico[] = [
  { slug: "se-viene-quito-campeon", title: "Se viene Quito campeón", classic: false, youtubeUrl: "https://www.youtube.com/watch?v=Ws-J40TX-1c", startSeconds: 56, lines: QUITO_CAMPEON },
  { slug: "lindo-quito", title: "Lindo Quito de mi vida", classic: true, youtubeUrl: "https://www.youtube.com/watch?v=Ws-J40TX-1c", startSeconds: 148, lines: LINDO_QUITO },
  { slug: "amores-como-el-nuestro", title: "Amores como el nuestro", classic: false, youtubeUrl: "https://www.youtube.com/watch?v=Ws-J40TX-1c", startSeconds: 267, lines: AMORES_COMO_EL_NUESTRO },
  { slug: "nadie-comprende-este-amor", title: "Nadie comprende este amor", classic: false, youtubeUrl: "https://www.youtube.com/watch?v=uPMJFpics6o", startSeconds: 46, lines: NADIE_COMPRENDE_ESTE_AMOR },
  { slug: "vamo-akd", title: "Vamo' AKD", classic: true, youtubeUrl: "https://www.youtube.com/watch?v=uPMJFpics6o", startSeconds: 83, lines: VAMO_AKD },
  { slug: "quito-ponga-huevos", title: "Quito ponga huevos", classic: false, youtubeUrl: 'https://www.youtube.com/watch?v=JUU1gjh_RVA', startSeconds: 55, lines: QUITO_PONGA_HUEVOS },
];

export function getCantico(slug: string): Cantico | undefined {
  return CANTICOS.find((c) => c.slug === slug);
}
