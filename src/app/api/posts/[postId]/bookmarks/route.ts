import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { BookmarkInfo } from "@/lib/types";

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
        bookmarks: {
          where: {
            userId: loggedInUser.id,
          },
          select: {
            userId: true,
          },
        },
      },
    });
    if (!post)
      return Response.json({ error: "Post not found" }, { status: 404 });
    const data: BookmarkInfo = {
      isBookmarkedByUser: !!post.bookmarks.length,
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
    await prisma.bookmark.upsert({
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
    });
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
    await prisma.bookmark.deleteMany({
      where: {
        postId: params.postId,
        userId: loggedInUser.id,
      },
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
