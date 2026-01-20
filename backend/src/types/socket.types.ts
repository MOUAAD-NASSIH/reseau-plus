/**
 * Socket.IO Event Types
 * Shared types for socket events between frontend and backend
 */

// Notification Types
export interface NotificationPayload {
    id: number;
    userId: number;
    type: string;
    message: string;
    entityId?: number;
    entityType?: string;
    isRead: boolean;
    createdAt: string;
}

// Message Types
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface UserInfo {
    id: number;
    email: string;
    profilePicture?: string | null;
    worker?: {
        firstName: string;
        lastName: string;
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

// Socket Data (attached to socket after authentication)
export interface SocketData {
    userId: number;
    role: string;
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

// Inter-Server Events (for scaling with multiple servers)
export interface InterServerEvents {
    ping: () => void;
}
