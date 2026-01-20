import { api } from "../api";

export interface MessageUser {
    id: number;
    email: string;
    worker?: {
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    institution?: {
        institutionName: string;
        logo?: string;
    };
}

export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    receiverId: number;
    content: string;
    status: "SENT" | "DELIVERED" | "READ";
    createdAt: string;
    updatedAt: string;
    sender: MessageUser;
    receiver: MessageUser;
    // Optimistic update fields
    _optimistic?: boolean;
    _tempId?: string;
}

export interface Conversation {
    id: number;
    participantIds: number[];
    lastMessageAt: string;
    createdAt: string;
    messages: Message[];
    otherUser?: MessageUser;
    unreadCount?: number;
}

export interface SendMessageRequest {
    conversationId: number;
    receiverId: number;
    content: string;
}

// Extended request with sender info for optimistic updates
export interface SendMessageRequestWithSender extends SendMessageRequest {
    senderId: number;
    senderInfo: MessageUser;
}

// Generate a temporary ID for optimistic messages
let tempIdCounter = 0;
export function generateTempId(): string {
    return `temp-${Date.now()}-${++tempIdCounter}`;
}

export const messageApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all conversations
        getMyConversations: builder.query<Conversation[], void>({
            query: () => ({ url: "/messages/conversations" }),
            transformResponse: (response: { success: boolean; data: Conversation[] }) => response.data,
            providesTags: ["Conversations"],
        }),

        // Get or create conversation with a user
        getOrCreateConversation: builder.query<Conversation, number>({
            query: (otherUserId) => ({ url: `/messages/conversations/user/${otherUserId}` }),
            transformResponse: (response: { success: boolean; data: Conversation }) => response.data,
            providesTags: (_result, _error, otherUserId) => [
                { type: "Conversations", id: otherUserId },
            ],
            // Invalidate conversations list to ensure it refreshes with the new/existing conversation
            async onQueryStarted(_otherUserId, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Invalidate the conversations list to trigger a refetch
                    dispatch(messageApi.util.invalidateTags(["Conversations"]));
                } catch {
                    // Error handled by the component
                }
            },
        }),

        // Get unread message count
        getUnreadCount: builder.query<{ count: number }, void>({
            query: () => ({ url: "/messages/unread/count" }),
            transformResponse: (response: { success: boolean; data: { count: number } }) => response.data,
            providesTags: ["UnreadCount"],
        }),

        // Get messages for a conversation
        getConversationMessages: builder.query<
            Message[],
            { conversationId: number; limit?: number; before?: string }
        >({
            query: ({ conversationId, limit = 50, before }) => ({
                url: `/messages/conversations/${conversationId}/messages`,
                params: { limit, ...(before && { before }) },
            }),
            transformResponse: (response: { success: boolean; data: { messages: Message[]; pagination: { page: number; limit: number; total: number; totalPages: number } } }) => response.data.messages,
            providesTags: (_result, _error, { conversationId }) => [
                { type: "Messages", id: conversationId },
            ],
        }),

        // Send a message with optimistic update
        sendMessage: builder.mutation<Message, SendMessageRequestWithSender>({
            query: ({ conversationId, receiverId, content }) => ({
                url: "/messages/messages",
                method: "POST",
                data: { conversationId, receiverId, content },
            }),
            transformResponse: (response: { success: boolean; data: Message }) => response.data,
            // Optimistic update: immediately add message to cache with pending status
            async onQueryStarted(
                { conversationId, receiverId, content, senderId, senderInfo },
                { dispatch, queryFulfilled }
            ) {
                const tempId = generateTempId();
                const now = new Date().toISOString();

                // Create optimistic message
                const optimisticMessage: Message = {
                    id: -1, // Temporary ID (will be replaced)
                    conversationId,
                    senderId,
                    receiverId,
                    content,
                    status: "SENT",
                    createdAt: now,
                    updatedAt: now,
                    sender: senderInfo,
                    receiver: senderInfo, // Will be corrected when real message arrives
                    _optimistic: true,
                    _tempId: tempId,
                };

                // Optimistically add message to cache
                const patchResult = dispatch(
                    messageApi.util.updateQueryData(
                        'getConversationMessages',
                        { conversationId, limit: 100 },
                        (draft) => {
                            draft.push(optimisticMessage);
                        }
                    )
                );

                try {
                    // Wait for the actual response
                    const { data: realMessage } = await queryFulfilled;

                    // Replace optimistic message with real message
                    dispatch(
                        messageApi.util.updateQueryData(
                            'getConversationMessages',
                            { conversationId, limit: 100 },
                            (draft) => {
                                // Find and replace the optimistic message
                                const index = draft.findIndex(m => m._tempId === tempId);
                                if (index !== -1) {
                                    draft[index] = { ...realMessage, _optimistic: false };
                                } else {
                                    // If not found (maybe already replaced by socket), check if real message exists
                                    const exists = draft.some(m => m.id === realMessage.id);
                                    if (!exists) {
                                        draft.push(realMessage);
                                    }
                                }
                            }
                        )
                    );
                } catch {
                    // On error, revert the optimistic update
                    patchResult.undo();
                }
            },
            invalidatesTags: ["Conversations"],
        }),

        // Mark messages as read
        markMessagesAsRead: builder.mutation<void, number>({
            query: (conversationId) => ({
                url: `/messages/conversations/${conversationId}/read`,
                method: "PATCH",
            }),
            invalidatesTags: (_result, _error, conversationId) => [
                "Conversations",
                { type: "Messages", id: conversationId },
            ],
        }),
    }),
});

export const {
    useGetMyConversationsQuery,
    useGetOrCreateConversationQuery,
    useLazyGetOrCreateConversationQuery,
    useGetConversationMessagesQuery,
    useSendMessageMutation,
    useMarkMessagesAsReadMutation,
    useGetUnreadCountQuery,
} = messageApi;
