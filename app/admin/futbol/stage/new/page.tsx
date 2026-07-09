import { StageForm } from "@/components/admin/StageForm";
import { getCompetitionsForSelect } from "@/lib/supabase/queries/competitions";
import { getAllTeams } from "@/lib/supabase/queries/teams";

export default async function NewStagePage() {
  const [competitions, teams] = await Promise.all([
    getCompetitionsForSelect(),
    getAllTeams(),
  ]);
  return (
    <StageForm
      competitions={competitions}
      teams={teams.map((t) => ({ id: t.id, name: t.name }))}
    />
  );
}
