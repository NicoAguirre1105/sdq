// ponytail: renderer de un subconjunto de Markdown (headings, negrita, itálica, links,
// listas, párrafos) hecho a mano para no sumar dependencia en un repo dep-minimal. Escapa
// el HTML ANTES de formatear, así el output es seguro para dangerouslySetInnerHTML aunque
// el contenido venga de un admin. Se usa tanto en el preview del editor (`PostForm`) como
// en la página pública `/post/[slug]` — mismo renderer, mismo look. Techo conocido: no
// cubre tablas, imágenes ni code blocks. Cuando el contenido real de un post lo necesite,
// reemplazar por `marked` + sanitizado y borrar esto.

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string) {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // links: solo http(s) o rutas relativas, nunca javascript: u otros esquemas
    .replace(
      /\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
      '<a href="$2">$1</a>'
    );
}

export function renderMarkdown(md: string): string {
  const lines = escapeHtml(md).split(/\r?\n/);
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("### ")) {
      closeList();
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      closeList();
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line === "") {
      closeList();
    } else {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return html.join("\n");
}
