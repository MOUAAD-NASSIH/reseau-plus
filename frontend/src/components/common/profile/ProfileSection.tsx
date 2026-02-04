import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileSectionProps {
    title: string;
    icon?: LucideIcon;
    children: React.ReactNode;
}

export function ProfileSection({ title, icon: Icon, children }: ProfileSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    {Icon && <Icon className="h-5 w-5" />}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

