import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { deleteComment, submitComment } from "./actions";
import { CommentData, CommentsPage } from "@/lib/types";

export function useSubmitCommentMutation(postId: string) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: async (newComment) => {
      const queryKey: QueryKey = ["comments", postId];

      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueriesData<InfiniteData<CommentsPage, string | null>>(
        { queryKey },
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (!firstPage) return oldData;
          return {
            ...oldData,
            pages: [
              {
                ...firstPage,
                comments: [...firstPage.comments, newComment],
              },
              ...oldData?.pages.slice(1),
            ],
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
      toast({
        description: "Comment created",
      });
    },
    onError(error) {
      toast({
        description: "Failed to create comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

export function useDeleteCommentMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async (deleteComment) => {
      const queryKey: QueryKey = ["comments", deleteComment.postId];
      await queryClient.cancelQueries({ queryKey });

      queryClient.setQueriesData<InfiniteData<CommentsPage, string | null>>(
        { queryKey },
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (!firstPage) return oldData;
          return {
            ...oldData,
            pages: [
              {
                ...firstPage,
                comments: firstPage.comments.filter(
                  (comment) => comment.id !== deleteComment.id,
                ),
              },
              ...oldData?.pages.slice(1),
            ],
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
      toast({
        description: "Comment deleted",
      });
    },
    onError(error) {
      toast({
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}
