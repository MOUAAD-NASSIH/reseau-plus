import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../features/api/baseQuery";

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

export const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Conversations", "Messages"],
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
      providesTags: (result, error, otherUserId) => [
        { type: "Conversations", id: otherUserId },
      ],
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
      transformResponse: (response: { success: boolean; data: Message[] }) => response.data,
      providesTags: (result, error, { conversationId }) => [
        { type: "Messages", id: conversationId },
      ],
    }),

    // Send a message
    sendMessage: builder.mutation<Message, SendMessageRequest>({
      query: (body) => ({
        url: "/messages/messages",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: { success: boolean; data: Message }) => response.data,
      invalidatesTags: (result, error, { conversationId }) => [
        "Conversations",
        { type: "Messages", id: conversationId },
      ],
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation<void, number>({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, conversationId) => [
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
} = messageApi;
