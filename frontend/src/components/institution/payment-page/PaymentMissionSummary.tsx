
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentMissionSummaryProps {
    assignment: any;
    formatCurrency: (amount: number) => string;
}

export function PaymentMissionSummary({ assignment, formatCurrency }: PaymentMissionSummaryProps) {
    if (!assignment) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mission Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Mission</span>
                    <span className="font-medium text-right ml-4">{assignment.mission?.title}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Worker</span>
                    <span>
                        {assignment.worker?.firstName} {assignment.worker?.lastName}
                    </span>
                </div>
                {assignment.mission?.budget && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Mission Budget</span>
                        <span className="font-semibold">
                            {formatCurrency(assignment.mission.budget)}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
