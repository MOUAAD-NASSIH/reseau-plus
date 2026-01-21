import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface WorkerNotificationsTabsProps {
    activeTab: string;
    onTabChange: (value: string) => void;
    unreadCount: number;
    t: (key: string) => string;
}

export function WorkerNotificationsTabs({
    activeTab,
    onTabChange,
    unreadCount,
    t,
}: WorkerNotificationsTabsProps) {
    const tabs = [
        { id: "ALL", label: t("WORKER_NOTIFICATIONS.TABS.ALL") },
        { id: "UNREAD", label: t("WORKER_NOTIFICATIONS.TABS.UNREAD"), count: unreadCount },
        { id: "MISSIONS", label: "Missions" },
        { id: "PAYMENTS", label: "Payments" },
        { id: "SYSTEM", label: "System" },
    ];

    const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label;

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            {/* Mobile View: Select Dropdown */}
            <div className="md:hidden w-full">
                <Select value={activeTab} onValueChange={onTabChange}>
                    <SelectTrigger className="w-full h-12 rounded-xl bg-muted/50 border-transparent font-medium">
                        <SelectValue placeholder={activeLabel} />
                    </SelectTrigger>
                    <SelectContent>
                        {tabs.map((tab) => (
                            <SelectItem key={tab.id} value={tab.id} className="font-medium">
                                <div className="flex items-center gap-2">
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                            {tab.count}
                                        </Badge>
                                    )}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Desktop View: Tabs List */}
            <TabsList className="hidden md:inline-flex bg-muted/50 rounded-2xl h-12 p-1 gap-1 w-auto">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="rounded-xl px-4 h-full transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium"
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <Badge
                                variant={activeTab === tab.id ? "default" : "secondary"}
                                className={`ml-2 h-5 min-w-[20px] px-1.5 ${activeTab === tab.id
                                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                                    : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                {tab.count}
                            </Badge>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
