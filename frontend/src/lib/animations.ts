import type { Variants, Transition } from "framer-motion";

export interface AnimationConfig {
    initial: object;
    animate: object;
    exit?: object;
    transition: Transition;
}

// Page entrance animation
export const pageVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

// Stagger children animation
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

// Fade up animation for list items
export const fadeUpItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

// Fade in animation
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

// Slide animations
export const slideLeft: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

export const slideRight: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
};

// Scale animation for buttons
export const buttonScale = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 } as Transition,
};

// Default transition presets
export const defaultTransition: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 20,
};

export const quickTransition: Transition = {
    duration: 0.15,
    ease: "easeOut",
};

export const smoothTransition: Transition = {
    duration: 0.3,
    ease: "easeInOut",
};

/**
 * Check if user prefers reduced motion
 * Returns true if the user has enabled reduced motion in their system settings
 */
export const shouldReduceMotion = (): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Get animation props based on reduced motion preference
 * Returns static values if user prefers reduced motion, otherwise returns the full animation config
 */
export const getAnimationProps = (config: AnimationConfig): AnimationConfig => {
    if (shouldReduceMotion()) {
        return {
            initial: config.animate,
            animate: config.animate,
            exit: config.animate,
            transition: { duration: 0 },
        };
    }
    return config;
};

/**
 * Create a safe animation config that respects reduced motion preferences
 * Provides graceful degradation for animation failures
 */
export function safeAnimate(config: AnimationConfig): AnimationConfig {
    try {
        if (shouldReduceMotion()) {
            return {
                initial: config.animate,
                animate: config.animate,
                exit: config.animate,
                transition: { duration: 0 },
            };
        }
        return config;
    } catch (error) {
        console.warn("Animation config error, falling back to static:", error);
        return {
            initial: {},
            animate: {},
            transition: { duration: 0 },
        };
    }
}

// Animation presets for common use cases
export const animationPresets = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: quickTransition,
    },
    fadeUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: defaultTransition,
    },
    fadeDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: defaultTransition,
    },
    scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: defaultTransition,
    },
} as const;
