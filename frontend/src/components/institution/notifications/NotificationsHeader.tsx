import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationsHeaderProps {
    unreadCount: number;
    onMarkAllRead: () => void;
    t: (key: string) => string;
}

export function NotificationsHeader({
    unreadCount,
    onMarkAllRead,
    t,
}: NotificationsHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <div className="relative">
                        <Bell className="h-8 w-8 text-primary" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse leading-none">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </div>
                    {t("NOTIFICATIONS.TITLE")}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t("NOTIFICATIONS.SUBTITLE")}
                </p>
            </div>

            {unreadCount > 0 && (
                <Button
                    onClick={onMarkAllRead}
                    className="rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                    size="lg"
                >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    {t("NOTIFICATIONS.ACTIONS.MARK_ALL_READ")}
                </Button>
            )}
        </div>
    );
}
