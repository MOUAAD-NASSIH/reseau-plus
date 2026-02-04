/**
 * Stripe Configuration
 * Initialize Stripe with the publishable key
 */

import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
    console.warn("Stripe publishable key is not configured. Payment features will not work.");
}

// Load Stripe outside of component to avoid recreating on every render
export const stripePromise = stripePublishableKey
    ? loadStripe(stripePublishableKey)
    : null;

