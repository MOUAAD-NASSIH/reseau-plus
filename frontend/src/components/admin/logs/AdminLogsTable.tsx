import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Eye,
    FileText,
    User,
    Calendar,
    Building2
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { type AdminLog } from "@/features/api/endpoints/adminEndpoints";

interface AdminLogsTableProps {
    logs: AdminLog[];
    isLoading: boolean;
    onViewLog: (log: AdminLog) => void;
    hasActiveFilters: boolean;
    clearFilters: () => void;
}

// Action type badge colors with premium palette
const actionTypeColors: Record<string, string> = {
    VERIFY_WORKER: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    REJECT_WORKER: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    APPROVE_DOCUMENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    REJECT_DOCUMENT: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    UPDATE_USER_STATUS: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    CREATE_DOMAIN: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    UPDATE_DOMAIN: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    DELETE_DOMAIN: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

export function AdminLogsTable({
    logs,
    isLoading,
    onViewLog,
    hasActiveFilters,
    clearFilters
}: AdminLogsTableProps) {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === "fr" ? fr : enUS;

    const getTargetName = (log: AdminLog) => {
        if (!log.targetUser) return null;
        if (log.targetUser.worker) {
            return `${log.targetUser.worker.firstName} ${log.targetUser.worker.lastName}`;
        }
        if (log.targetUser.institution) {
            return log.targetUser.institution.institutionName;
        }
        return log.targetUser.email;
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/40">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-[150px]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="py-20 px-4">
                <EmptyState
                    icon={FileText}
                    title={t("ADMIN_LOGS.LIST.EMPTY")}
                    description={
                        hasActiveFilters
                            ? t("ADMIN_LOGS.LIST.EMPTY_DESC")
                            : t("ADMIN_LOGS.LIST.EMPTY_GENERIC")
                    }
                    action={
                        hasActiveFilters ? (
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="rounded-xl px-8 h-10 font-bold uppercase tracking-wide text-xs"
                            >
                                {t("ADMIN_LOGS.FILTERS.CLEAR")}
                            </Button>
                        ) : undefined
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop View (Table) */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-muted/30 hover:bg-muted/30">
                        <TableRow className="border-border/40 hover:bg-transparent">
                            <TableHead className="w-[80px] pl-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {t("ADMIN_LOGS.LIST.COLUMNS.ID")}
                            </TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {t("ADMIN_LOGS.LIST.COLUMNS.ACTION")}
                            </TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {t("ADMIN_LOGS.LIST.COLUMNS.ADMIN")}
                            </TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {t("ADMIN_LOGS.LIST.COLUMNS.TARGET")}
                            </TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {t("ADMIN_LOGS.LIST.COLUMNS.DATE")}
                            </TableHead>
                            <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {t("ADMIN_LOGS.LIST.COLUMNS.ACTIONS")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow
                                key={log.id}
                                className="group border-border/40 hover:bg-muted/30 transition-all duration-300 cursor-pointer"
                                onClick={() => onViewLog(log)}
                            >
                                <TableCell className="pl-6 font-mono text-xs font-bold opacity-50">
                                    #{log.id.toString().padStart(4, "0")}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`font-black tracking-widest text-[9px] uppercase px-2 py-0.5 whitespace-nowrap shadow-sm ${actionTypeColors[log.actionType] ||
                                            "bg-muted/30 text-muted-foreground border-border/40"
                                            }`}
                                    >
                                        {log.actionType.replace(/_/g, " ")}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-border/50">
                                            <AvatarImage src={log.admin?.profilePicture || undefined} />
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                AD
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span
                                                className="font-bold text-sm tracking-tight text-foreground truncate max-w-[140px]"
                                                title={log.admin?.email}
                                            >
                                                {log.admin?.email.split("@")[0]}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {log.targetUserId ? (
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border border-border/50">
                                                <AvatarImage src={log.targetUser?.profilePicture || undefined} />
                                                <AvatarFallback className={`text-xs font-bold ${log.targetUser?.institution ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {log.targetUser?.institution
                                                        ? <Building2 className="h-3.5 w-3.5" />
                                                        : (log.targetUser?.worker
                                                            ? getInitials(log.targetUser.worker.firstName + " " + log.targetUser.worker.lastName)
                                                            : <User className="h-3.5 w-3.5" />)
                                                    }
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm tracking-tight text-foreground truncate max-w-[140px]">
                                                    {getTargetName(log)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground opacity-30 font-black text-[10px] tracking-widest px-2">
                                            —
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-xs">
                                        <span className="font-bold text-foreground/80">
                                            {format(new Date(log.createdAt), "d MMM yyyy", { locale: dateLocale })}
                                        </span>
                                        <span className="text-muted-foreground font-mono text-[10px]">
                                            {format(new Date(log.createdAt), "HH:mm")}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="pr-6 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">{t("ADMIN_LOGS.LIST.VIEW")}</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="lg:hidden space-y-4">
                {logs.map((log) => (
                    <Card
                        key={log.id}
                        className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm active:scale-[0.98] transition-all duration-200"
                        onClick={() => onViewLog(log)}
                    >
                        <CardContent className="p-4 space-y-4">
                            {/* Header: ID & Date */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                        #{log.id.toString().padStart(4, "0")}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(log.createdAt), "d MMM", { locale: dateLocale })}
                                    </span>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`font-black tracking-widest text-[8px] uppercase px-1.5 py-0.5 whitespace-nowrap ${actionTypeColors[log.actionType] ||
                                        "bg-muted/30 text-muted-foreground border-border/40"
                                        }`}
                                >
                                    {log.actionType.replace(/_/g, " ")}
                                </Badge>
                            </div>

                            {/* Content */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider opacity-70">
                                        {t("ADMIN_LOGS.LIST.COLUMNS.ADMIN")}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 border border-border/50">
                                            <AvatarImage src={log.admin?.profilePicture || undefined} />
                                            <AvatarFallback className="bg-primary/5 text-primary text-[9px] font-bold">
                                                AD
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-bold truncate">
                                            {log.admin?.email.split("@")[0]}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider opacity-70">
                                        {t("ADMIN_LOGS.LIST.COLUMNS.TARGET")}
                                    </span>
                                    {log.targetUserId ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6 border border-border/50">
                                                <AvatarImage src={log.targetUser?.profilePicture || undefined} />
                                                <AvatarFallback className={`text-[9px] font-bold ${log.targetUser?.institution ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {log.targetUser?.institution
                                                        ? <Building2 className="h-3 w-3" />
                                                        : (log.targetUser?.worker
                                                            ? getInitials(log.targetUser.worker.firstName + " " + log.targetUser.worker.lastName)
                                                            : <User className="h-3 w-3" />)
                                                    }
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-semibold truncate">
                                                {getTargetName(log)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">—</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
