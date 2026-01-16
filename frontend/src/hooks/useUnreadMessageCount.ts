import { useGetMyConversationsQuery } from "@/features/api/endpoints/messageEndpoints";

/**
 * Hook to get the total count of unread messages across all conversations
 */
export function useUnreadMessageCount() {
  const { data: conversations = [] } = useGetMyConversationsQuery(undefined, {
    // Poll every 30 seconds to keep unread count fresh
    pollingInterval: 30000,
  });

  const unreadCount = conversations.reduce(
    (total, conv) => total + (conv.unreadCount || 0),
    0
  );

  return unreadCount;
}
