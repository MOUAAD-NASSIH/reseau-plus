import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, PartyPopper, ArrowRight } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { shouldReduceMotion } from "@/lib/animations";
import { useNavigate } from "react-router";

interface RegistrationSuccessProps {
    title?: string;
    message?: string;
    redirectPath?: string;
    redirectLabel?: string;
}

// Pre-generated confetti particles to avoid Math.random during render
const CONFETTI_COLORS = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-green-500",
    "bg-yellow-500",
    "bg-pink-500",
];

// Generate deterministic confetti particles based on index
const generateConfettiParticles = () => {
    return Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: ((i * 17 + 7) % 100) - 50,
        y: -((i * 23 + 11) % 100) - 50,
        rotation: (i * 37) % 360,
        scale: 0.5 + ((i * 13) % 50) / 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: (i * 0.025) % 0.5,
    }));
};

export function RegistrationSuccess({
    title = "Registration Complete!",
    message = "Your account has been created successfully. You can now log in to access your dashboard.",
    redirectPath = "/login",
    redirectLabel = "Go to Login",
}: RegistrationSuccessProps) {
    const reduceMotion = shouldReduceMotion();
    const navigate = useNavigate();

    // Use memoized confetti particles
    const confettiParticles = useMemo(() => generateConfettiParticles(), []);

    return (
        <div className="relative flex flex-col items-center justify-center py-12 px-4 text-center overflow-hidden">
            {/* Confetti Animation */}
            {!reduceMotion && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {confettiParticles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            className={`absolute w-3 h-3 rounded-sm ${particle.color}`}
                            style={{
                                left: "50%",
                                top: "30%",
                            }}
                            initial={{
                                x: 0,
                                y: 0,
                                rotate: 0,
                                scale: 0,
                                opacity: 1,
                            }}
                            animate={{
                                x: particle.x * 4,
                                y: particle.y * -3,
                                rotate: particle.rotation,
                                scale: particle.scale,
                                opacity: [1, 1, 0],
                            }}
                            transition={{
                                duration: 2,
                                delay: particle.delay,
                                ease: "easeOut",
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Success Icon with Pulse Animation */}
            <motion.div
                className="relative mb-8"
                initial={reduceMotion ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                }}
            >
                {/* Pulse rings */}
                {!reduceMotion && (
                    <>
                        <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2.5, opacity: 0 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 0.5,
                            }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2.5, opacity: 0 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 0.5,
                                delay: 0.5,
                            }}
                        />
                    </>
                )}

                {/* Main icon container */}
                <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <motion.div
                        initial={reduceMotion ? {} : { scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.4,
                        }}
                    >
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Party Popper Icons */}
            {!reduceMotion && (
                <>
                    <motion.div
                        className="absolute top-8 left-1/4"
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.6, type: "spring" }}
                    >
                        <PartyPopper className="w-8 h-8 text-yellow-500" />
                    </motion.div>
                    <motion.div
                        className="absolute top-8 right-1/4"
                        initial={{ scale: 0, rotate: 30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.7, type: "spring" }}
                    >
                        <PartyPopper className="w-8 h-8 text-pink-500 -scale-x-100" />
                    </motion.div>
                </>
            )}

            {/* Title */}
            <motion.h2
                className="text-3xl font-bold text-foreground mb-4"
                initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {title}
            </motion.h2>

            {/* Message */}
            <motion.p
                className="text-muted-foreground max-w-md mb-8"
                initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                {message}
            </motion.p>

            {/* CTA Button */}
            <motion.div
                initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <AnimatedButton
                    size="lg"
                    onClick={() => navigate(redirectPath)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                    {redirectLabel}
                </AnimatedButton>
            </motion.div>

            {/* Additional info */}
            <motion.p
                className="text-xs text-muted-foreground mt-6"
                initial={reduceMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
            >
                A confirmation email has been sent to your inbox
            </motion.p>
        </div>
    );
}

export default RegistrationSuccess;
