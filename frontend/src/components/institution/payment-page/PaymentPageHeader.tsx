
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

interface PaymentPageHeaderProps {
    assignmentId: number;
    title?: string;
}

export function PaymentPageHeader({ assignmentId, title = "Payment" }: PaymentPageHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild aria-label="Go back to assignment">
                <Link to={`/institution/assignments/${assignmentId}`}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <h1 className="text-xl font-semibold">{title}</h1>
        </div>
    );
}
