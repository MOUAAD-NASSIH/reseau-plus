import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileCheck, ArrowRight, Clock, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import type { WorkerDocument } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface PendingDocumentsPanelProps {
    pendingDocs: WorkerDocument[];
    isLoading: boolean;
    totalCount: number;
}

export function PendingDocumentsPanel({ pendingDocs, isLoading, totalCount }: PendingDocumentsPanelProps) {
    const { t } = useTranslation();

    const getDocumentTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'ID_CARD': t("ADMIN_DASHBOARD.PENDING_DOCS.TYPE_ID", "ID Card"),
            'DIPLOMA': t("ADMIN_DASHBOARD.PENDING_DOCS.TYPE_DIPLOMA", "Diploma"),
            'LICENSE': t("ADMIN_DASHBOARD.PENDING_DOCS.TYPE_LICENSE", "License"),
            'CERTIFICATE': t("ADMIN_DASHBOARD.PENDING_DOCS.TYPE_CERTIFICATE", "Certificate"),
        };
        return types[type] || type;
    };

    return (
        <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/40">
                <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <FileText className="h-5 w-5 text-amber-500" />
                    </div>
                    {t("ADMIN_DASHBOARD.PENDING_DOCS.TITLE", "Pending Documents")}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {totalCount > 0 && (
                        <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            {totalCount}
                        </span>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-500" asChild>
                        <Link to="/admin/documents">
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                {isLoading ? (
                    <div className="space-y-4 p-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-3 w-[100px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : pendingDocs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-muted/5 h-full">
                        <div className="bg-background p-4 rounded-full shadow-sm mb-4 border border-border/50">
                            <FileCheck className="h-8 w-8 text-muted-foreground/60" />
                        </div>
                        <p className="text-base font-medium text-foreground">
                            {t("ADMIN_DASHBOARD.PENDING_DOCS.EMPTY", "No pending documents")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 max-w-[240px] leading-relaxed">
                            {t("ADMIN_DASHBOARD.PENDING_DOCS.EMPTY_DESC", "All documents have been reviewed.")}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {pendingDocs.slice(0, 5).map((doc) => (
                            <div 
                                key={doc.id}
                                className={cn(
                                    "flex items-center gap-4 p-4 hover:bg-muted/40 transition-all border-b border-border/40 last:border-none group relative overflow-hidden",
                                )}
                            >
                                {/* Hover Effect Indicator */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200" />

                                <div className="h-11 w-11 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0 group-hover:bg-amber-500/20 transition-colors border border-transparent group-hover:border-amber-500/20">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-sm text-foreground truncate pr-2 group-hover:text-amber-600 transition-colors">
                                            {getDocumentTypeLabel(doc.type)}
                                        </h4>
                                        {doc.uploadedAt && (
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 flex-shrink-0 bg-muted/40 px-2 py-0.5 rounded-full border border-border/50">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                            {doc.worker ? (
                                                <>
                                                    <span className="text-muted-foreground/70">by</span>
                                                    <span className="text-foreground">{doc.worker.firstName} {doc.worker.lastName}</span>
                                                </>
                                            ) : (
                                                <span>Worker ID: #{doc.workerId}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
             {pendingDocs.length > 0 && (
                <div className="p-3 bg-muted/20 border-t border-border/40 text-center">
                    <Button variant="link" size="sm" className="text-muted-foreground hover:text-amber-600 text-xs" asChild>
                        <Link to="/admin/documents">
                             {t("COMMON.VIEW_ALL_COUNT", { count: totalCount, defaultValue: `View all ${totalCount} pending documents` })}
                        </Link>
                    </Button>
                </div>
            )}
        </Card>
    );
}
