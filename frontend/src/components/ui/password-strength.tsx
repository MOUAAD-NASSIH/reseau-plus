import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";

interface PasswordStrengthProps {
    password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const { t } = useTranslation();
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        let score = 0;
        if (!password) {
            setStrength(0);
            return;
        }
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        setStrength(score);
    }, [password]);

    const strengthColor = [
        "bg-muted",
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-emerald-500",
    ];



    const strengthKeys = [
        "",
        "COMMON.PASSWORD_STRENGTH.WEAK",
        "COMMON.PASSWORD_STRENGTH.FAIR",
        "COMMON.PASSWORD_STRENGTH.GOOD",
        "COMMON.PASSWORD_STRENGTH.STRONG",
    ];

    if (!password) return null;

    return (
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-muted-foreground uppercase tracking-wider">
                    {t("COMMON.PASSWORD_STRENGTH.STRENGTH_LABEL") || "Password Strength"}
                </span>
                <span className={cn("font-bold", strengthColor[strength].replace("bg-", "text-"))}>
                    {strength > 0 ? t(strengthKeys[strength]) : ""}
                </span>
            </div>
            <div className="flex gap-1 h-1.5 w-full">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-full flex-1 rounded-full transition-colors duration-300",
                            i <= strength ? strengthColor[strength] : "bg-muted"
                        )}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                    {password.length >= 8 ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Circle className="h-3 w-3" />}
                    {t("COMMON.PASSWORD_REQUIREMENTS.LENGTH")}
                </div>
                <div className="flex items-center gap-2">
                    {/[A-Z]/.test(password) ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Circle className="h-3 w-3" />}
                    {t("COMMON.PASSWORD_REQUIREMENTS.UPPERCASE")}
                </div>
                <div className="flex items-center gap-2">
                    {/[0-9]/.test(password) ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Circle className="h-3 w-3" />}
                    {t("COMMON.PASSWORD_REQUIREMENTS.NUMBER")}
                </div>
                <div className="flex items-center gap-2">
                    {/[^A-Za-z0-9]/.test(password) ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Circle className="h-3 w-3" />}
                    {t("COMMON.PASSWORD_REQUIREMENTS.SPECIAL")}
                </div>
            </div>
        </div>
    );
}
