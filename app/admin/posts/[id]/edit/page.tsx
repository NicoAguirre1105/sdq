import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { getPostById } from "@/lib/supabase/queries/posts";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return <PostForm post={post} />;
}
