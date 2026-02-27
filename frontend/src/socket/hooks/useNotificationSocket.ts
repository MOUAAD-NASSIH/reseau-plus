/**
 * Real-time notification socket hook
 * Updates RTK Query cache when notifications arrive via Socket.IO
 */

import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';
import { api } from '../../features/api/api';
import { useAppDispatch } from '../../features/hooks';
import type { NotificationPayload } from '../../types/socket.types';
import type { Notification } from '../../types/notification.types';
import { socketManager } from '../socketManager';

const processedNotificationIds = new Set<number>();

interface UseNotificationSocketReturn {
    isConnected: boolean;
}

export function useNotificationSocket(): UseNotificationSocketReturn {
    const { isConnected, on, off } = useSocket();
    const dispatch = useAppDispatch();
    const listenerSetup = useRef(false);
    const isConnectedRef = useRef(isConnected);

    useEffect(() => {
        isConnectedRef.current = isConnected;
    }, [isConnected]);

    const isNotificationProcessed = useCallback((id: number): boolean => {
        return processedNotificationIds.has(id);
    }, []);

    const markNotificationProcessed = useCallback((id: number): void => {
        processedNotificationIds.add(id);
        if (processedNotificationIds.size > 1000) {
            const idsArray = Array.from(processedNotificationIds);
            const toRemove = idsArray.slice(0, idsArray.length - 1000);
            toRemove.forEach(id => processedNotificationIds.delete(id));
        }
    }, []);

    const handleNotification = useCallback((payload: NotificationPayload) => {
        if (isNotificationProcessed(payload.id)) {
            return;
        }

        markNotificationProcessed(payload.id);

        const notification: Notification = {
            id: payload.id,
            userId: payload.userId,
            type: payload.type as Notification['type'],
            message: payload.message,
            isRead: payload.isRead,
            createdAt: payload.createdAt,
        };

        dispatch(
            api.util.updateQueryData(
                'getNotifications' as never,
                { limit: 5 } as never,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (draft: any) => {
                    if (draft?.data) {
                        const exists = draft.data.some((n: Notification) => n.id === notification.id);
                        if (!exists) {
                            draft.data.unshift(notification);
                            if (draft.data.length > 5) {
                                draft.data.pop();
                            }
                        }
                    }
                }
            )
        );

        dispatch(
            api.util.updateQueryData(
                'getNotifications' as never,
                undefined as never,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (draft: any) => {
                    if (draft?.data) {
                        const exists = draft.data.some((n: Notification) => n.id === notification.id);
                        if (!exists) {
                            draft.data.unshift(notification);
                        }
                    }
                }
            )
        );

        if (!notification.isRead) {
            dispatch(
                api.util.updateQueryData(
                    'getUnreadNotificationCount' as never,
                    undefined as never,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (draft: any) => {
                        if (draft?.data) {
                            draft.data.count = (draft.data.count || 0) + 1;
                        }
                    }
                )
            );
        }
    }, [dispatch, isNotificationProcessed, markNotificationProcessed]);

    const setupListeners = useCallback(() => {
        if (listenerSetup.current) return;
        listenerSetup.current = true;
        on('notification', handleNotification);
    }, [on, handleNotification]);

    const cleanupListeners = useCallback(() => {
        if (!listenerSetup.current) return;
        off('notification', handleNotification);
        listenerSetup.current = false;
    }, [off, handleNotification]);

    useEffect(() => {
        if (isConnected) {
            setupListeners();
        } else {
            cleanupListeners();
        }

        return cleanupListeners;
    }, [isConnected, setupListeners, cleanupListeners]);

    // Re-setup listeners on reconnection
    useEffect(() => {
        const unsubscribe = socketManager.onConnectionStateChange((state) => {
            if (state === 'connected') {
                setTimeout(() => {
                    if (isConnectedRef.current && !listenerSetup.current) {
                        setupListeners();
                    }
                }, 100);
            }
        });

        return unsubscribe;
    }, [setupListeners]);

    return {
        isConnected,
    };
}

export function clearNotificationCache(): void {
    processedNotificationIds.clear();
}
