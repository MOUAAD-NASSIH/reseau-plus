
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface NotificationsTabsProps {
    activeTab: string;
    onTabChange: (value: string) => void;
    unreadCount: number;
    t: (key: string) => string;
}

export function NotificationsTabs({ activeTab, onTabChange, unreadCount, t }: NotificationsTabsProps) {
    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="bg-muted/50 p-1 h-auto flex-wrap justify-start gap-1 backdrop-blur-sm border border-border/40 rounded-xl">
                {["ALL", "UNREAD", "MISSIONS", "PAYMENTS", "SYSTEM"].map((tab) => (
                    <TabsTrigger
                        key={tab}
                        value={tab}
                        className="px-5 py-2.5 rounded-lg font-bold transition-all data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary"
                    >
                        {t(`NOTIFICATIONS.TABS.${tab}`)}
                        {tab === "UNREAD" && unreadCount > 0 && (
                            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary animate-pulse border-none">
                                {unreadCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
