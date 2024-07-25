"use client";

import useBookmarkInfo from "@/hooks/useBookmarkInfo";
import { BookmarkInfo } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import kyInstance from "@/lib/ky";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({
  postId,
  initialState,
}: LikeButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useBookmarkInfo(postId, initialState);

  const queryKey: QueryKey = ["bookmark-info", postId];

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isBookmarkedByUser
        ? kyInstance.delete(`/api/posts/${postId}/bookmarks`)
        : kyInstance.post(`/api/posts/${postId}/bookmarks`),

    onMutate: async () => {
      toast({
        description: `Post ${data.isBookmarkedByUser ? "unbookmarked" : "bookmarked"}`,
      });
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<BookmarkInfo>(queryKey);

      queryClient.setQueryData<BookmarkInfo>(queryKey, (data) => ({
        isBookmarkedByUser: !previousData?.isBookmarkedByUser,
      }));

      return { previousData };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData<BookmarkInfo>(queryKey, context?.previousData);
      console.error(error);
      toast({
        variant: "destructive",
        title: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className={cn(
          "size-5",
          data.isBookmarkedByUser && "fill-primary text-primary",
        )}
      />
    </button>
  );
}
