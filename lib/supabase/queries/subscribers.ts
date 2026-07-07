import { createServerSupabaseClient } from "@/lib/supabase/client";

export async function addSubscriber(email: string, topics: string[]) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("subscribers").insert({ email, topics });
  if (error) {
    if (error.code === "23505") return { alreadySubscribed: true };
    throw error;
  }
  return { alreadySubscribed: false };
}
