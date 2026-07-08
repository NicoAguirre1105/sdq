import Link from "next/link";

export default function AdminDashboard() {
  return (
    <>
      <header className="border-b border-azul-marino/10 bg-white px-6 py-4">
        <h1 className="font-display text-3xl text-tinta">DASHBOARD</h1>
        <p className="font-mono text-[10px] text-tinta/45">Panel de gestión</p>
      </header>
      <div className="px-6 py-8">
        <p className="font-body text-sm text-tinta/60">
          Gestioná el contenido del sitio desde el menú de la izquierda. Por
          ahora está disponible{" "}
          <Link href="/admin/posts" className="font-semibold text-azul-marino underline">
            Posts
          </Link>
          ; el resto de las secciones se van habilitando en las próximas fases.
        </p>
      </div>
    </>
  );
}
