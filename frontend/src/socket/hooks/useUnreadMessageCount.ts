import { useEffect, useRef, useCallback } from "react";
import { useGetUnreadCountQuery, messageApi } from "@/features/api/endpoints/messageEndpoints";
import { useSocket } from "@/socket/hooks/useSocket";
import { useAppDispatch } from "@/features/hooks";

/**
 * Hook to get the total count of unread messages across all conversations
 * Updates in real-time via socket events
 */
export function useUnreadMessageCount() {
  const { data } = useGetUnreadCountQuery();
  const { isConnected, on, off } = useSocket();
  const dispatch = useAppDispatch();
  const listenerSetup = useRef(false);
  const isConnectedRef = useRef(isConnected);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  const handleMessage = useCallback(() => {
    if (isConnectedRef.current) {
      dispatch(messageApi.util.invalidateTags(["Conversations"]));
    }
  }, [dispatch]);

  const handleMessageRead = useCallback(() => {
    if (isConnectedRef.current) {
      dispatch(messageApi.util.invalidateTags(["Conversations"]));
    }
  }, [dispatch]);

  const setupListeners = useCallback(() => {
    if (listenerSetup.current) return;
    listenerSetup.current = true;
    on("message", handleMessage);
    on("messageRead", handleMessageRead);
  }, [on, handleMessage, handleMessageRead]);

  const cleanupListeners = useCallback(() => {
    if (!listenerSetup.current) return;
    off("message", handleMessage);
    off("messageRead", handleMessageRead);
    listenerSetup.current = false;
  }, [off, handleMessage, handleMessageRead]);

  useEffect(() => {
    if (isConnected) {
      setupListeners();
    } else {
      cleanupListeners();
    }

    return cleanupListeners;
  }, [isConnected, setupListeners, cleanupListeners]);

  return data?.count || 0;
}
