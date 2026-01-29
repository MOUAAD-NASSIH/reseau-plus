import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAdminLogsQuery } from '@/features/api/endpoints/adminEndpoints';
import { Loader2, FileText, Activity, ArrowRight, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Action type badge colors matching AdminLogs.tsx
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

export function DashboardLogs() {
    const { t } = useTranslation();
    const { data, isLoading } = useGetAdminLogsQuery({ limit: 5 });
    const logs = data?.data || [];

    return (
        <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/40">
                <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Activity className="h-5 w-5 text-indigo-500" />
                    </div>
                    {t("ADMIN_DASHBOARD.LOGS.TITLE", "Recent Activities")}
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-indigo-500" asChild>
                    <Link to="/admin/logs">
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                {isLoading ? (
                    <div className="space-y-4 p-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
                                    <div className="h-3 w-[150px] bg-muted animate-pulse rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-muted/5 h-full">
                        <div className="bg-background p-4 rounded-full shadow-sm mb-4 border border-border/50">
                            <FileText className="h-8 w-8 text-muted-foreground/60" />
                        </div>
                        <p className="text-base font-medium text-foreground">
                            {t("ADMIN_DASHBOARD.LOGS.EMPTY", "No logs found")}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-all border-b border-border/40 last:border-none group relative overflow-hidden"
                            >
                                {/* Hover Effect Indicator */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200" />

                                <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                                    <AvatarFallback className="bg-indigo-500/5 text-indigo-500 font-bold text-xs">
                                        #{log.adminId}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                    <div className="md:col-span-4 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "font-bold text-[10px] uppercase px-1.5 py-0.5 whitespace-nowrap shadow-sm border",
                                                    actionTypeColors[log.actionType] || "bg-muted/30 text-muted-foreground border-border/40"
                                                )}
                                            >
                                                {log.actionType.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-medium text-foreground truncate">
                                            {log.admin?.email || `Admin #${log.adminId}`}
                                        </p>
                                    </div>
                                    
                                    <div className="md:col-span-6 hidden md:flex items-center gap-2">
                                        {log.targetDocument ? (
                                            <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-1.5 group hover:bg-blue-500/10 transition-colors">
                                                <FileText className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="text-xs font-semibold text-blue-600">{log.targetDocument.type}</span>
                                                {log.targetDocument.fileUrl && (
                                                    <button
                                                        onClick={() => window.open(log.targetDocument!.fileUrl, '_blank')}
                                                        className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-md hover:bg-blue-500/20 text-blue-500 hover:text-blue-600 transition-colors"
                                                        title="View document"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : log.targetMission ? (
                                            <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-1.5">
                                                <Activity className="h-3.5 w-3.5 text-indigo-500" />
                                                <span className="text-xs font-semibold text-indigo-600 truncate max-w-[200px]">{log.targetMission.title}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/50 italic">—</span>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-2 flex items-center justify-end">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-full border border-border/50 whitespace-nowrap">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <div className="p-3 bg-muted/20 border-t border-border/40 text-center">
                <Button variant="link" size="sm" className="text-muted-foreground hover:text-indigo-500 text-xs" asChild>
                    <Link to="/admin/logs">
                        {t("COMMON.VIEW_ALL", "View all activities")}
                    </Link>
                </Button>
            </div>
        </Card>
    );
}
