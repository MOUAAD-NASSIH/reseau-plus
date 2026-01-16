/**
 * Socket.IO Event Types
 * Mirrored from backend/src/types/socket.types.ts
 * These types must be kept in sync with the backend
 */

// Notification Types
export interface NotificationPayload {
    id: number;
    userId: number;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

// Message Types
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface UserInfo {
    id: number;
    email: string;
    worker?: {
        firstName: string;
        lastName: string;
        profilePicture?: string | null;
    };
    institution?: {
        institutionName: string;
        logo?: string | null;
    };
}

export interface MessagePayload {
    id: number;
    conversationId: number;
    senderId: number;
    receiverId: number;
    content: string;
    status: MessageStatus;
    createdAt: string;
    updatedAt: string;
    sender: UserInfo;
}

export interface MessageReadPayload {
    conversationId: number;
    readBy: number;
    readAt: string;
}

export interface TypingPayload {
    conversationId: number;
    userId: number;
    userName: string;
    isTyping: boolean;
}

// Error Types
export interface ErrorPayload {
    code: string;
    message: string;
}

// Server to Client Events
export interface ServerToClientEvents {
    notification: (data: NotificationPayload) => void;
    message: (data: MessagePayload) => void;
    messageRead: (data: MessageReadPayload) => void;
    typing: (data: TypingPayload) => void;
    error: (data: ErrorPayload) => void;
}

// Client to Server Events
export interface ClientToServerEvents {
    joinConversation: (conversationId: number) => void;
    leaveConversation: (conversationId: number) => void;
    typing: (data: { conversationId: number; isTyping: boolean }) => void;
    markRead: (data: { conversationId: number }) => void;
}
