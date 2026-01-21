import { Bell, Check, Trash2, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NOTIFICATION_METADATA } from "@/features/hooks/InstitutionHooks/useInstitutionNotifications";
import type { Notification } from "@/types/notification.types";

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigate: (url: string) => void;
  getRedirectUrl: (notification: Notification) => string | null;
  formatDate: (date: string) => string;
  t: (key: string) => string;
}

export function NotificationsList({
  notifications,
  onMarkAsRead,
  onDelete,
  onNavigate,
  getRedirectUrl,
  formatDate,
  t,
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 border-2 border-dashed border-border/60 rounded-3xl animate-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative h-24 w-24 rounded-full bg-background border shadow-2xl flex items-center justify-center">
            <Bell className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">
            {t("NOTIFICATIONS.EMPTY.TITLE")}
          </h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {t("NOTIFICATIONS.EMPTY.SUBTITLE")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const meta = NOTIFICATION_METADATA[notification.type] || NOTIFICATION_METADATA.GENERAL;
        const Icon = meta.icon;
        const redirectUrl = getRedirectUrl(notification);
        const isClickable = !!redirectUrl;

        return (
          <Card
            key={notification.id}
            className={cn(
              "group transition-all duration-300 border-l-4",
              notification.isRead
                ? "bg-background/50 border-l-border/50 opacity-75 hover:opacity-100"
                : "bg-card border-l-primary shadow-lg shadow-primary/5",
              isClickable && "cursor-pointer hover:shadow-xl hover:scale-[1.01]"
            )}
            onClick={() => {
              if (!notification.isRead) onMarkAsRead(notification.id);
              if (isClickable) onNavigate(redirectUrl);
            }}
          >
            <CardContent className="p-5 flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
                  meta.color
                )}
              >
                <Icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-background",
                          meta.color
                        )}
                      >
                        {meta.category}
                      </span>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap tabular-nums flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      !notification.isRead
                        ? "font-semibold text-foreground"
                        : "font-medium text-muted-foreground"
                    )}
                  >
                    {notification.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity -mr-2">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    title={t("WORKER_NOTIFICATIONS.ACTIONS.MARK_READ")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  title={t("WORKER_NOTIFICATIONS.ACTIONS.DELETE")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {isClickable && (
                  <div className="h-8 w-8 flex items-center justify-center text-muted-foreground/30">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
