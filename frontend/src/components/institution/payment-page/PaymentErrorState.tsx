
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw } from "lucide-react";

interface PaymentErrorStateProps {
    errorMessage: string;
    onRetry: () => void;
}

export function PaymentErrorState({ errorMessage, onRetry }: PaymentErrorStateProps) {
    return (
        <Card>
            <CardContent className="py-12 text-center">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
                <p className="text-muted-foreground mb-6">
                    {errorMessage || "Something went wrong. Please try again."}
                </p>
                <Button onClick={onRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
            </CardContent>
        </Card>
    );
}
