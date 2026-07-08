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
  { role: "llamada", text: "Esos gi*** del rojo," },
  { role: "coro", text: "van desapareciendo," },
  { role: "llamada", text: "y los pu  *** de Liga," },
  { role: "coro", text: "todavía están corriendo," },
  { role: "llamada", text: "aguante como el nuestro," },
  { role: "coro", text: "nadie lo puede parar." },
  { role: "llamada", text: "Dale, dale, dale AKD! [x4]" },
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
  { role: "coro", text: "Tenés que salir campeón, es este año," },
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
  { role: "coro", text: "vuelvo loco fumando la mar******." },
  { role: "llamada", text: "Vamo' la Academia!" },
  { role: "coro", text: "Quito ponga huevos!" },
  { role: "llamada", text: "Que este amor por vos es verdadero," },
  { role: "coro", text: "voy descontrolado con el Quito a todos lados," },
  { role: "llamada", text: "Quito, yo por vos, estoy llevado." },
];
const QUITEÑO_DE_CORAZÓN: CanticoLine[] = [
  { role: "llamada", text: "Quiteño, quiteño," },
  { role: "coro", text: "quiteño de corazón," },
  { role: "llamada", text: "salta la mafia y dale al tambor," },
  { role: "coro", text: "que el Quito será campeón." },
];
const QUISIERA_VER_A_OTROS: CanticoLine[] = [
  { role: "llamada", text: "La AFE y la Ecuatoriana sobre la mesa," },
  { role: "coro", text: "dijeron que la Academia va a decender," },
  { role: "llamada", text: "la prensa quería que desaparecieras, (ni ver**)" },
  { role: "coro", text: "ven esta hinchada y no lo pueden creer." },
  { role: "llamada", text: "Yo quisiera ver a otros," },
  { role: "coro", text: "unos años en la B," },
  { role: "llamada", text: "y que tengan una banda como la de la AKD," },
  { role: "coro", text: "la que se aguanto la quiebra," },
  { role: "llamada", text: "el decenso y lo demás," },
  { role: "coro", text: "y aunque estemos en las malas," },
  { role: "llamada", text: "cada vez te quiero más." },
];
const COMO_NO_TE_VOY_A_QUERER: CanticoLine[] = [
  { role: "llamada", text: "¿Cómo no te voy a querer?" },
  { role: "coro", text: "¿Cómo no te voy a querer?" },
  { role: "llamada", text: "si eres la Academis del fútbol" },
  { role: "coro", text: "por eso nunca te dejaré." },
  { role: "llamada", text: "---" },
  { role: "coro", text: "Hay que salir campeón." },
  { role: "llamada", text: "Hay que salir campeón." },
  { role: "coro", text: "Vamo' alentemos todos" },
  { role: "llamada", text: "que este año vamos a salir campeón." },
];
const QUITO_MI_VIEJO_AMIGO: CanticoLine[] = [
  { role: "llamada", text: "Quito, mi viejo amigo," },
  { role: "coro", text: "esta campaña volveremo' a estar contigo," },
  { role: "llamada", text: "te alentaremos de corazón," },
  { role: "coro", text: "esta es tu hinchada que te quiere ver campeón." },
  { role: "llamada", text: "No me importa lo que digan," },
  { role: "coro", text: "lo que digan los demás," },
  { role: "llamada", text: "yo te sigo a todas partes," },
  { role: "coro", text: "cada vez te quiero más." },
];
const BANDA_DEL_BRUJO: CanticoLine[] = [
  { role: "llamada", text: "¿Cómo me voy a olvidar," },
  { role: "coro", text: "cuando en la Cocha dimos la vuelta?" },
  { role: "llamada", text: "¿Cómo te vas a olvidar," },
  { role: "coro", text: "si te quedaste a ver toda la fiesta?" },
  { role: "llamada", text: "Conociste un carnaval" },
  { role: "coro", text: "cuando copamos tu gallinero," },
  { role: "llamada", text: "viste a esta hinchada alentar," },
  { role: "coro", text: "como tú nunca podrás hacerlo." },
  { role: "llamada", text: "Ay qué dolor siente tu gente!" },
  { role: "coro", text: "La banda del Brujo presente!!" },
  { role: "llamada", text: "Una vez más, una vez más," },
  { role: "coro", text: "y a vos liguista, te vamo' a reventar." },
];
const Y_DALE_QUITO_DALE: CanticoLine[] = [
  { role: "llamada", text: "Y dale, y dale, y dale, Quito dale! (x2)" },
  { role: "coro", text: "Sí, sí señores, yo soy del Quito," },
  { role: "llamada", text: "sí, sí señores, de corazón," },
  { role: "coro", text: "porque este año desde la plaza," },
  { role: "llamada", text: "desde la plaza," },
  { role: "coro", text: "saldrá el nuevo campeón." },
  { role: "llamada", text: "---" },
  { role: "coro", text: "Dale Quito, dale Quito," },
  { role: "llamada", text: "orgullo nacional," },
  { role: "coro", text: "Desde la plaza eres símbolo sexual," },
  { role: "llamada", text: "Noble la lucha con casta de campeón." },
  { role: "coro", text: "Ejemplo de todo el continente," },
  { role: "llamada", text: "nuestra noble institución." },
  { role: "coro", text: "Otra vez, ejemplo de todo el continente," },
  { role: "llamada", text: "nuestra noble institución." },
  { role: "coro", text: "Y ahora estamos cantando fuerte," },
  { role: "llamada", text: "somos del Quito hasta la muerte" },
  { role: "coro", text: "Y ahora estamos cantando fuerte," },
  { role: "llamada", text: "somos del Quito hasta la muerte" },
  { role: "coro", text: "Hinchada, hinchada, hinchada hay una sola," },
  { role: "llamada", text: "hinchada la del Quito," },
  { role: "coro", text: "las demás son hij*******" },
  { role: "llamada", text: "---" },
  { role: "coro", text: "Yo te quiero AKD," },
  { role: "llamada", text: "a vos te sigo, vos sos mi vida." },
  { role: "coro", text: "Siempre te voy a alentar," },
  { role: "llamada", text: "como lo hicimos cuando eras Argentina." },
  { role: "coro", text: "Vayas a dónde vayas," },
  { role: "llamada", text: "esta es tu hinchada, la que te alienta." },
  { role: "coro", text: "Vamos campeón, vamo' a ganar," },
  { role: "llamada", text: "que la mafia está de fiesta!" },
  { role: "coro", text: "Vamo' campeón, hacélo por tu hinchada," },
  { role: "llamada", text: "la que te sigue en las buenas y en las malas," },
  { role: "coro", text: "vamo' campeón, no falles a tu gente," },
  { role: "llamada", text: "no seas amargo como ese charameco." },
  { role: "coro", text: "Yo soy así, al Quito yo lo quiero," },
  { role: "llamada", text: "vamo' a cag**, UH, a todo el gallinero." },
];

export const CANTICOS: Cantico[] = [
  { slug: "se-viene-quito-campeon", title: "Se viene Quito campeón", classic: false, youtubeUrl: "https://www.youtube.com/watch?v=Ws-J40TX-1c", startSeconds: 56, lines: QUITO_CAMPEON },
  { slug: "lindo-quito", title: "Lindo Quito de mi vida", classic: true, youtubeUrl: "https://www.youtube.com/watch?v=Ws-J40TX-1c", startSeconds: 148, lines: LINDO_QUITO },
  { slug: "amores-como-el-nuestro", title: "Amores como el nuestro", classic: false, youtubeUrl: "https://www.youtube.com/watch?v=Ws-J40TX-1c", startSeconds: 267, lines: AMORES_COMO_EL_NUESTRO },
  { slug: "nadie-comprende-este-amor", title: "Nadie comprende este amor", classic: false, youtubeUrl: "https://www.youtube.com/watch?v=uPMJFpics6o", startSeconds: 46, lines: NADIE_COMPRENDE_ESTE_AMOR },
  { slug: "vamo-akd", title: "Vamo' AKD", classic: true, youtubeUrl: "https://www.youtube.com/watch?v=Nh43hPa-5K4", startSeconds: 187, lines: VAMO_AKD },
  { slug: "quiteno-de-corazon", title: "Quiteño de corazón", classic: true, youtubeUrl: 'https://www.youtube.com/watch?v=Nh43hPa-5K4', startSeconds: 30, lines: QUITEÑO_DE_CORAZÓN },
  { slug: "quito-ponga-huevos", title: "Quito ponga huevos", classic: false, youtubeUrl: 'https://www.youtube.com/watch?v=JUU1gjh_RVA', startSeconds: 55, lines: QUITO_PONGA_HUEVOS },
  { slug: "quisiera-ver-a-otros", title: "Quisiera ver a otros", classic: false, youtubeUrl: 'https://www.youtube.com/watch?v=Nh43hPa-5K4', startSeconds: 115, lines: QUISIERA_VER_A_OTROS },
  { slug: "como-no-te-voy-a-querer", title: "Cómo no te voy a querer", classic: true, youtubeUrl: 'https://www.youtube.com/watch?v=PMfczQKwrEk', startSeconds: 20, lines: COMO_NO_TE_VOY_A_QUERER },
  { slug: "quito-mi-viejo-amigo", title: "Quito, mi viejo amigo", classic: false, youtubeUrl: 'https://www.youtube.com/watch?v=4F_0xH9wPj8', startSeconds: 28, lines: QUITO_MI_VIEJO_AMIGO },
  { slug: "la-banda-del-brujo-presente", title: "La banda del Brujo presente", classic: false, youtubeUrl: 'https://www.youtube.com/watch?v=4F_0xH9wPj8', startSeconds: 217, lines: BANDA_DEL_BRUJO },
  { slug: "y-dale-quito-dale", title: "Y dale, Quito dale", classic: true, youtubeUrl: 'https://www.youtube.com/watch?v=hAFW26InC7w', startSeconds: 376, lines: Y_DALE_QUITO_DALE },
];

export function getCantico(slug: string): Cantico | undefined {
  return CANTICOS.find((c) => c.slug === slug);
}
