/**
 * Real-time messaging socket hook
 * Handles conversation rooms, message events, and typing indicators
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSocket } from './useSocket';
import { messageApi } from '../../features/api/endpoints/messageEndpoints';
import { useAppDispatch } from '../../features/hooks';
import type { MessagePayload, TypingPayload, MessageReadPayload } from '../../types/socket.types';
import type { Message } from '../../features/api/endpoints/messageEndpoints';
import { socketManager } from '../socketManager';

const processedMessageIds = new Set<number>();

interface UseMessageSocketReturn {
    typingUsers: TypingPayload[];
    sendTypingIndicator: (isTyping: boolean) => void;
    markConversationAsRead: () => void;
    isRealtime: boolean;
}

export function useMessageSocket(conversationId: number | null): UseMessageSocketReturn {
    const { isConnected, on, off, emit } = useSocket();
    const dispatch = useAppDispatch();
    const [typingUsers, setTypingUsers] = useState<TypingPayload[]>([]);
    const currentConversationRef = useRef<number | null>(null);
    const isConnectedRef = useRef(isConnected);
    const listenerSetup = useRef(false);

    // Keep ref updated
    useEffect(() => {
        isConnectedRef.current = isConnected;
    }, [isConnected]);

    const handleMessage = useCallback((payload: MessagePayload) => {
        // Only process messages for the current conversation
        if (conversationId === null || payload.conversationId !== conversationId) {
            return;
        }

        // Deduplication check
        if (processedMessageIds.has(payload.id)) {
            return;
        }

        processedMessageIds.add(payload.id);

        // Keep last 500 to prevent memory leak
        if (processedMessageIds.size > 500) {
            const idsArray = Array.from(processedMessageIds);
            const toRemove = idsArray.slice(0, idsArray.length - 500);
            toRemove.forEach(msgId => processedMessageIds.delete(msgId));
        }

        const message: Message = {
            id: payload.id,
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            receiverId: payload.receiverId,
            content: payload.content,
            status: payload.status,
            createdAt: payload.createdAt,
            updatedAt: payload.updatedAt,
            sender: payload.sender as Message['sender'],
            receiver: payload.sender as Message['receiver'],
        };

        dispatch(
            messageApi.util.updateQueryData(
                'getConversationMessages',
                { conversationId: payload.conversationId, limit: 100 },
                (draft) => {
                    const exists = draft.some(m => m.id === message.id);
                    if (!exists) {
                        draft.push(message);
                    }
                }
            )
        );

        dispatch(messageApi.util.invalidateTags(['Conversations']));
    }, [dispatch, conversationId]);

    const handleTyping = useCallback((payload: TypingPayload) => {
        if (conversationId === null || payload.conversationId !== conversationId) {
            return;
        }

        setTypingUsers(prev => {
            if (payload.isTyping) {
                const exists = prev.some(t => t.userId === payload.userId);
                if (!exists) {
                    return [...prev, payload];
                }
                return prev;
            } else {
                return prev.filter(t => t.userId !== payload.userId);
            }
        });

        if (payload.isTyping) {
            setTimeout(() => {
                setTypingUsers(prev => prev.filter(t => t.userId !== payload.userId));
            }, 3000);
        }
    }, [conversationId]);

    const handleMessageRead = useCallback((payload: MessageReadPayload) => {
        if (conversationId === null || payload.conversationId !== conversationId) {
            return;
        }

        dispatch(
            messageApi.util.updateQueryData(
                'getConversationMessages',
                { conversationId: payload.conversationId, limit: 100 },
                (draft) => {
                    draft.forEach(message => {
                        if (message.receiverId === payload.readBy && message.status !== 'READ') {
                            message.status = 'READ';
                        }
                    });
                }
            )
        );
    }, [dispatch, conversationId]);

    const sendTypingIndicator = useCallback((isTyping: boolean) => {
        if (conversationId && isConnected) {
            emit('typing', { conversationId, isTyping });
        }
    }, [conversationId, isConnected, emit]);

    const markConversationAsRead = useCallback(() => {
        if (conversationId && isConnected) {
            emit('markRead', { conversationId });
        }
    }, [conversationId, isConnected, emit]);

    // Setup listeners
    const setupListeners = useCallback(() => {
        if (listenerSetup.current) return;
        listenerSetup.current = true;
        on('message', handleMessage);
        on('typing', handleTyping);
        on('messageRead', handleMessageRead);
    }, [on, handleMessage, handleTyping, handleMessageRead]);

    // Cleanup listeners
    const cleanupListeners = useCallback(() => {
        if (!listenerSetup.current) return;
        off('message', handleMessage);
        off('typing', handleTyping);
        off('messageRead', handleMessageRead);
        listenerSetup.current = false;
    }, [off, handleMessage, handleTyping, handleMessageRead]);

    // Main effect: setup/cleanup based on connection state
    useEffect(() => {
        if (isConnected) {
            setupListeners();
        } else {
            cleanupListeners();
        }

        return cleanupListeners;
    }, [isConnected, setupListeners, cleanupListeners]);

    // Handle conversation changes
    useEffect(() => {
        const previousConversation = currentConversationRef.current;

        if (!isConnected) {
            currentConversationRef.current = null;
            queueMicrotask(() => setTypingUsers([]));
            return;
        }

        if (previousConversation !== null && previousConversation !== conversationId) {
            emit('leaveConversation', previousConversation);
        }

        if (conversationId !== null && conversationId !== previousConversation) {
            emit('joinConversation', conversationId);
            queueMicrotask(() => setTypingUsers([]));
        }

        currentConversationRef.current = conversationId;

        return () => {
            if (conversationId !== null && currentConversationRef.current === conversationId) {
                emit('leaveConversation', conversationId);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, isConnected]);

    // Additional safeguard: listen for reconnection events
    useEffect(() => {
        const handleReconnect = () => {
            setTimeout(() => {
                if (isConnectedRef.current && !listenerSetup.current) {
                    setupListeners();
                }
            }, 100);
        };

        const unsubscribe = socketManager.onConnectionStateChange((state) => {
            if (state === 'connected') {
                handleReconnect();
            }
        });

        return unsubscribe;
    }, [setupListeners]);

    return {
        typingUsers,
        sendTypingIndicator,
        markConversationAsRead,
        isRealtime: isConnected,
    };
}

export function clearMessageCache(): void {
    processedMessageIds.clear();
}
