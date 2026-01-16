/**
 * Socket.IO Authentication Middleware - verifies JWT tokens for WebSocket connections
 */

import type { Socket } from 'socket.io';
import { verifyToken } from '../services/authServices';
import type {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
} from './types';

type TypedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

function extractToken(socket: TypedSocket): string | null {
    const authToken = socket.handshake.auth?.token;
    if (authToken && typeof authToken === 'string') {
        return authToken;
    }

    const queryToken = socket.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
        return queryToken;
    }

    const authHeader = socket.handshake.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    return null;
}

export function socketAuthMiddleware(
    socket: TypedSocket,
    next: (err?: Error) => void
): void {
    const token = extractToken(socket);

    if (!token) {
        const error = new Error('Authentication error: No token provided');
        error.name = 'AuthenticationError';
        return next(error);
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId || !decoded.role) {
        const error = new Error('Authentication error: Invalid or expired token');
        error.name = 'AuthenticationError';
        return next(error);
    }

    socket.data.userId = decoded.userId;
    socket.data.role = decoded.role;

    next();
}

export function isSocketAuthenticated(socket: TypedSocket): boolean {
    return (
        typeof socket.data.userId === 'number' &&
        typeof socket.data.role === 'string'
    );
}
