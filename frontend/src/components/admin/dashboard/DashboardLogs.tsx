import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAdminLogsQuery } from '@/features/api/endpoints/adminEndpoints';
import { FileText, ArrowRight, Clock, User, FileCheck, XCircle, Shield, FolderPlus, FolderEdit, FolderMinus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

// Action type configurations with icons and colors
const actionConfig: Record<string, { icon: typeof User; color: string; bgColor: string }> = {
    WORKER_VERIFIED: { icon: User, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
    WORKER_REJECTED: { icon: XCircle, color: 'text-rose-600', bgColor: 'bg-rose-500/10 border-rose-500/20' },
    DOCUMENT_APPROVED: { icon: FileCheck, color: 'text-blue-600', bgColor: 'bg-blue-500/10 border-blue-500/20' },
    DOCUMENT_REJECTED: { icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-500/10 border-amber-500/20' },
    USER_SUSPENDED: { icon: Shield, color: 'text-orange-600', bgColor: 'bg-orange-500/10 border-orange-500/20' },
    USER_BANNED: { icon: Shield, color: 'text-red-600', bgColor: 'bg-red-500/10 border-red-500/20' },
    USER_ACTIVATED: { icon: Shield, color: 'text-green-600', bgColor: 'bg-green-500/10 border-green-500/20' },
    CREATE_DOMAIN: { icon: FolderPlus, color: 'text-cyan-600', bgColor: 'bg-cyan-500/10 border-cyan-500/20' },
    UPDATE_DOMAIN: { icon: FolderEdit, color: 'text-indigo-600', bgColor: 'bg-indigo-500/10 border-indigo-500/20' },
    DELETE_DOMAIN: { icon: FolderMinus, color: 'text-rose-600', bgColor: 'bg-rose-500/10 border-rose-500/20' },
};

export function DashboardLogs() {
    const { t, i18n } = useTranslation();
    const { data, isLoading } = useGetAdminLogsQuery({ limit: 5 });
    const logs = data?.data || [];
    const dateLocale = i18n.language === 'fr' ? fr : enUS;

    return (
        <Card className="border-none shadow-md bg-card flex flex-col h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                <CardTitle className="text-base font-semibold font-spline text-muted-foreground uppercase tracking-wider flex items-center gap-2">
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
                    <div className="space-y-1 p-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-4 p-4">
                                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-[60%]" />
                                    <Skeleton className="h-3 w-[40%]" />
                                </div>
                                <Skeleton className="h-6 w-20" />
                            </div>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <div className="bg-muted/30 p-4 rounded-full mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground/60" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {t("ADMIN_DASHBOARD.LOGS.EMPTY", "No logs found")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("ADMIN_DASHBOARD.LOGS.EMPTY_DESC", "Activity will appear here")}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/30">
                        {logs.map((log) => {
                            const config = actionConfig[log.actionType] || {
                                icon: FileText,
                                color: 'text-muted-foreground',
                                bgColor: 'bg-muted/30 border-border/40'
                            };
                            const Icon = config.icon;

                            return (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-all group"
                                >
                                    {/* Admin Avatar */}
                                    <Avatar className="h-12 w-12 border-2 border-border/50 shadow-sm shrink-0 group-hover:border-primary/30 transition-colors">
                                        <AvatarImage
                                            src={log.admin?.profilePicture || undefined}
                                            alt={log.admin?.email || `Admin #${log.adminId}`}
                                        />
                                        <AvatarFallback className="bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 font-bold text-sm">
                                            {log.admin?.email?.[0]?.toUpperCase() || 'A'}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        {/* Action Badge & Title */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "font-semibold text-[10px] uppercase px-2 py-0.5 border shadow-sm",
                                                    config.bgColor
                                                )}
                                            >
                                                <Icon className={cn("h-3 w-3 mr-1", config.color)} />
                                                {t(`ADMIN_DASHBOARD.LOGS.ACTION.${log.actionType}`) || log.actionType.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>

                                        {/* Details */}
                                        <div className="flex items-center gap-2 text-sm flex-wrap">
                                            <span className="text-muted-foreground">by</span>
                                            <span className="font-medium text-foreground truncate max-w-[150px]" title={log.admin?.email}>
                                                {log.admin?.email || `Admin #${log.adminId}`}
                                            </span>

                                            {log.targetUser && (
                                                <>
                                                    <ArrowRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                                    <span className="font-medium text-foreground/90 truncate max-w-[150px]" title={log.targetUser.email}>
                                                        {log.targetUser.worker
                                                            ? `${log.targetUser.worker.firstName} ${log.targetUser.worker.lastName}`
                                                            : log.targetUser.institution
                                                                ? log.targetUser.institution.institutionName
                                                                : log.targetUser.email}
                                                    </span>
                                                </>
                                            )}

                                            {log.targetDocument && (
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                                    {log.targetDocument.type} #{log.targetDocument.id}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Reason if exists */}
                                        {log.reason && (
                                            <p className="text-xs text-muted-foreground italic line-clamp-1">
                                                "{log.reason}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide bg-muted/20 px-2.5 py-1.5 rounded-full border border-border/30 whitespace-nowrap shrink-0">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: dateLocale })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
            {logs.length > 0 && (
                <div className="p-4 border-t border-border/40 bg-muted/5">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-9 hover:bg-indigo-500/5 hover:text-indigo-600 hover:border-indigo-500/30"
                        asChild
                    >
                        <Link to="/admin/logs">
                            {t("COMMON.VIEW_ALL", "View All Activities")}
                        </Link>
                    </Button>
                </div>
            )}
        </Card>
    );
}
