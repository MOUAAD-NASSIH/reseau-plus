import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { MessageSquare, Search, User, Building2 } from "lucide-react";
import { useGetMyConversationsQuery, useLazyGetOrCreateConversationQuery } from "@/features/api/endpoints/messageEndpoints";
import ChatWindow from "@/components/messages/ChatWindow";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";

export default function Messages() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const startConversationWith = location.state?.startConversationWith as number | undefined;

  const { data: conversations = [], isLoading } = useGetMyConversationsQuery();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Lazy query to get or create conversation
  const [triggerGetOrCreateConversation, { data: newConversation, isSuccess }] = useLazyGetOrCreateConversationQuery();

  // Auto-select/create conversation if requested via navigation state
  useEffect(() => {
    if (startConversationWith) {
      triggerGetOrCreateConversation(startConversationWith);
    }
  }, [startConversationWith, triggerGetOrCreateConversation]);

  // Select the conversation once it's created/fetched
  useEffect(() => {
    if (isSuccess && newConversation) {
      setSelectedConversationId(newConversation.id);
    }
  }, [isSuccess, newConversation]);

  const filteredConversations = conversations.filter((conv) => {
    if (!conv.otherUser) return false;
    const name = conv.otherUser.worker
      ? `${conv.otherUser.worker.firstName} ${conv.otherUser.worker.lastName}`
      : conv.otherUser.institution?.institutionName || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Find selected conversation in the list, or use the newly created one as fallback
  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  ) || (newConversation?.id === selectedConversationId ? newConversation : null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Conversations Sidebar */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 flex flex-col border-r border-border bg-card/50",
          selectedConversationId ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="py-4 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-2xl font-bold font-spline mb-4 flex items-center gap-2 text-foreground">
            <MessageSquare className="size-6 text-primary" />
            {t("MESSAGES.TITLE")}
          </h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("MESSAGES.SEARCH_PLACEHOLDER")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border hover:border-primary/50 transition-colors h-10 rounded-full"
            />
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col py-2 gap-1">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center px-4">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6 opacity-30" />
                </div>
                <p className="font-medium mb-1">{t("MESSAGES.NO_CONVERSATIONS")}</p>
                <p className="text-xs">{t("MESSAGES.START_MESSAGING")}</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherUser = conversation.otherUser;
                if (!otherUser) return null;

                const isWorker = !!otherUser.worker;
                const name = isWorker
                  ? `${otherUser.worker?.firstName} ${otherUser.worker?.lastName}`
                  : otherUser.institution?.institutionName || t("MESSAGES.UNKNOWN_USER");
                const avatar = isWorker
                  ? otherUser.worker?.profilePicture
                  : otherUser.institution?.logo;
                const lastMessage = conversation.messages[0];
                const isSelected = selectedConversationId === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={cn(
                      "w-full p-3 flex items-start gap-3 rounded-xl transition-all text-left group border border-transparent",
                      isSelected
                        ? "bg-primary/10 border-primary/20 shadow-sm"
                        : "hover:bg-muted/50 hover:border-border/50"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 border border-border/50">
                        <AvatarImage src={avatar || undefined} alt={name} className="object-cover" />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {isWorker ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      {(conversation.unreadCount || 0) > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={cn(
                          "font-semibold truncate text-sm",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {name}
                        </span>
                        {lastMessage && (
                          <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                            {new Date(lastMessage.createdAt).toLocaleString(i18n.language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      {lastMessage ? (
                        <p className={cn(
                          "text-xs truncate",
                          isSelected ? "text-primary/70" : "text-muted-foreground"
                        )}>
                          {lastMessage.senderId === otherUser.id ? "" : t("MESSAGES.YOU_PREFIX")}
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">{t("MESSAGES.NO_MESSAGES")}</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-background",
          !selectedConversationId ? "hidden md:flex" : "flex",
          "w-full md:w-auto h-full"
        )}
      >
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5">
            <div className="max-w-md space-y-4 flex flex-col items-center">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center transform rotate-3">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-spline text-foreground">{t("MESSAGES.EMPTY_WINDOW.TITLE")}</h2>
              <p className="text-muted-foreground">
                {t("MESSAGES.EMPTY_WINDOW.DESC")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
