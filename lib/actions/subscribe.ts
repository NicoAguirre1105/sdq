"use server";

import { addSubscriber } from "@/lib/supabase/queries/subscribers";

export type SubscribeState = {
  status: "idle" | "success" | "already_subscribed" | "error";
};

export async function subscribeAction(
  _prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim();
  const topics = formData.getAll("topics").map(String);

  if (!email) return { status: "error" };

  try {
    const result = await addSubscriber(email, topics);
    return { status: result.alreadySubscribed ? "already_subscribed" : "success" };
  } catch {
    return { status: "error" };
  }
}
