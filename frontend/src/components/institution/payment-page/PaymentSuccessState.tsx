
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router";

interface PaymentSuccessStateProps {
    assignmentId: number;
    existingPayment?: {
        amountTotal: number;
        paidAt?: string | null;
    };
    formatCurrency: (amount: number) => string;
    isPreExisting?: boolean;
}

export function PaymentSuccessState({ 
    assignmentId, 
    existingPayment, 
    formatCurrency, 
    isPreExisting = false 
}: PaymentSuccessStateProps) {
    return (
        <Card>
            <CardContent className="py-12 text-center">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                    {isPreExisting ? "Payment Completed" : "Payment Successful!"}
                </h2>
                <p className="text-muted-foreground mb-6">
                    {isPreExisting 
                        ? "This assignment has already been paid."
                        : "The payment has been processed successfully."
                    }
                </p>

                {isPreExisting && existingPayment && (
                    <div className="bg-muted rounded-lg p-4 max-w-sm mx-auto mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Amount Paid</span>
                            <span className="font-semibold">
                                {formatCurrency(existingPayment.amountTotal)}
                            </span>
                        </div>
                        {existingPayment.paidAt && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Paid On</span>
                                <span>
                                    {new Date(existingPayment.paidAt).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link to={`/institution/assignments/${assignmentId}`}>
                            View Assignment
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link to="/institution/payments/history">
                            View Payment History
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
