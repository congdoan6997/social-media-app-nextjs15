import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: {
        id: params.userId,
      },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowByUser: !!user.followers.length,
    };

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: params.userId,
          },
        },
        create: {
          followerId: loggedInUser.id,
          followingId: params.userId,
        },
        update: {},
      }),
      prisma.notification.create({
        data: {
          type: "FOLLOW",
          issuerId: loggedInUser.id,
          recipientId: params.userId,
        },
      }),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id,
          followingId: params.userId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          type: "FOLLOW",
          issuerId: loggedInUser.id,
          recipientId: params.userId,
        },
      }),
    ]);
 
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
