
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationsHeaderProps {
    unreadCount: number;
    onMarkAllRead: () => void;
    t: (key: string) => string;
}

export function NotificationsHeader({ unreadCount, onMarkAllRead, t }: NotificationsHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t("NOTIFICATIONS.TITLE")}
                    </h1>
                </div>
                <p className="text-muted-foreground text-lg ml-1">
                    {t("NOTIFICATIONS.SUBTITLE")}
                </p>
            </div>

            {unreadCount > 0 && (
                <Button
                    variant="outline"
                    onClick={onMarkAllRead}
                    className="font-semibold shadow-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    {t("NOTIFICATIONS.ACTIONS.MARK_ALL_READ")}
                </Button>
            )}
        </div>
    );
}
