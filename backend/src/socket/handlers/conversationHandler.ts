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

async function getUserName(userId: number): Promise<string> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            worker: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
            institution: {
                select: {
                    institutionName: true,
                },
            },
        },
    });

    if (user?.worker) {
        return `${user.worker.firstName} ${user.worker.lastName}`;
    }
    if (user?.institution) {
        return user.institution.institutionName;
    }
    return 'Unknown User';
}

export async function handleJoinConversation(
    socket: TypedSocket,
    conversationId: number
): Promise<void> {
    const { userId } = socket.data;

    console.log('[handleJoinConversation] Request to join:', { userId, conversationId, socketId: socket.id });

    try {
        const isParticipant = await isUserParticipant(userId, conversationId);

        if (!isParticipant) {
            console.log('[handleJoinConversation] User not authorized:', { userId, conversationId });
            socket.emit('error', {
                code: 'UNAUTHORIZED',
                message: 'Not authorized to join this conversation',
            });
            return;
        }

        const conversationRoom = getConversationRoom(conversationId);
        socket.join(conversationRoom);

        console.log('[handleJoinConversation] User joined room:', { userId, conversationRoom, socketId: socket.id });
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

    console.log('[handleLeaveConversation] User left room:', { userId: socket.data.userId, conversationRoom, socketId: socket.id });
}

export async function handleTyping(
    socket: TypedSocket,
    data: { conversationId: number; isTyping: boolean }
): Promise<void> {
    const { userId } = socket.data;
    const { conversationId, isTyping } = data;

    try {
        const isParticipant = await isUserParticipant(userId, conversationId);

        if (!isParticipant) {
            return;
        }

        const userName = await getUserName(userId);
        const conversationRoom = getConversationRoom(conversationId);

        socket.to(conversationRoom).emit('typing', {
            conversationId,
            userId,
            userName,
            isTyping,
        });
    } catch (error) {
        console.error('Error handling typing indicator:', error);
    }
}

export async function handleMarkRead(
    socket: TypedSocket,
    data: { conversationId: number }
): Promise<void> {
    const { userId } = socket.data;
    const { conversationId } = data;

    try {
        const isParticipant = await isUserParticipant(userId, conversationId);

        if (!isParticipant) {
            return;
        }

        // Update messages in database
        await prisma.message.updateMany({
            where: {
                conversationId,
                receiverId: userId,
                status: {
                    not: 'READ',
                },
            },
            data: {
                status: 'READ',
            },
        });

        const conversationRoom = getConversationRoom(conversationId);

        // Broadcast read receipt to conversation
        socket.to(conversationRoom).emit('messageRead', {
            conversationId,
            readBy: userId,
            readAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}

export function registerConversationHandlers(socket: TypedSocket): void {
    socket.on('joinConversation', (conversationId: number) => {
        handleJoinConversation(socket, conversationId);
    });

    socket.on('leaveConversation', (conversationId: number) => {
        handleLeaveConversation(socket, conversationId);
    });

    socket.on('typing', (data: { conversationId: number; isTyping: boolean }) => {
        handleTyping(socket, data);
    });

    socket.on('markRead', (data: { conversationId: number }) => {
        handleMarkRead(socket, data);
    });
}
