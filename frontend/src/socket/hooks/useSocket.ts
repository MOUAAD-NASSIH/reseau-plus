/**
 * Socket access hook - wraps socket context
 */

import { useSocketContext } from '../SocketContext';
import { socketManager } from '../socketManager';
import type { ServerToClientEvents, ClientToServerEvents } from '../../types/socket.types';

interface UseSocketReturn {
    isConnected: boolean;
    connectionError: Error | null;
    on: <K extends keyof ServerToClientEvents>(
        event: K,
        handler: ServerToClientEvents[K]
    ) => void;
    off: <K extends keyof ServerToClientEvents>(
        event: K,
        handler?: ServerToClientEvents[K]
    ) => void;
    emit: <K extends keyof ClientToServerEvents>(
        event: K,
        ...args: Parameters<ClientToServerEvents[K]>
    ) => void;
}

export function useSocket(): UseSocketReturn {
    const { isConnected, connectionError } = useSocketContext();

    return {
        isConnected,
        connectionError,
        on: socketManager.on.bind(socketManager),
        off: socketManager.off.bind(socketManager),
        emit: socketManager.emit.bind(socketManager),
    };
}
