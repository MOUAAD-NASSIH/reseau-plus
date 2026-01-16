/**
 * ConnectionStatusIndicator - shows banner when WebSocket connection fails repeatedly
 */

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocketContext } from '@/socket/SocketContext';

const SHOW_INDICATOR_AFTER_ATTEMPTS = 3;
let reconnectionAttempts = 0;

interface ConnectionStatusIndicatorProps {
    className?: string;
    variant?: 'banner' | 'inline';
}

export function ConnectionStatusIndicator({
    className,
    variant = 'banner'
}: ConnectionStatusIndicatorProps) {
    const { connectionState, connectionError, connect } = useSocketContext();
    const [showIndicator, setShowIndicator] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);

    useEffect(() => {
        if (connectionState === 'connected') {
            setShowIndicator(false);
            setDismissed(false);
            reconnectionAttempts = 0;
            setIsReconnecting(false);
        } else if (connectionState === 'reconnecting') {
            reconnectionAttempts++;
            setIsReconnecting(true);

            if (reconnectionAttempts >= SHOW_INDICATOR_AFTER_ATTEMPTS) {
                setShowIndicator(true);
                setDismissed(false);
            }
        } else if (connectionState === 'disconnected') {
            if (reconnectionAttempts >= SHOW_INDICATOR_AFTER_ATTEMPTS) {
                setShowIndicator(true);
                setIsReconnecting(false);
            }
        }
    }, [connectionState]);

    if (dismissed || !showIndicator) {
        return null;
    }

    const handleRetry = () => {
        setIsReconnecting(true);
        connect();
    };

    const handleDismiss = () => {
        setDismissed(true);
    };

    const getStatusMessage = (): string => {
        if (isReconnecting || connectionState === 'reconnecting') {
            return `Reconnecting... (attempt ${reconnectionAttempts})`;
        }
        if (connectionState === 'disconnected') {
            return 'Real-time updates unavailable';
        }
        return 'Connection issues detected';
    };

    const getStatusDescription = (): string => {
        if (isReconnecting || connectionState === 'reconnecting') {
            return 'Attempting to restore real-time connection...';
        }
        return 'Some features may be delayed. The app will continue to work with periodic updates.';
    };

    if (variant === 'inline') {
        return (
            <div
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                    'bg-warning/10 border border-warning/30 text-warning-foreground',
                    className
                )}
                role="status"
                aria-live="polite"
            >
                {isReconnecting || connectionState === 'reconnecting' ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-warning" />
                ) : (
                    <WifiOff className="h-4 w-4 text-warning" />
                )}
                <span className="text-sm font-medium">{getStatusMessage()}</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
                'max-w-md w-full mx-4',
                'animate-in slide-in-from-bottom-4 fade-in duration-300',
                className
            )}
            role="alert"
            aria-live="assertive"
        >
            <div className={cn(
                'flex items-start gap-3 p-4 rounded-lg shadow-lg',
                'bg-card border border-warning/50',
                'backdrop-blur-sm'
            )}>
                <div className={cn('shrink-0 p-2 rounded-full', 'bg-warning/10')}>
                    {isReconnecting || connectionState === 'reconnecting' ? (
                        <RefreshCw className="h-5 w-5 animate-spin text-warning" />
                    ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <WifiOff className="h-4 w-4 text-warning" />
                        <h3 className="text-sm font-semibold text-foreground">
                            {getStatusMessage()}
                        </h3>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {getStatusDescription()}
                    </p>

                    {connectionError && connectionState === 'disconnected' && (
                        <p className="mt-1 text-xs text-destructive/80 truncate">
                            {connectionError.message}
                        </p>
                    )}

                    {connectionState === 'disconnected' && !isReconnecting && (
                        <div className="mt-3 flex items-center gap-2">
                            <button
                                onClick={handleRetry}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md',
                                    'bg-primary text-primary-foreground',
                                    'hover:bg-primary/90 transition-colors',
                                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                                )}
                            >
                                <RefreshCw className="h-3 w-3" />
                                Retry Connection
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleDismiss}
                    className={cn(
                        'shrink-0 p-1 rounded-md',
                        'text-muted-foreground hover:text-foreground',
                        'hover:bg-muted/50 transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-primary'
                    )}
                    aria-label="Dismiss connection status"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function resetConnectionAttempts(): void {
    reconnectionAttempts = 0;
}
