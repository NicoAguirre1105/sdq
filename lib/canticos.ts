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

// Extrae el ID de video de una URL de YouTube (watch o youtu.be). El embed lo arma
// el componente cliente `YouTubeEmbed` vía la IFrame API (para poder apagar los
// subtítulos, que no se pueden desactivar solo con params de URL).
export function youtubeId(url: string): string | null {
  return url.match(/[?&]v=([^&]+)/)?.[1] ?? url.match(/youtu\.be\/([^?]+)/)?.[1] ?? null;
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

const ENAMORADO_ESTOY_DE_VOS: CanticoLine[] = [
  { role: "llamada", text: "Ésta es la pasión azul y grana," },
  { role: "coro", text: "una fiesta que no se compara," },
  { role: "llamada", text: "la que está en las buenas y en las malas," },
  { role: "coro", text: "la que la alienta de verdad." },
  { role: "llamada", text: "Pero es difícil explicarlo," },
  { role: "coro", text: "con el Quito voy a todos lados," },
  { role: "llamada", text: "las cosas que hice por la Academia" },
  { role: "coro", text: "por nadie lo hice jamás." },
  { role: "llamada", text: "Enamorado estoy de vos," },
  { role: "coro", text: "desde hace ya mucho tiempo." },
  { role: "llamada", text: "Y aunque vos no salgas campeón," },
  { role: "coro", text: "no abandonó el sentimiento." },
  { role: "llamada", text: "Borracho te voy a seguir," },
  { role: "coro", text: "jamás te abandonaría." },
  { role: "llamada", text: "La mafia te va a acompañar," },
  { role: "coro", text: "Quito por toda la vida!" },
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
const GORILA_ESPERATE_UN_POQUITO: CanticoLine[] = [
  { role: "llamada", text: "Gorila esperáte un poquito más," },
  { role: "coro", text: "que ya nos vamos a encontrar." },
  { role: "llamada", text: "Gorila esperáte un poquito más," },
  { role: "coro", text: "que ya nos vamos a encontrar." },
  { role: "llamada", text: "Los del rojo tienen miedo," },
  { role: "coro", text: "porque saben que esta banda tiene huevos," },
  { role: "llamada", text: "a los de Liga los corremos" },
  { role: "coro", text: "y a los del rojo los vamo' a correr de nuevo." },
];
const VAMO_VAMO_LA_AZULGRANA: CanticoLine[] = [
  { role: "llamada", text: "Vamo', vamo' la azulgrana," },
  { role: "coro", text: "yo te sigo de la plaza," },
  { role: "llamada", text: "de cabeza a donde vayas," },
  { role: "coro", text: "en las buenas y en las malas." },
  { role: "llamada", text: "Tu hinchada que vino descontrolada," },
  { role: "coro", text: "no te deja de alentar," },
  { role: "llamada", text: " hasta el final." },
  { role: "coro", text: "Y a mí no me importa nada," },
  { role: "llamada", text: "si son todos noveleros," },
  { role: "coro", text: "son amargos los toreros," },
  { role: "llamada", text: "un velorio el astillero." },
  { role: "coro", text: "fsdfsdfsdfsdf" },
  { role: "llamada", text: "sdfsdfsfsdfsdf" },
  { role: "coro", text: "Vamo' AKD, vamo' a ganar," },
  { role: "llamada", text: "donde jugués yo voy a estar," },
  { role: "coro", text: "te alentaré de corazón," },
  { role: "llamada", text: "te quiero ver salir camepón." },
];
const BANDA_DE_LOS_PLACEROS: CanticoLine[] = [
  { role: "llamada", text: "Ésta es la banda loca de los placeros," },
  { role: "coro", text: "la que le sigue al Quito donde juguemos," },
  { role: "llamada", text: "la que deja la vida por los colores," },
  { role: "coro", text: "la que le pide aguante a los jugadores" },
  { role: "llamada", text: "para ser campeones." },
];
const HOY_ES_CUANDO_MAS_TE_AMO: CanticoLine[] = [
  { role: "llamada", text: "EWFWEFWEFWE" },
  { role: "coro", text: "wefwefwfwefwe" },
  { role: "llamada", text: "lo único que sigue intacto" },
  { role: "coro", text: "es mi amor por ti." },
  { role: "llamada", text: "Por las alegrías que pasamos" },
  { role: "coro", text: "y por el amor que te juré," },
  { role: "llamada", text: "yo soy hincha de la AKD." },
  { role: "coro", text: "Los huevos que tiene esta hinchada," },
  { role: "llamada", text: "esos pu*** los quieren tener." },
  { role: "coro", text: "Hoy es cuando más te amo!" },
  { role: "llamada", text: "En las malas estoy junto con vos," },
  { role: "coro", text: "por eso somos la más fiel," },
  { role: "llamada", text: "quiero morir aquí a tu lado" },
  { role: "coro", text: "porque juntos vamos a volver." },
];
const QUITO_CORAZON: CanticoLine[] = [
  { role: "llamada", text: "Ooohhhhhhh!" },
  { role: "coro", text: "Quito corazón" },
  { role: "llamada", text: "Corazón, corazón," },
  { role: "coro", text: "Quito corazón." },
  { role: "llamada", text: "--- (variante)" },
  { role: "coro", text: "Ooohhhhhhh!" },
  { role: "llamada", text: "Vamos a volver," },
  { role: "coro", text: "a volver, a volver," },
  { role: "llamada", text: "vamos a volver." },
  { role: "llamada", text: "--- (variante)" },
  { role: "coro", text: "Ooohhhhhhh!" },
  { role: "llamada", text: "Somos la más fiel," },
  { role: "coro", text: "la más fiel, la más fiel," },
  { role: "llamada", text: "somos la más fiel." },
];
const A_VER_LOS_JUGADORES: CanticoLine[] = [
  { role: "llamada", text: "A ver, a ver los jugadores," },
  { role: "coro", text: "a ver, a ver si pueden oír," },
  { role: "llamada", text: "por la camiseta del Quito" },
  { role: "coro", text: "vamos a matar o morir." },
];
const COLORES_DE_LA_CAPITAL: CanticoLine[] = [
  { role: "llamada", text: "Quito, tú eres mi vida," },
  { role: "coro", text: "por historia fuimos la Argentina," },
  { role: "llamada", text: "por historia somos la Academia," },
  { role: "coro", text: "por historia tú llevas la insignia de ésta gran ciudad." },
  { role: "llamada", text: "Los colores de la capital" },
  { role: "coro", text: "azul y rojo." },
  { role: "llamada", text: "Vos cag** no hables más," },
  { role: "coro", text: "que en mi nombre está el de la ciudad." },
  { role: "llamada", text: "La gloriosa AKD," },
  { role: "coro", text: "soy de vos aunque vuelva a nacer." },
];

export const CANTICOS: Cantico[] = [
  { slug: "enamorado-estoy-de-vos", title: "Enamorado estoy de vos", classic: false, youtubeUrl: "", startSeconds: 0, lines:ENAMORADO_ESTOY_DE_VOS},
  { slug: "se-viene-quito-campeon", title: "Se viene Quito campeón", classic: false, youtubeUrl: "https://www.youtube.com/watch?v=Ws-J40TX-1c", startSeconds: 56, lines: QUITO_CAMPEON },
  { slug: "los-colores-de-la-capital", title: "Los colores de la capital", classic: false, youtubeUrl: "https://www.youtube.com/watch?v=JnSn9_73A2w", startSeconds: 179, lines: COLORES_DE_LA_CAPITAL },
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
  { slug: "gorila-esperate-un-poquito", title: "Gorila esperáte un poquito", classic: false, youtubeUrl: 'https://www.youtube.com/watch?v=lk0xuROJhL0', startSeconds: 232, lines: GORILA_ESPERATE_UN_POQUITO},
  { slug: "vamo-vamo-la-azulgrana", title: "Vamo' vamo' la azulgrana", classic: false, youtubeUrl: 'https://www.youtube.com/watch?v=a6zHCQIsCgo', startSeconds: 244, lines: VAMO_VAMO_LA_AZULGRANA},
  { slug: "la-banda-loca-de-los-placeros", title: "La banda loca de los placeros", classic: false, youtubeUrl: 'https://www.youtube.com/watch?v=H3lDCo3UZV0', startSeconds: 18, lines: BANDA_DE_LOS_PLACEROS},
  { slug: "hoy-es-cuando-mas-te-amo", title: "Hoy es cuando más te amo", classic: false, youtubeUrl: 'https://www.youtube.com/watch?v=H3lDCo3UZV0', startSeconds: 108, lines: HOY_ES_CUANDO_MAS_TE_AMO},
  { slug: "quito-corazon", title: "Quito corazón", classic: true, youtubeUrl: 'https://www.youtube.com/watch?v=YNyjKYewxgU', startSeconds: 28, lines: QUITO_CORAZON},
  { slug: "a-ver-los-jugadores", title: "A ver los jugadores", classic: true, youtubeUrl: 'https://www.youtube.com/watch?v=Qh1UBIgbLCY', startSeconds: 273, lines: A_VER_LOS_JUGADORES},
];

export function getCantico(slug: string): Cantico | undefined {
  return CANTICOS.find((c) => c.slug === slug);
}
