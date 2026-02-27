/**
 * Socket Context Provider
 * Manages Socket.IO connection lifecycle with automatic connect/disconnect
 * based on authentication state.
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
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('auth_token'));

    // Listen for storage changes (login/logout from other tabs)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'auth_token') {
                setIsAuthenticated(!!e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Poll for token changes (handles same-tab updates)
    useEffect(() => {
        const interval = setInterval(() => {
            const hasToken = !!localStorage.getItem('auth_token');
            setIsAuthenticated(prev => prev !== hasToken ? hasToken : prev);
        }, 500);

        return () => clearInterval(interval);
    }, []);

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
        let connectTimeout: ReturnType<typeof setTimeout>;

        const attemptConnect = () => {
            if (isAuthenticated) {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    connectTimeout = setTimeout(() => {
                        connect();
                    }, 100);
                } else {
                    // Retry if token not yet available
                    connectTimeout = setTimeout(attemptConnect, 200);
                }
            } else {
                disconnect();
            }
        };

        attemptConnect();

        return () => {
            if (connectTimeout) clearTimeout(connectTimeout);
        };
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
 */
export function useSocketContext(): SocketContextValue {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
}
