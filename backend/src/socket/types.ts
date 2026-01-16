/**
 * Socket module types
 * Re-exports shared socket types and adds module-specific types
 */

export * from '../types/socket.types';

import type { Socket } from 'socket.io';
import type {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
} from '../types/socket.types';

// Typed Socket with our custom events and data
export type TypedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;
