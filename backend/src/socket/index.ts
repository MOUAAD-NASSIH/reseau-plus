/**
 * Socket.IO Server Module - handles WebSocket connections for real-time features
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
} from './types';
import { socketAuthMiddleware } from './socketAuthMiddleware';
import {
    handleConnection,
    handleDisconnection,
    getConversationRoom,
} from './handlers/connectionHandler';
import { registerConversationHandlers } from './handlers/conversationHandler';

export type TypedSocketServer = SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

let io: TypedSocketServer | null = null;

export interface SocketServerConfig {
    httpServer: HttpServer;
    corsOrigin: string | string[];
}

export function createSocketServer(config: SocketServerConfig): TypedSocketServer {
    const { httpServer, corsOrigin } = config;

    io = new SocketIOServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(httpServer, {
        cors: {
            origin: corsOrigin,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        handleConnection(socket);
        registerConversationHandlers(socket);

        socket.on('typing', (data) => {
            const conversationRoom = getConversationRoom(data.conversationId);
            socket.to(conversationRoom).emit('typing', {
                conversationId: data.conversationId,
                userId: socket.data.userId,
                userName: '',
                isTyping: data.isTyping,
            });
        });

        socket.on('disconnect', (reason) => {
            handleDisconnection(socket, reason);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
}

export function getSocketServer(): TypedSocketServer | null {
    return io;
}

export function isSocketServerInitialized(): boolean {
    return io !== null;
}
