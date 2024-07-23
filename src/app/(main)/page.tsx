import PostEditor from "@/components/posts/editor/PostEditor";
import Post from "@/components/posts/Post";
import TrendsSidebar from "@/components/TrendsSidebar";
import prisma from "@/lib/prisma";
import { postDataInclude } from "@/lib/types";
import ForYouNeed from "./ForYouNeed";

export default function Page() {
  return (
    <div className="w-full min-w-0">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <ForYouNeed />
      </div>
    </div>
  );
}
