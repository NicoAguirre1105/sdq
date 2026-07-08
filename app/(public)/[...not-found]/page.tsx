import { notFound } from "next/navigation";

// ponytail: un not-found.tsx suelto solo cubre notFound() lanzado dentro del grupo,
// no las URLs inexistentes. Este catch-all enruta cualquier ruta no encontrada hacia
// (public) para que herede Navbar/Footer del layout y muestre (public)/not-found.tsx.
// Al construir /admin, agregar su propio catch-all para que no caiga en este 404 público.
export default function CatchAll() {
  notFound();
}
