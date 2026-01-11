import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, User, Building2, Phone, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  type Conversation,
} from "../../services/messageService";
import { useAppSelector } from "../../features/hooks";

interface ChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  
  // Get current user's profile info for avatar display
  const currentUserAvatar = (currentUser as any)?.worker?.profilePicture || (currentUser as any)?.institution?.logo;
  const currentUserIsWorker = !!(currentUser as any)?.worker;
  
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
      markAsRead(conversation.id);
    }
  }, [conversation.id, markAsRead]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleSendMessage = async () => {
    console.log("handleSendMessage called!");
    console.log("Check values:", { 
      messageText: messageText.trim(), 
      otherUser, 
      isSending 
    });
    
    if (!messageText.trim() || !otherUser || isSending) {
      console.log("Blocked because:", { 
        noMessage: !messageText.trim(), 
        noOtherUser: !otherUser, 
        isSending 
      });
      return;
    }

    console.log("Sending message:", {
      conversationId: conversation.id,
      receiverId: otherUser.id,
      content: messageText.trim(),
    });

    try {
      await sendMessage({
        conversationId: conversation.id,
        receiverId: otherUser.id,
        content: messageText.trim(),
      }).unwrap();

      setMessageText("");
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card-dark border-b border-card-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-background-dark rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {avatar ? (
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {isWorker ? (
                <User className="w-5 h-5 text-primary" />
              ) : (
                <Building2 className="w-5 h-5 text-primary" />
              )}
            </div>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    <>
                      {currentUserAvatar ? (
                        <img
                          src={currentUserAvatar}
                          alt="You"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {currentUserIsWorker ? (
                            <User className="w-4 h-4 text-primary" />
                          ) : (
                            <Building2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    // Other user's avatar
                    <>
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {isWorker ? (
                            <User className="w-4 h-4 text-primary" />
                          ) : (
                            <Building2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Message bubble */}
                  <div className="flex flex-col">
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isMe
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card-dark border-t border-card-border p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
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
