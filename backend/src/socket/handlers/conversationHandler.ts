/**
 * Conversation Room Handler - manages room subscriptions with authorization
 */

import type { TypedSocket } from '../types';
import { prisma } from '../../lib/prisma';
import { getConversationRoom } from './connectionHandler';

export async function isUserParticipant(
    userId: number,
    conversationId: number
): Promise<boolean> {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participantIds: {
                has: userId,
            },
        },
    });

    return conversation !== null;
}

export async function handleJoinConversation(
    socket: TypedSocket,
    conversationId: number
): Promise<void> {
    const { userId } = socket.data;

    try {
        const isParticipant = await isUserParticipant(userId, conversationId);

        if (!isParticipant) {
            socket.emit('error', {
                code: 'UNAUTHORIZED',
                message: 'Not authorized to join this conversation',
            });
            return;
        }

        const conversationRoom = getConversationRoom(conversationId);
        socket.join(conversationRoom);
    } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', {
            code: 'INTERNAL_ERROR',
            message: 'Failed to join conversation',
        });
    }
}

export function handleLeaveConversation(
    socket: TypedSocket,
    conversationId: number
): void {
    const conversationRoom = getConversationRoom(conversationId);
    socket.leave(conversationRoom);
}

export function registerConversationHandlers(socket: TypedSocket): void {
    socket.on('joinConversation', (conversationId: number) => {
        handleJoinConversation(socket, conversationId);
    });

    socket.on('leaveConversation', (conversationId: number) => {
        handleLeaveConversation(socket, conversationId);
    });
}
