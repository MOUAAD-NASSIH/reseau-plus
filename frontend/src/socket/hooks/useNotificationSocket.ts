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

const processedNotificationIds = new Set<number>();

interface UseNotificationSocketReturn {
    isConnected: boolean;
}

export function useNotificationSocket(): UseNotificationSocketReturn {
    const { isConnected, on, off } = useSocket();
    const dispatch = useAppDispatch();
    const listenerSetup = useRef(false);

    const isNotificationProcessed = useCallback((id: number): boolean => {
        return processedNotificationIds.has(id);
    }, []);

    const markNotificationProcessed = useCallback((id: number): void => {
        processedNotificationIds.add(id);
        // Keep last 1000 to prevent memory leak
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

        // Update notifications list cache (limit: 5 for dropdown)
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

        // Update full notifications list if cached
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

        // Update unread count
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

    useEffect(() => {
        if (!isConnected) {
            listenerSetup.current = false;
            return;
        }

        if (listenerSetup.current) {
            return;
        }

        listenerSetup.current = true;
        on('notification', handleNotification);

        return () => {
            off('notification', handleNotification);
            listenerSetup.current = false;
        };
    }, [isConnected, on, off, handleNotification]);

    return {
        isConnected,
    };
}

export function clearNotificationCache(): void {
    processedNotificationIds.clear();
}
