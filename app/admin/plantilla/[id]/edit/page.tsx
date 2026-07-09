import { notFound } from "next/navigation";
import { PlayerForm } from "@/components/admin/PlayerForm";
import { getPlayerById } from "@/lib/supabase/queries/players";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();
  return <PlayerForm player={player} />;
}
