import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface StripeCheckoutFormProps {
    amount: number;
    onSuccess: () => void;
    onError: (message: string) => void;
}

export function StripeCheckoutForm({ amount, onSuccess, onError }: StripeCheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useTranslation();
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
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: "if_required",
            });

            if (error) {
                const msg = error.message || t("PAYMENT.ERRORS.GENERIC");
                setErrorMessage(msg);
                onError(msg);
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                onSuccess();
            } else {
                setErrorMessage(t("PAYMENT.ERRORS.UNEXPECTED"));
                onError("Payment status unexpected");
            }
        } catch {
            const msg = t("PAYMENT.ERRORS.UNEXPECTED");
            setErrorMessage(msg);
            onError("Payment processing failed");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-muted/5 p-5 rounded-xl border border-border/40">
                <div className="flex items-center gap-2 mb-4 text-muted-foreground/80">
                    <ShieldCheck className="h-4 w-4 text-primary/70" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {t("PAYMENT.SECURE_CHECKOUT")}
                    </span>
                </div>

                <PaymentElement
                    options={{
                        layout: "tabs",
                    }}
                />
            </div>

            {errorMessage && (
                <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-semibold">
                        {errorMessage}
                    </AlertDescription>
                </Alert>
            )}

            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full h-10 rounded-lg text-sm font-bold font-spline shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all bg-primary text-primary-foreground group"
            >
                {isProcessing ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("PAYMENT.ACTIONS.PROCESSING")}</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        <span>{t("PAYMENT.ACTIONS.PAY_NOW", { amount: formatCurrency(amount) })}</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
                <ShieldCheck className="h-3 w-3 text-primary/60" />
                <span>{t("PAYMENT.SECURE_BY_STRIPE") || "Secure Payment by Stripe"}</span>
            </div>
        </form>
    );
}
