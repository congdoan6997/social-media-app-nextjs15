import { Prisma } from "@prisma/client";

export const postDataInclude = {
  user: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
} satisfies Prisma.PostInclude;

export type PostData = Prisma.PostGetPayload<{
  include: typeof postDataInclude;
}>;

export const userDataSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;
