
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

interface PaymentPageHeaderProps {
    assignmentId: number;
    title?: string;
}

export function PaymentPageHeader({ assignmentId }: PaymentPageHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Link to="/institution" className="hover:text-primary transition-colors flex items-center gap-1">
                    {t("ASSIGNED_MISSION_VIEW.HEADER.BREADCRUMBS.DASHBOARD")}
                </Link>
                <ChevronRight className="h-4 w-4 text-border" />
                <Link to={`/institution/assignments/${assignmentId}`} className="hover:text-primary transition-colors flex items-center gap-1">
                    {t("ASSIGNED_MISSION_VIEW.HEADER.BREADCRUMBS.ASSIGNMENT_ID", { id: assignmentId })}
                </Link>
                <ChevronRight className="h-4 w-4 text-border" />
                <span className="text-foreground font-medium truncate">
                    {t("HEADER_TITLES.PAYMENT")}
                </span>
            </div>
        </div>
    );
}
