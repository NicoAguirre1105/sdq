import { notFound } from "next/navigation";
import { TeamForm } from "@/components/admin/TeamForm";
import { getTeamById } from "@/lib/supabase/queries/teams";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getTeamById(id);
  if (!team) notFound();
  return <TeamForm team={team} />;
}
