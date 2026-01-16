
import { Badge } from "@/components/ui/badge";

interface MissionStatusTagsProps {
    status: string;
    id: number;
    urgency: string;
    t: (key: string, options?: any) => string;
}

export function MissionStatusTags({ status, id, urgency, t }: MissionStatusTagsProps) {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2 animate-pulse" />
                {status}
            </Badge>
            <span className="text-sm font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md">ID: MSN-{id}</span>
            <Badge variant="outline" className="text-xs font-semibold capitalize border-border/60">
                {t("MISSION_DETAILS.PRIORITY", { priority: urgency.charAt(0) + urgency.slice(1).toLowerCase() })}
            </Badge>
        </div>
    );
}
