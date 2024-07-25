import kyInstance from "@/lib/ky";
import { BookmarkInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useBookmarkInfo(
  postId: string,
  initialState: BookmarkInfo,
) {
  const query = useQuery({
    queryKey: ["bookmark-info", postId],
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/bookmarks`).json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  return query;
}
