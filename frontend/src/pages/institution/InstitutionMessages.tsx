import { useState } from "react";
import { useGetMyConversationsQuery } from "../../features/api/endpoints/messageEndpoints";
import { MessageSquare, Search, User, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ChatWindow from "../../components/messages/ChatWindow";

export default function InstitutionMessages() {
  const { data: conversations = [], isLoading } = useGetMyConversationsQuery();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) => {
    if (!conv.otherUser) return false;
    const name = conv.otherUser.worker
      ? `${conv.otherUser.worker.firstName} ${conv.otherUser.worker.lastName}`
      : conv.otherUser.institution?.institutionName || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background-dark">
      {/* Conversations List */}
      <div className={`w-full md:w-96 bg-card-dark border-r border-card-border flex flex-col ${selectedConversationId ? 'hidden md:flex' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-card-border">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Messages
          </h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background-dark border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg">No conversations yet</p>
              <p className="text-sm mt-2">Start messaging from a mission</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherUser = conversation.otherUser;
              if (!otherUser) return null;

              const isWorker = !!otherUser.worker;
              const name = isWorker
                ? `${otherUser.worker?.firstName} ${otherUser.worker?.lastName}`
                : otherUser.institution?.institutionName || "Unknown";
              const avatar = isWorker
                ? otherUser.worker?.profilePicture
                : otherUser.institution?.logo;
              const lastMessage = conversation.messages[0];

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`w-full p-4 border-b border-card-border hover:bg-background-dark transition-colors text-left ${selectedConversationId === conversation.id ? "bg-background-dark" : ""
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {isWorker ? (
                            <User className="w-6 h-6 text-primary" />
                          ) : (
                            <Building2 className="w-6 h-6 text-primary" />
                          )}
                        </div>
                      )}
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold truncate">{name}</h3>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.senderId === otherUser.id ? "" : "You: "}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-24 h-24 mb-4 opacity-20" />
            <p className="text-xl">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
