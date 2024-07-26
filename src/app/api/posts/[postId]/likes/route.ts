import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const post = await prisma.post.findUnique({
      where: {
        id: params.postId,
      },
      include: {
        likes: {
          where: {
            userId: loggedInUser.id,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    if (!post)
      return Response.json({ error: "Post not found" }, { status: 404 });

    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const post = await prisma.post.findUnique({
      where: {
        id: params.postId,
      },
      select: {
        userId: true,
      },
    });

    if (!post)
      return Response.json({ error: "Post not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.like.upsert({
        where: {
          userId_postId: {
            postId: params.postId,
            userId: loggedInUser.id,
          },
        },
        create: {
          postId: params.postId,
          userId: loggedInUser.id,
        },
        update: {},
      }),
      ...(post.userId !== loggedInUser.id
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id,
                recipientId: post.userId,
                type: "LIKE",
                postId: params.postId,
              },
            }),
          ]
        : []),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const post = await prisma.post.findUnique({
      where: {
        id: params.postId,
      },
      select: {
        userId: true,
      },
    });

    if (!post)
      return Response.json({ error: "Post not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.like.deleteMany({
        where: {
          postId: params.postId,
          userId: loggedInUser.id,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: post.userId,
          postId: params.postId,
          type: "LIKE",
        },
      }),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
