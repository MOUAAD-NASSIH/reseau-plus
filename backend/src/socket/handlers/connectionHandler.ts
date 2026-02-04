/**
 * Socket Connection Handler - manages user room subscriptions
 */

import type { TypedSocket } from '../types';

export function handleConnection(socket: TypedSocket): void {
    const { userId, role } = socket.data;
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
}

export function handleDisconnection(socket: TypedSocket, _reason: string): void {
    // Socket.IO automatically removes the socket from all rooms on disconnect
}

export function getUserRoom(userId: number): string {
    return `user:${userId}`;
}

export function getConversationRoom(conversationId: number): string {
    return `conversation:${conversationId}`;
}
