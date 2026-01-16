/**
 * Socket Context Provider
 * Provides socket connection state and management throughout the app.
 * Automatically connects when user is authenticated and disconnects on logout.
 */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import { socketManager, type ConnectionState } from './socketManager';
import { useAppSelector } from '../features/hooks';

interface SocketContextValue {
    isConnected: boolean;
    connectionState: ConnectionState;
    connectionError: Error | null;
    connect: () => void;
    disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
    children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [connectionError, setConnectionError] = useState<Error | null>(null);

    // Get auth state from Redux
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    const connect = useCallback(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            setConnectionError(null);
            socketManager.connect(token);
        }
    }, []);

    const disconnect = useCallback(() => {
        socketManager.disconnect();
        setConnectionError(null);
    }, []);


    // Subscribe to connection state changes
    useEffect(() => {
        const unsubscribeState = socketManager.onConnectionStateChange((state) => {
            setConnectionState(state);
        });

        const unsubscribeError = socketManager.onError((error) => {
            setConnectionError(error);
        });

        return () => {
            unsubscribeState();
            unsubscribeError();
        };
    }, []);

    // Auto-connect when authenticated, disconnect when logged out
    useEffect(() => {
        if (isAuthenticated) {
            connect();
        } else {
            disconnect();
        }
    }, [isAuthenticated, connect, disconnect]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            socketManager.disconnect();
        };
    }, []);

    const value: SocketContextValue = {
        isConnected: connectionState === 'connected',
        connectionState,
        connectionError,
        connect,
        disconnect,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

/**
 * Hook to access socket context
 * Must be used within a SocketProvider
 */
export function useSocketContext(): SocketContextValue {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
}
