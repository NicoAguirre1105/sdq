import { notFound } from "next/navigation";
import { CanticoForm } from "@/components/admin/CanticoForm";
import { getCanticoById } from "@/lib/supabase/queries/canticos";

export default async function EditCanticoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cantico = await getCanticoById(id);
  if (!cantico) notFound();

  return <CanticoForm cantico={cantico} />;
}
