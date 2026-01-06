/**
 * Stripe Checkout Form Component
 * Handles the payment form using Stripe Elements
 */

import { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Loader2, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StripeCheckoutFormProps {
    amount: number;
    onSuccess: () => void;
    onError: (message: string) => void;
}

export function StripeCheckoutForm({ amount, onSuccess, onError }: StripeCheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("fr-MA", {
            style: "currency",
            currency: "MAD",
        }).format(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't loaded yet
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/institution/payments/success`,
                },
                redirect: "if_required",
            });

            if (error) {
                // Show error to customer
                if (error.type === "card_error" || error.type === "validation_error") {
                    setErrorMessage(error.message || "An error occurred with your payment.");
                } else {
                    setErrorMessage("An unexpected error occurred.");
                }
                onError(error.message || "Payment failed");
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                // Payment succeeded
                onSuccess();
            } else if (paymentIntent && paymentIntent.status === "requires_action") {
                // 3D Secure or other authentication required
                // Stripe will handle the redirect automatically
                setErrorMessage("Additional authentication required. Please complete the verification.");
            } else {
                // Payment is processing or requires further action
                setErrorMessage("Payment is being processed. Please wait...");
            }
        } catch {
            setErrorMessage("An unexpected error occurred. Please try again.");
            onError("Payment processing failed");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Element */}
            <div className="p-4 border rounded-lg bg-background">
                <PaymentElement
                    options={{
                        layout: "tabs",
                    }}
                />
            </div>

            {/* Error Message */}
            {errorMessage && (
                <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Your payment is secured by Stripe</span>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!stripe || !elements || isProcessing}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay {formatCurrency(amount)}
                    </>
                )}
            </Button>
        </form>
    );
}

