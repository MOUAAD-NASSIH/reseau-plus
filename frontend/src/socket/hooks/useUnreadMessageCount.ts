import { useEffect } from "react";
import { useGetUnreadCountQuery, messageApi } from "@/features/api/endpoints/messageEndpoints";
import { useSocket } from "@/socket/hooks/useSocket";
import { useAppDispatch } from "@/features/hooks";

/**
 * Hook to get the total count of unread messages across all conversations
 * Updates in real-time via socket events
 */
export function useUnreadMessageCount() {
  const { data, refetch } = useGetUnreadCountQuery();
  const { on, off } = useSocket();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleMessage = () => {
      // Improve: Optimistically increment count or just refetch
      refetch();
      // Also invalidate conversations list if needed
      dispatch(messageApi.util.invalidateTags(["Conversations"]));
    };

    const handleMessageRead = () => {
      refetch();
      dispatch(messageApi.util.invalidateTags(["Conversations"]));
    };

    on("message", handleMessage);
    on("messageRead", handleMessageRead);

    return () => {
      off("message", handleMessage);
      off("messageRead", handleMessageRead);
    };
  }, [on, off, refetch, dispatch]);

  return data?.count || 0;
}
