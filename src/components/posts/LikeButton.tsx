"use client";

import { LikeInfo } from "@/lib/types";
import { useToast } from "../ui/use-toast";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import useLikeInfo from "@/hooks/useLikeInfo";
import kyInstance from "@/lib/ky";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialState: LikeInfo;
}

export default function LikeButton({ postId, initialState }: LikeButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useLikeInfo(postId, initialState);

  const queryKey: QueryKey = ["like-info", postId];

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`/api/posts/${postId}/likes`)
        : kyInstance.post(`/api/posts/${postId}/likes`),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<LikeInfo>(queryKey);

      queryClient.setQueryData<LikeInfo>(queryKey, (data) => ({
        likes:
          (previousData?.likes || 0) + (previousData?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousData?.isLikedByUser,
      }));

      return { previousData };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData<LikeInfo>(queryKey, context?.previousData);
      console.error(error);
      toast({
        variant: "destructive",
        title: "Something went wrong. Please try again.",
      });
    },
  });
  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Heart
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500",
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.likes} <span className="hidden sm:inline">likes</span>
      </span>
    </button>
  );
}
