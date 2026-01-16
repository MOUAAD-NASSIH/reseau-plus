
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentDetailsCardProps {
    budget: number;
    isLoading: boolean;
    onInitiatePayment: () => void;
    formatCurrency: (amount: number) => string;
}

export function PaymentDetailsCard({ 
    budget, 
    isLoading, 
    onInitiatePayment, 
    formatCurrency 
}: PaymentDetailsCardProps) {
    if (!budget) return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No budget specified for this mission.</p>
            </CardContent>
        </Card>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                    Review the payment breakdown before proceeding
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(budget)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">
                        Platform Fee (15%)
                    </span>
                    <span>
                        {formatCurrency(budget * 0.15)}
                    </span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold text-lg">
                        {formatCurrency(budget)}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground">
                    The worker will receive{" "}
                    {formatCurrency(budget * 0.85)} after
                    platform fees.
                </p>
                <div className="pt-2">
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={onInitiatePayment}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Initializing Payment...
                            </>
                        ) : (
                            "Proceed to Checkout"
                        )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                        You will be able to enter your card details on the next screen.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
