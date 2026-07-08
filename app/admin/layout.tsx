import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata = { title: "Panel · S.D. Quito" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-blanco-hueso md:flex-row">
      <Sidebar adminName={admin.full_name} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
