import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileCheck, ArrowRight, FileText } from "lucide-react";
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
        <Card className="border-none shadow-md bg-card flex flex-col h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                <CardTitle className="text-base font-semibold font-spline text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    {t("ADMIN_DASHBOARD.PENDING_DOCS.TITLE", "Pending Documents")}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {totalCount > 0 && (
                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-bold px-2 py-0.5 rounded-full">
                            {totalCount}
                        </span>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-600" asChild>
                        <Link to="/admin/documents">
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 px-2 pb-2">
                {isLoading ? (
                    <div className="space-y-4 p-4">
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
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-muted/5 mx-4 rounded-xl mb-4 border border-dashed border-border/50">
                        <div className="bg-background p-3 rounded-full shadow-sm mb-3">
                            <FileCheck className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {t("ADMIN_DASHBOARD.PENDING_DOCS.EMPTY", "No pending documents")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                            {t("ADMIN_DASHBOARD.PENDING_DOCS.EMPTY_DESC", "All documents have been reviewed")}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {pendingDocs.slice(0, 5).map((doc) => (
                            <div
                                key={doc.id}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all group cursor-default",
                                )}
                            >
                                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-500/20 transition-colors">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h4 className="font-medium text-sm text-foreground truncate group-hover:text-amber-600 transition-colors flex items-center gap-2">
                                            {getDocumentTypeLabel(doc.type)}
                                            {doc.type === 'DIPLOMA' && doc.title && (
                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal border border-border/50 max-w-[120px] truncate">
                                                    {doc.title}
                                                </span>
                                            )}
                                        </h4>
                                        {doc.uploadedAt && (
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                                            {doc.worker ? (
                                                <>
                                                    <span className="opacity-70">by</span>
                                                    <span>{doc.worker.firstName} {doc.worker.lastName}</span>
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
                <div className="p-4 pt-0">
                    <Button variant="outline" className="w-full text-xs h-9 border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-600 hover:border-amber-500/30" asChild>
                        <Link to="/admin/documents">
                            {t("ADMIN_DASHBOARD.PENDING_DOCS.VIEW_ALL", "Review Documents")}
                        </Link>
                    </Button>
                </div>
            )}
        </Card>
    );
}

