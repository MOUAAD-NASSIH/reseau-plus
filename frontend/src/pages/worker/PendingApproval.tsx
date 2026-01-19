import { Clock, FileCheck, User, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

/**
 * Page displayed to workers with PENDING status when they try to access
 * restricted pages that require verification.
 */
export default function PendingApproval() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                        <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-2xl">{t("PENDING_APPROVAL.TITLE")}</CardTitle>
                    <CardDescription className="text-base">
                        {t("PENDING_APPROVAL.DESC")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t("PENDING_APPROVAL.ALERT.TITLE")}</AlertTitle>
                        <AlertDescription>
                            {t("PENDING_APPROVAL.ALERT.DESC")}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <h3 className="font-semibold">{t("PENDING_APPROVAL.WAIT_TITLE")}</h3>
                        <div className="grid gap-3">
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{t("PENDING_APPROVAL.ACTIONS.PROFILE_TITLE")}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("PENDING_APPROVAL.ACTIONS.PROFILE_DESC")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <FileCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{t("PENDING_APPROVAL.ACTIONS.DOCS_TITLE")}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("PENDING_APPROVAL.ACTIONS.DOCS_DESC")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Button onClick={() => navigate("/worker/profile")} variant="default">
                            {t("PENDING_APPROVAL.ACTIONS.GO_PROFILE")}
                        </Button>
                        <Button onClick={() => navigate("/worker/documents")} variant="outline">
                            {t("PENDING_APPROVAL.ACTIONS.MANAGE_DOCS")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

