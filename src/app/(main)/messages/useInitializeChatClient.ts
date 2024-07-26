import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";
import { useEffect, useState } from "react";
import kyInstance from "@/lib/ky";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    const client = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    );

    client
      .connectUser(
        {
          id: user?.id,
          name: user?.displayName,
          username: user?.username,
          image: user?.avatarUrl,
        },
        async () =>
          kyInstance
            .get("/api/get-token")
            .json<{ token: string }>()
            .then((data) => data.token),
      )
      .catch((error) => console.error("Error connecting user", error))
      .then(() => setChatClient(client));

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => console.error("Error disconnecting user", error))
        .then(() => {
          console.log("Chat client disconnected");
        });
    };
  }, [user.id, user.displayName, user.username, user.avatarUrl]);

  return chatClient;
}
