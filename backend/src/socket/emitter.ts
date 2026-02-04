/**
 * Socket Emitter Service - singleton for emitting socket events from services
 */

import { getSocketServer, TypedSocketServer } from './index';
import { getUserRoom, getConversationRoom } from './handlers/connectionHandler';
import type { NotificationPayload, MessagePayload, MessageReadPayload } from './types';

export interface SocketEmitter {
    emitToUser<T>(userId: number, event: string, data: T): boolean;
    emitToConversation<T>(conversationId: number, event: string, data: T): boolean;
    emitToRoom<T>(room: string, event: string, data: T): boolean;
    emitNotification(userId: number, notification: NotificationPayload): boolean;
    emitMessage(conversationId: number, message: MessagePayload): boolean;
    emitMessageRead(conversationId: number, payload: MessageReadPayload): boolean;
}

function createSocketEmitter(): SocketEmitter {
    const getServer = (): TypedSocketServer | null => {
        const io = getSocketServer();
        if (!io) {
            console.warn('[SocketEmitter] Socket server not initialized');
        }
        return io;
    };

    return {
        emitToUser<T>(userId: number, event: string, data: T): boolean {
            const io = getServer();
            if (!io) return false;

            const room = getUserRoom(userId);
            io.to(room).emit(event as any, data);
            return true;
        },

        emitToConversation<T>(conversationId: number, event: string, data: T): boolean {
            const io = getServer();
            if (!io) return false;

            const room = getConversationRoom(conversationId);
            io.to(room).emit(event as any, data);
            return true;
        },

        emitToRoom<T>(room: string, event: string, data: T): boolean {
            const io = getServer();
            if (!io) return false;

            io.to(room).emit(event as any, data);
            return true;
        },

        emitNotification(userId: number, notification: NotificationPayload): boolean {
            return this.emitToUser(userId, 'notification', notification);
        },

        emitMessage(conversationId: number, message: MessagePayload): boolean {
            return this.emitToConversation(conversationId, 'message', message);
        },

        emitMessageRead(conversationId: number, payload: MessageReadPayload): boolean {
            return this.emitToConversation(conversationId, 'messageRead', payload);
        },
    };
}

export const socketEmitter = createSocketEmitter();
export { createSocketEmitter };
