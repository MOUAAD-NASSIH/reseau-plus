import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ArrowLeft, Send, Phone, Video, WifiOff, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { TypingIndicator } from "./TypingIndicator";
import { MessageStatus } from "./MessageStatus";

interface ChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { t, i18n } = useTranslation();
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

  const {
    data: messages = [],
    refetch,
  } = useGetConversationMessagesQuery({
    conversationId: conversation.id,
    limit: 100,
  });

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  const otherUser = conversation.otherUser;

  const currentUserAvatar = (currentUser as any)?.worker?.profilePicture || (currentUser as any)?.institution?.logo || (currentUser as any)?.profilePicture || (currentUser as any)?.logo;
  const currentUserIsWorker = !!(currentUser as any)?.worker || !!(currentUser as any)?.firstName;

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


  const isWorker = !!otherUser?.worker;
  const name = isWorker
    ? `${otherUser?.worker?.firstName} ${otherUser?.worker?.lastName}`
    : otherUser?.institution?.institutionName || "Unknown";
  const avatar = isWorker
    ? (otherUser?.worker?.profilePicture || (otherUser as any)?.profilePicture)
    : (otherUser?.institution?.logo || (otherUser as any)?.logo);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when conversation opens or new messages arrive
  useEffect(() => {
    if (conversation.id && messages.length > 0) {
      // Check if there are any unread messages from the other user
      const hasUnreadFromOther = messages.some(
        (msg) => msg.receiverId === currentUserId && msg.status !== 'READ'
      );

      if (hasUnreadFromOther) {
        // Mark via REST API (which also triggers socket event)
        markAsRead(conversation.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id, messages.length]);

  // Refetch messages when conversation opens to get any missed messages
  useEffect(() => {
    if (conversation.id) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

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
    if (!messageText.trim() || !otherUser || isSending || !currentUserId) {
      return;
    }

    // Stop typing indicator when sending
    sendTypingIndicator(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{isWorker ? t("MESSAGES.CHAT_WINDOW.SOCIAL_WORKER") : t("MESSAGES.CHAT_WINDOW.INSTITUTION")}</p>
              <div title={isRealtime ? "Connected" : "Disconnected"}>
                {isRealtime ? (
                  <Wifi className="h-3 w-3 text-emerald-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </div>
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
            <p>{t("MESSAGES.CHAT_WINDOW.NO_MESSAGES_YET")}</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.senderId === currentUserId;

            return (
              <div key={message.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                <div className={`flex items-end gap-2 max-w-[70%] ${!isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <UserAvatar
                    src={isMe ? currentUserAvatar : avatar}
                    name={isMe
                      ? (currentUserIsWorker
                        ? `${(currentUser as any)?.worker?.firstName || (currentUser as any)?.firstName || ''} ${(currentUser as any)?.worker?.lastName || (currentUser as any)?.lastName || ''}`
                        : (currentUser as any)?.institution?.institutionName || (currentUser as any)?.institutionName || 'You')
                      : name
                    }
                    size="sm"
                  />

                  {/* Message bubble */}
                  <div className="flex flex-col relative group">
                    <div
                      className={`rounded-2xl px-4 py-2 relative ${isMe
                        ? "bg-primary text-primary-foreground rounded-tl-2xl rounded-bl-none ml-2"
                        : "bg-muted text-foreground rounded-tr-2xl rounded-br-none mr-2"
                        }`}
                    >
                      {/* Tail for Me (Left) - Green */}
                      {isMe && (
                        <svg className="absolute bottom-0 -left-2 w-3 h-3 text-primary fill-current" viewBox="0 0 10 10">
                          <path d="M10 0 Q10 10 0 10 L10 10 Z" />
                        </svg>
                      )}
                      {/* Tail for Them (Right) - Gray */}
                      {!isMe && (
                        <svg className="absolute bottom-0 -right-2 w-3 h-3 fill-muted transform scale-x-[-1]" viewBox="0 0 10 10" style={{ color: "hsl(var(--muted))" }}>
                          <path d="M10 0 Q10 10 0 10 L10 10 Z" />
                        </svg>
                      )}

                      <p className="text-sm wrap-break-word whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 px-2 ${!isMe ? "justify-end" : ""}`}>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleString(i18n.language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <MessageStatus status={message.status} isOwnMessage={isMe} />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <TypingIndicator typingUsers={typingUsers} />

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

            placeholder={t("MESSAGES.CHAT_WINDOW.INPUT.PLACEHOLDER")}
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
        <p className="text-xs text-muted-foreground mt-2">{t("MESSAGES.CHAT_WINDOW.INPUT.HINT")}</p>
      </div>
    </div>
  );
}
