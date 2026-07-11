import Link from "next/link";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function AdminPostsLoading() {
  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-azul-marino/10 bg-white px-6 py-4">
        <div>
          <h1 className="font-display text-3xl text-tinta">POSTS</h1>
          <div className="mt-1.5 h-2.5 w-28 animate-pulse rounded bg-azul-marino/10" />
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-rojo-bandera px-4 py-2.5 font-body text-xs font-bold text-white transition-colors hover:bg-rojo-bandera-hover"
        >
          + Nuevo post
        </Link>
      </header>

      <div className="px-6 py-6">
        <TableSkeleton rows={6} />
      </div>
    </>
  );
}
