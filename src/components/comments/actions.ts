"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";

export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) throw new Error("Unauthorized");

  const { content: contentValid } = createCommentSchema.parse({ content });
  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValid,
        userId: loggedInUser.id,
        postId: post.id,
      },
      include: getCommentDataInclude(loggedInUser.id),
    }),
    ...(post.user.id !== loggedInUser.id
      ? [
          prisma.notification.create({
            data: {
              type: "COMMENT",
              recipientId: post.user.id,
              issuerId: loggedInUser.id,
              postId: post.id,
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}

export async function deleteComment(commentId: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });
  if (!comment) throw new Error("Comment not found");
  if (comment.userId !== user.id) throw new Error("Unauthorized");
  await prisma.comment.delete({
    where: {
      id: commentId,
    },
    include: getCommentDataInclude(user.id),
  });

  return comment;
}
