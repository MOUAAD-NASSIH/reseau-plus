import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useWorkerNotifications } from "@/features/hooks/WorkerHooks/useWorkerNotifications";
import { WorkerNotificationsHeader } from "@/components/worker/notifications/WorkerNotificationsHeader";
import { WorkerNotificationsTabs } from "@/components/worker/notifications/WorkerNotificationsTabs";
import { WorkerNotificationsList } from "@/components/worker/notifications/WorkerNotificationsList";

export default function WorkerNotifications() {
    const {
        t,
        navigate,
        activeTab,
        setActiveTab,
        isLoading,
        filteredNotifications,
        unreadCount,
        handleMarkAsRead,
        handleMarkAllAsRead,
        handleDelete,
        getRedirectUrl,
        formatDate,
    } = useWorkerNotifications();

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 font-spline animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER */}
            <WorkerNotificationsHeader
                unreadCount={unreadCount}
                onMarkAllRead={handleMarkAllAsRead}
                t={t}
            />

            {/* TABS & MAIN CONTENT */}
            <div className="space-y-6">
                <WorkerNotificationsTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    unreadCount={unreadCount}
                    t={t}
                />

                <div className="space-y-3">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Card key={i} className="border-border/40 overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex gap-4">
                                        <Skeleton className="h-12 w-12 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-1/3" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <WorkerNotificationsList
                            notifications={filteredNotifications}
                            onMarkAsRead={handleMarkAsRead}
                            onDelete={handleDelete}
                            onNavigate={(url) => navigate(url)}
                            getRedirectUrl={getRedirectUrl}
                            formatDate={formatDate}
                            t={t}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
