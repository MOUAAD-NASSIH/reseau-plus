import { Trophy, Calendar, Check, Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification.types";
import { NOTIFICATION_METADATA } from "@/features/hooks/InstitutionHooks/useInstitutionNotifications";

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigate: (url: string) => void;
  getRedirectUrl: (type: any) => string | null;
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
            <Trophy className="h-12 w-12 text-primary" />
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
        const meta =
          NOTIFICATION_METADATA[notification.type] ||
          NOTIFICATION_METADATA.GENERAL;
        const Icon = meta.icon;
        const redirectUrl = getRedirectUrl(notification.type);

        return (
          <Card
            key={notification.id}
            className={cn(
              "group border-border/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 overflow-hidden",
              !notification.isRead &&
                "bg-primary/[0.02] border-primary/20 shadow-lg shadow-primary/5"
            )}
          >
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-stretch">
                {/* Left Status Bar */}
                {!notification.isRead && (
                  <div className="w-1.5 bg-primary relative overflow-hidden hidden sm:block">
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                )}

                <div className="flex-1 p-5 flex items-start gap-4">
                  {/* Category Icon */}
                  <div
                    className={cn(
                      "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110",
                      meta.color,
                      "border-current/10"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                      <Badge
                        variant="outline"
                        className="w-fit text-[10px] font-black uppercase tracking-widest bg-muted/30"
                      >
                        {meta.category}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    <p
                      className={cn(
                        "text-foreground/90 text-[15px] leading-relaxed",
                        !notification.isRead && "font-bold text-foreground"
                      )}
                    >
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onMarkAsRead(notification.id)}
                          className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(notification.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:text-destructive/10 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {redirectUrl && (
                      <Button
                        size="sm"
                        variant={notification.isRead ? "ghost" : "secondary"}
                        onClick={() => {
                          if (!notification.isRead)
                            onMarkAsRead(notification.id);
                          onNavigate(redirectUrl);
                        }}
                        className="rounded-full font-bold group/btn"
                      >
                        {t("COMMON.VIEW_DETAILS")}
                        <ArrowRight className="h-3.5 w-3.5 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
