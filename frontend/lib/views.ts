import { API_URL } from "@/lib/api";

const recorded = new Set<string>();

export async function recordPostView(postId: string): Promise<number | null> {
  if (recorded.has(postId)) {
    return null;
  }
  recorded.add(postId);

  try {
    const response = await fetch(`${API_URL}/api/posts/${postId}/view`, {
      method: "POST",
    });
    const data = (await response.json()) as { view_count?: number };
    if (!response.ok || typeof data.view_count !== "number") {
      recorded.delete(postId);
      return null;
    }
    return data.view_count;
  } catch {
    recorded.delete(postId);
    return null;
  }
}
