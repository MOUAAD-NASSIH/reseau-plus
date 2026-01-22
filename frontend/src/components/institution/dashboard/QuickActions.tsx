import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { Briefcase, FileText, MessageCircle, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
    const { t } = useTranslation();

    const actions = [
        {
            to: "/institution/missions/create",
            icon: PlusCircle,
            label: t("INSTITUTION_DASHBOARD.QUICK_ACTIONS.CREATE_MISSION"),
            color: "bg-primary/10 text-primary hover:bg-primary/20"
        },
        {
            to: "/institution/missions",
            icon: Briefcase,
            label: t("INSTITUTION_DASHBOARD.QUICK_ACTIONS.VIEW_MISSIONS"),
            color: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20"
        },
        {
            to: "/institution/applications",
            icon: FileText,
            label: t("INSTITUTION_DASHBOARD.QUICK_ACTIONS.VIEW_APPLICATIONS"),
            color: "bg-chart-4/10 text-chart-4 hover:bg-chart-4/20"
        },
        {
            to: "/institution/messages",
            icon: MessageCircle,
            label: t("INSTITUTION_DASHBOARD.QUICK_ACTIONS.VIEW_MESSAGES"),
            color: "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20"
        }
    ];

    return (
        <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold font-spline text-muted-foreground uppercase tracking-wider">
                    {t("INSTITUTION_DASHBOARD.SECTIONS.QUICK_ACTIONS")}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.to}
                            to={action.to}
                            className={cn(
                                "flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-border/50 bg-card hover:border-primary/20 hover:shadow-md group",
                                "relative overflow-hidden"
                            )}
                        >
                            <div className={cn("p-2.5 rounded-full backdrop-blur-sm transition-colors duration-300", action.color)}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold text-center text-foreground group-hover:text-primary transition-colors">
                                {action.label}
                            </span>
                        </Link>
                    );
                })}
            </CardContent>
        </Card>
    );
}
