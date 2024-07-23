"use client";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import kyInstance from "@/lib/ky";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(userId, initialState);
  const queryKey: QueryKey = ["follower-info", userId];

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, (data) => ({
        followers:
          (previousData?.followers || 0) +
          (previousData?.isFollowByUser ? -1 : 1),
        isFollowByUser: !previousData?.isFollowByUser,
      }));

      return { previousData };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData<FollowerInfo>(queryKey, context?.previousData);
      console.error(error);
      toast({
        variant: "destructive",
        title: "Something went wrong. Please try again.",
      });
    },
  });
  return (
    <Button
      variant={data.isFollowByUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
