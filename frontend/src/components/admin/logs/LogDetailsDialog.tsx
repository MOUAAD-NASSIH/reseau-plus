import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import {
    X,
    Calendar,
    User,
    Eye,
    ShieldCheck,
    Activity,
    FileText,
    AlertTriangle,
    Building2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type AdminLog } from "@/features/api/endpoints/adminEndpoints";

interface LogDetailsDialogProps {
    log: AdminLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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


export function LogDetailsDialog({ log, open, onOpenChange }: LogDetailsDialogProps) {
    const { t, i18n } = useTranslation();
    if (!log) return null;

    const dateLocale = i18n.language === "fr" ? fr : enUS;

    const getTargetName = () => {
        if (!log.targetUser) return null;
        if (log.targetUser.worker) {
            return `${log.targetUser.worker.firstName} ${log.targetUser.worker.lastName}`;
        }
        if (log.targetUser.institution) {
            return log.targetUser.institution.institutionName;
        }
        return log.targetUser.email;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl w-full max-h-[90vh] p-0 gap-0 overflow-hidden bg-background border-none shadow-2xl rounded-2xl flex flex-col font-spline"
            >
                {/* Header Section */}
                <div className="relative shrink-0">
                    <div className={`h-28 bg-linear-to-r ${log.actionType.includes("REJECT") ? "from-red-500/10 via-red-500/5" :
                        log.actionType.includes("VERIFY") || log.actionType.includes("APPROVE") ? "from-emerald-500/10 via-emerald-500/5" :
                            "from-primary/10 via-primary/5"
                        } to-background border-b border-border/40 relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                            <Activity className="w-56 h-56 rotate-12" />
                        </div>
                        <DialogClose className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/50 hover:bg-background transition-colors cursor-pointer">
                            <X className="w-5 h-5 text-muted-foreground" />
                        </DialogClose>
                    </div>

                    <div className="px-6 md:px-8 -mt-10 flex flex-col md:flex-row items-start md:items-end gap-6 relative z-10 pb-6 border-b border-border/40">
                        <div className={`h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-background shadow-xl flex items-center justify-center border border-border/50 shrink-0 ${log.actionType.includes("REJECT") ? "text-red-500" :
                            log.actionType.includes("VERIFY") || log.actionType.includes("APPROVE") ? "text-emerald-500" :
                                "text-primary"
                            }`}>
                            {log.actionType.includes("DOCUMENT") ? <FileText className="h-10 w-10" /> :
                                log.actionType.includes("WORKER") ? <ShieldCheck className="h-10 w-10" /> :
                                    <Activity className="h-10 w-10" />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2 w-full">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold text-foreground">
                                    {t("ADMIN_LOGS.DIALOG.TITLE")}
                                </h2>
                                <Badge
                                    variant="outline"
                                    className={`font-black tracking-widest text-[10px] uppercase px-2 py-1 ${actionTypeColors[log.actionType] ||
                                        "bg-muted/30 text-muted-foreground border-border/40"
                                        }`}
                                >
                                    {log.actionType.replace(/_/g, " ")}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm flex items-center gap-2 font-mono">
                                <span className="font-bold text-foreground opacity-60">ID: #{log.id}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Rejection/Action Reason */}
                            {log.reason && (
                                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-red-700 dark:text-red-400">
                                            {t("ADMIN_LOGS.DIALOG.REJECTION_REASON")}
                                        </h4>
                                        <p className="text-sm text-foreground/80 leading-relaxed">
                                            {log.reason}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Context Data (Document/Mission) */}
                            {(log.targetDocument || log.targetMission) ? (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                        <FileText className="w-5 h-5 text-primary" />
                                        {t("ADMIN_LOGS.DIALOG.CONTEXT_DATA")}
                                    </h3>
                                    <div className="grid gap-4">
                                        {log.targetDocument && (
                                            <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                            {t("ADMIN_LOGS.DIALOG.AFFECTED_DOCUMENT")}
                                                        </p>
                                                        <h4 className="font-bold text-lg">{log.targetDocument.type}</h4>
                                                    </div>
                                                    <Badge variant="outline" className="font-mono text-[10px]">ID: {log.targetDocument.id}</Badge>
                                                </div>
                                                {log.targetDocument.fileUrl && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full mt-2"
                                                        onClick={() => window.open(log.targetDocument!.fileUrl, "_blank")}
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        {t("COMMON.VIEW_DETAILS")}
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {log.targetMission && (
                                            <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                            {t("ADMIN_LOGS.DIALOG.AFFECTED_MISSION")}
                                                        </p>
                                                        <h4 className="font-bold text-lg">{log.targetMission.title}</h4>
                                                    </div>
                                                    <Badge variant="outline" className="font-mono text-[10px]">ID: {log.targetMission.id}</Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-foreground">
                                            {t("ADMIN_LOGS.DIALOG.ACTION_SUMMARY")}
                                        </h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {t("ADMIN_LOGS.DIALOG.ACTION_SUMMARY_DESC")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Actors & Metadata */}
                        <div className="space-y-6">
                            {/* Admin Card */}
                            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                                    <ShieldCheck className="w-4 h-4" />
                                    {t("ADMIN_LOGS.DIALOG.EXECUTED_BY")}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-border/50">
                                        <AvatarImage src={log.admin?.profilePicture || undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                            <ShieldCheck className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate" title={log.admin?.email}>
                                            {log.admin?.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            ID: #{log.adminId}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Target User Card */}
                            {log.targetUserId && (
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
                                    <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                                        <User className="w-4 h-4" />
                                        {t("ADMIN_LOGS.DIALOG.TARGET_USER")}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-border/50">
                                            <AvatarImage src={log.targetUser?.profilePicture || undefined} />
                                            <AvatarFallback className={`text-xs font-bold ${log.targetUser?.institution ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {log.targetUser?.institution
                                                    ? <Building2 className="h-5 w-5" />
                                                    : <User className="h-5 w-5" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm truncate" title={getTargetName() || ""}>
                                                {getTargetName()}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                                    {log.targetUser?.role?.name || "USER"}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground font-mono">
                                                    ID: #{log.targetUserId}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="bg-muted/20 rounded-2xl p-5 space-y-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span className="font-medium uppercase tracking-wide">
                                        {t("ADMIN_LOGS.DIALOG.CREATED_AT")}
                                    </span>
                                </div>
                                <p className="font-bold text-sm pl-5.5">
                                    {format(new Date(log.createdAt), "PPP p", { locale: dateLocale })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
