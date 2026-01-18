import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ArrowLeft, Send, Phone, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  type Conversation,
  type MessageUser,
} from "../../features/api/endpoints/messageEndpoints";
import { useGetCurrentUserQuery } from "../../features/api/endpoints/authEndpoints";
import { useMessageSocket } from "../../socket/hooks/useMessageSocket";
import { UserAvatar } from "@/components/ui/avatar";

interface ChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  // Get current user from RTK Query
  const { data: userData } = useGetCurrentUserQuery();
  const currentUser = userData?.data?.user;

  // Get the user ID - for workers/institutions it's in userId, for admins it's in id
  const currentUserId = (currentUser as any)?.userId ?? (currentUser as any)?.id;
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time message socket hook - handles room join/leave and message events
  const { typingUsers, sendTypingIndicator, isRealtime } = useMessageSocket(conversation.id);

  console.log('[ChatWindow] Socket connection status:', { isRealtime, conversationId: conversation.id });

  const {
    data: messages = [],
  } = useGetConversationMessagesQuery({
    conversationId: conversation.id,
    limit: 100,
  });

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  const otherUser = conversation.otherUser;

  // Get current user's profile info for avatar display
  // For workers: profilePicture is directly on the worker object
  // For institutions: logo is directly on the institution object
  const currentUserAvatar = (currentUser as any)?.profilePicture || (currentUser as any)?.logo;
  const currentUserIsWorker = !!(currentUser as any)?.firstName;

  // Build sender info for optimistic updates
  const senderInfo: MessageUser = useMemo(() => ({
    id: currentUserId || 0,
    email: (currentUser as any)?.user?.email || (currentUser as any)?.email || '',
    worker: (currentUser as any)?.firstName ? {
      firstName: (currentUser as any).firstName,
      lastName: (currentUser as any).lastName,
      profilePicture: (currentUser as any).profilePicture,
    } : undefined,
    institution: (currentUser as any)?.institutionName ? {
      institutionName: (currentUser as any).institutionName,
      logo: (currentUser as any).logo,
    } : undefined,
  }), [currentUser, currentUserId]);

  console.log("ChatWindow render:", {
    otherUser,
    conversationId: conversation.id,
    isSending,
    messageText
  });
  const isWorker = !!otherUser?.worker;
  const name = isWorker
    ? `${otherUser?.worker?.firstName} ${otherUser?.worker?.lastName}`
    : otherUser?.institution?.institutionName || "Unknown";
  const avatar = isWorker ? otherUser?.worker?.profilePicture : otherUser?.institution?.logo;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (conversation.id) {
      // Mark via REST API
      markAsRead(conversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  // Note: REST polling fallback is now handled by useMessageSocket hook
  // When socket is disconnected, the hook automatically polls every 5 seconds

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    // Send typing indicator
    sendTypingIndicator(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000);
  }, [sendTypingIndicator]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    console.log("handleSendMessage called!");
    console.log("Check values:", {
      messageText: messageText.trim(),
      otherUser,
      isSending
    });

    if (!messageText.trim() || !otherUser || isSending || !currentUserId) {
      console.log("Blocked because:", {
        noMessage: !messageText.trim(),
        noOtherUser: !otherUser,
        isSending,
        noCurrentUserId: !currentUserId
      });
      return;
    }

    // Stop typing indicator when sending
    sendTypingIndicator(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    console.log("Sending message:", {
      conversationId: conversation.id,
      receiverId: otherUser.id,
      content: messageText.trim(),
    });

    // Clear input immediately for better UX (optimistic)
    const messageContent = messageText.trim();
    setMessageText("");

    try {
      await sendMessage({
        conversationId: conversation.id,
        receiverId: otherUser.id,
        content: messageContent,
        senderId: currentUserId,
        senderInfo,
      }).unwrap();

      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message text on error so user can retry
      setMessageText(messageContent);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card-dark border-b border-card-border pb-4 md:p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-background-dark rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {avatar ? (
            <UserAvatar src={avatar} name={name} size="md" />
          ) : (
            <UserAvatar name={name} size="md" />
          )}

          <div>
            <h2 className="font-semibold">{name}</h2>
            <p className="text-xs text-muted-foreground">{isWorker ? "Social Worker" : "Institution"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-background-dark rounded-lg transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-background-dark rounded-lg transition-colors">
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 md:p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.senderId === currentUserId;

            return (
              <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  {isMe ? (
                    // Current user's avatar
                    <UserAvatar
                      src={currentUserAvatar}
                      name={currentUserIsWorker
                        ? `${(currentUser as any)?.firstName || ''} ${(currentUser as any)?.lastName || ''}`.trim() || 'You'
                        : (currentUser as any)?.institutionName || 'You'
                      }
                      size="sm"
                    />
                  ) : (
                    // Other user's avatar
                    <UserAvatar
                      src={avatar}
                      name={name}
                      size="sm"
                    />
                  )}

                  {/* Message bubble */}
                  <div className="flex flex-col">
                    <div
                      className={`rounded-2xl px-4 py-2 ${isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-card-dark border border-card-border"
                        }`}
                    >
                      <p className="text-sm wrap-break-word">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-2 mt-1 px-2 ${isMe ? "justify-end" : ""}`}>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                      {isMe && (
                        <span className="text-xs text-muted-foreground">
                          {message.status === "READ" ? "Read" : message.status === "DELIVERED" ? "Delivered" : "Sent"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs">
              {typingUsers.map(t => t.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card-dark border-t border-card-border pt-4 md:px-4">
        <div className="flex items-end gap-2">
          <textarea
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-2 bg-background-dark border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none max-h-32"
            style={{ minHeight: "40px" }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
}
