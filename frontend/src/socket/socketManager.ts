/**
 * Socket Connection Manager
 * Handles Socket.IO connection lifecycle with JWT authentication,
 * automatic reconnection with exponential backoff, and connection state tracking.
 */

import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/socket.types';

// Typed socket with our custom events
type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Connection state
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// Event listener types
type ConnectionStateListener = (state: ConnectionState) => void;
type ErrorListener = (error: Error) => void;

interface SocketManagerConfig {
    url: string;
    reconnectionAttempts: number;
    reconnectionDelayMax: number;
    reconnectionDelayBase: number;
}

const DEFAULT_CONFIG: SocketManagerConfig = {
    url: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    reconnectionAttempts: 10,
    reconnectionDelayMax: 30000, // 30 seconds max
    reconnectionDelayBase: 1000, // 1 second base
};

class SocketManager {
    private socket: TypedSocket | null = null;
    private token: string | null = null;
    private connectionState: ConnectionState = 'disconnected';
    private connectionStateListeners: Set<ConnectionStateListener> = new Set();
    private errorListeners: Set<ErrorListener> = new Set();
    private config: SocketManagerConfig;
    private reconnectAttempt = 0;

    constructor(config: Partial<SocketManagerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }


    /**
     * Connect to the socket server with JWT authentication
     */
    connect(token: string): void {
        // Don't reconnect if already connected with same token
        if (this.socket?.connected && this.token === token) {
            return;
        }

        // Disconnect existing connection if any
        this.disconnect();

        this.token = token;
        this.setConnectionState('connecting');
        this.reconnectAttempt = 0;

        this.socket = io(this.config.url, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.config.reconnectionAttempts,
            reconnectionDelay: this.config.reconnectionDelayBase,
            reconnectionDelayMax: this.config.reconnectionDelayMax,
        });

        this.setupEventHandlers();
    }

    /**
     * Disconnect from the socket server
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.token = null;
        this.reconnectAttempt = 0;
        this.setConnectionState('disconnected');
    }

    /**
     * Check if socket is currently connected
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    /**
     * Get current connection state
     */
    getConnectionState(): ConnectionState {
        return this.connectionState;
    }

    /**
     * Subscribe to socket events
     */
    on<K extends keyof ServerToClientEvents>(
        event: K,
        handler: ServerToClientEvents[K]
    ): void {
        if (this.socket) {
            this.socket.on(event, handler as never);
        }
    }

    /**
     * Unsubscribe from socket events
     */
    off<K extends keyof ServerToClientEvents>(
        event: K,
        handler?: ServerToClientEvents[K]
    ): void {
        if (this.socket) {
            if (handler) {
                this.socket.off(event, handler as never);
            } else {
                this.socket.off(event);
            }
        }
    }

    /**
     * Emit events to the server
     */
    emit<K extends keyof ClientToServerEvents>(
        event: K,
        ...args: Parameters<ClientToServerEvents[K]>
    ): void {
        if (this.socket?.connected) {
            this.socket.emit(event, ...args);
        }
    }


    /**
     * Subscribe to connection state changes
     */
    onConnectionStateChange(listener: ConnectionStateListener): () => void {
        this.connectionStateListeners.add(listener);
        // Immediately notify of current state
        listener(this.connectionState);
        return () => {
            this.connectionStateListeners.delete(listener);
        };
    }

    /**
     * Subscribe to connection errors
     */
    onError(listener: ErrorListener): () => void {
        this.errorListeners.add(listener);
        return () => {
            this.errorListeners.delete(listener);
        };
    }

    /**
     * Get the underlying socket instance (for advanced use cases)
     */
    getSocket(): TypedSocket | null {
        return this.socket;
    }

    private setConnectionState(state: ConnectionState): void {
        if (this.connectionState !== state) {
            this.connectionState = state;
            this.connectionStateListeners.forEach((listener) => listener(state));
        }
    }

    private notifyError(error: Error): void {
        this.errorListeners.forEach((listener) => listener(error));
    }

    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.reconnectAttempt = 0;
            this.setConnectionState('connected');
        });

        this.socket.on('disconnect', (reason) => {
            // If server disconnected us, we might want to reconnect
            if (reason === 'io server disconnect') {
                // Server initiated disconnect - don't auto-reconnect
                this.setConnectionState('disconnected');
            } else {
                // Client-side disconnect or transport error - will auto-reconnect
                this.setConnectionState('reconnecting');
            }
        });

        this.socket.on('connect_error', (error) => {
            this.reconnectAttempt++;
            this.notifyError(error);

            if (this.reconnectAttempt >= this.config.reconnectionAttempts) {
                this.setConnectionState('disconnected');
            } else {
                this.setConnectionState('reconnecting');
            }
        });

        this.socket.io.on('reconnect', () => {
            this.reconnectAttempt = 0;
            this.setConnectionState('connected');
        });

        this.socket.io.on('reconnect_attempt', (attempt) => {
            this.reconnectAttempt = attempt;
            this.setConnectionState('reconnecting');
        });

        this.socket.io.on('reconnect_failed', () => {
            this.setConnectionState('disconnected');
        });
    }
}

// Export singleton instance
export const socketManager = new SocketManager();

// Export class for testing or custom instances
export { SocketManager };
