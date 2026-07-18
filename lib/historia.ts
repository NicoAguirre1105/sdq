// Historia del club: vitrina de títulos, línea de tiempo, presidentes y barras.
// Contenido estático (ver CLAUDE.md — Historia no tiene CMS). Datos de EJEMPLO,
// reemplazar por los reales del club.

export type VitrinaItem = { value: number; label: string; highlight?: boolean };

export const VITRINA: VitrinaItem[] = [
  { value: 5, label: "TÍTULOS NACIONALES", highlight: true },
  { value: 3, label: "SUBCAMPEONATOS" },
  // { value: 2, label: "COPAS NACIONALES" },
  { value: 8, label: "COPAS INTERNAC. (PARTICIPACIONES)" },
];

export type TimelineDot = "dorado" | "azul" | "rojo";

export type TimelineEvent = {
  year: string;
  title: string;
  description: string;
  dot: TimelineDot;
};

export const TIMELINE: TimelineEvent[] = [
  {
    year: "1940",
    title: "Fundación de S.D. Argentina",
    description:
      "El 9 de julio de 1940 nace S.D. Argentina con su gloriosa camiseta albiceleste, con fuertes influencias del fútbol argentino.",
    dot: "dorado",
  },
  {
    year: "1955",
    title: "Nacimiento del equipo de la ciudad",
    description: "El 27 de febrero de 1955 se refunda el club como Sociedad Deportivo Quito. Los colores que lo identifican son el azul y el rojo, los cuales representan un homenaje a la ciudad.",
    dot: "dorado",
  },
  {
    year: "1964",
    title: "Primera estrella",
    description: 'El miércoles 20 de enero, Deportivo Quito se coronó campeón nacional del Campeonato Ecuatoriano de Fútbol al imponerse a los "puros criollos" por la mínima diferencia.',
    dot: "azul",
  },
  {
    year: "1968",
    title: "Segundo campeonato nacional",
    description: "El domingo 29 de diciembre, la AKD empató sin goles con el Nacional para coronarse campeón del Campeonato Ecuatoriano de Fútbol 1968 y alcanzar su segunda estrella nacional.",
    dot: "azul",
  },
  {
    year: "2008",
    title: "40 años de espera",
    description: 'Un miércoles 3 de diciembre, en el estadio de "La Cocha" (Latacunga), Deportivo Quito ganaba a Macará 2x1 y se coronaba campeón del Campeonato Ecuatoriano de Fútbol 2008, terminando una sequía de 40 años.',
    dot: "dorado",
  },
  {
    year: "2009",
    title: "Bicampeonato",
    description: 'La gran final de vuelta fue un 5 de diciembre. La Academia se proclamó campeón del Campeonato Ecuatoriano de Fútbol 2009 al vencer 3x2 a D. Cuenca luego de empatar 1x1 la ida. Así se selló el primer Bicampeonato en la historia de Sociedad Deportivo Quito.',
    dot: "azul",
  },
  {
    year: "2011",
    title: "La última estrella",
    description: 'Gracias a una serie 1x0 en Guayaquil y 1x0 en el Atahualpa frente a Emelec, S.D. Quito se proclamó campeón del Campeonato Ecuatoriano de Fútbol de la Copa Credifé 2011.',
    dot: "azul",
  },
  {
    year: "2015-2018",
    title: "La crisis",
    description: 'Sumido en una crisis económica, pese a un buen rendimiento en cancha, las sanciones de puntos impuestas por FIFA y FEF terminaron descendiendo al Deportivo Quito a Serie B, luego a Segunda Categoría y finalmente (a pesar de haber quedado puntero absoluto en cancha) a Categoría Amateur en 2018.',
    dot: "rojo",
  },
  {
    year: "2019",
    title: "Inicio de la ruta al ascenso",
    description: 'Se consolidó la dirigencia y empieza nuevamente la ruta de ascenso. De esta manera se ubica entre los mejores del Campeonato Amateur de Quito y clasifica a la Copa Pichincha 2020.',
    dot: "azul",
  },
  {
    year: "2020",
    title: "Primer paso",
    description: 'Campeón de la Copa Pichincha, asciende a la Segunda Categoría de Pichincha de 2020.',
    dot: "azul",
  },
  {
    year: "2021-HOY",
    title: "El infierno de Segunda Categoría",
    description: "Un torneo que penaliza mucho y, a pesar de actuaciones memorables como la de 2024, cuando quedó a pocos partidos del ascenso, ha sido un gran obstáculo para el club. Seguros de que, con la hinchada más fiel del Ecuador, el objetivo tarde o temprano se cumplirá.",
    dot: "dorado",
  },
];

// period: todos los períodos del presidente, unidos por coma si tuvo más de uno.
// Orden: presidente actual primero, hacia atrás en el tiempo.
export type Presidente = { period: string; name: string };

export const PRESIDENTES: Presidente[] = [
  { period: "2023–2027", name: "José Antonio Pardo Moscoso" },
  { period: "2020–2023", name: "Samantha Yépez" },
  { period: "2017–2020", name: "Juan Manuel Aguirre" },
  { period: "2016–2017", name: "Eduardo Romero Mantilla" },
  { period: "2016", name: "Freddy Mayorga" },
  { period: "2015–2016", name: "Patricio Alvarado" },
  { period: "2014–2015", name: "Joselito Cobo" },
  { period: "2009, 2014", name: "Santiago Ribadeneira" },
  { period: "2014", name: "Esteban Pacheco" },
  { period: "2013–2014", name: "Eugenio Romero Mantilla" },
  { period: "2009–2012, 2013", name: "Fernando Mantilla" },
  { period: "2012–2013", name: "Iván Vasco" },
  { period: "2009", name: "Ricardo Acosta" },
  { period: "2008–2009", name: "Jorge Burbano" },
  { period: "2002–2004, 2005–2008", name: "Fernando Herrera" },
  { period: "2004–2005", name: "Rodrigo Jijón" },
  { period: "1998–2002", name: "Francisco Chiriboga Acosta" },
  { period: "1983–1991, 1997–1998", name: "Luis Chiriboga Acosta" },
  { period: "1995–1996", name: "Jorge Machado Cevallos" },
  { period: "1991–1994", name: "Tommy Schwarzkopf" },
  { period: "1981–1982", name: "Carlos Serrano Lusetty" },
  { period: "1979–1980", name: "Iván Pastor Salvador" },
  { period: "1977–1978", name: "Francisco Acosta Espinoza" },
  { period: "1962–1965, 1968–1969, 1970–1976", name: "Ney Mancheno Velasco" },
  { period: "1969–1970", name: "Carlos Guarderas Barba" },
  { period: "1967", name: 'Aladar "Al" Horvath Goldstein' },
  { period: "1966", name: "Ángel Augusto Cadena Troya" },
  { period: "1960–1961", name: "Oswaldo Ycaza Maya" },
  { period: "1959", name: "Pedro Vorberk" },
  { period: "1955–1958", name: "Cristóbal Ponce Ribadeneira" },
];

export type BarraTone = "azul" | "rojo" | "dorado";

export type Barra = {
  name: string;
  founded: number;
  description: string;
  tone: BarraTone;
};

export const BARRAS: Barra[] = [
  {
    name: "Banda del Brujo",
    founded: 1985,
    description:
      "La barra más antigua y numerosa. Nació en la General Sur del Atahualpa y es la responsable de los cánticos clásicos que hoy identifican a la hinchada azulgrana.",
    tone: "azul",
  },
  {
    name: "Mafia Azulgrana",
    founded: 2002,
    description:
      "Joven y ruidosa, se hizo conocida por sus mosaicos y bengalas en los clásicos. Lidera el aguante en la curva norte y viaja a cada partido de visitante.",
    tone: "rojo",
  },
  {
    name: "Barra de las Banderas",
    founded: 1998,
    description:
      "Famosa por su despliegue de trapos y banderas gigantes que cubren la tribuna. Cada partido en casa arma un telón azulgrana que se ve desde toda la cancha.",
    tone: "dorado",
  },
];
