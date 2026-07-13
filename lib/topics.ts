// Temas de suscripción al newsletter. Usado en components/layout/SubscribeForm.tsx
// (alta) y components/subscription/ManagePreferencesForm.tsx (gestión) — un solo
// lugar para no desincronizar las opciones entre ambos forms.
export const TOPICS = [
  { value: "club", label: "Posts, noticias e información del club y MAG." },
  { value: "tienda", label: "Contenido exclusivo, ofertas y nuevos productos en la tienda." },
  { value: "canticos", label: "Noticias sobre cánticos nuevos." },
] as const;
