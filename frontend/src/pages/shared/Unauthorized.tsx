import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Home, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { shouldReduceMotion, fadeUpItem } from "@/lib/animations";

export default function Unauthorized() {
    // Check if user is authenticated by token presence
    const isAuthenticated = !!localStorage.getItem("auth_token");
    const { t } = useTranslation();
    const reduceMotion = shouldReduceMotion();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background embellishments */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-destructive/5 blur-[100px]" />
            </div>

            <motion.div
                initial="initial"
                animate="animate"
                variants={reduceMotion ? {} : fadeUpItem}
            >
                <Card className="w-full max-w-md text-center border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-10 pb-8 px-8 space-y-6">
                        <motion.div
                            className="mx-auto w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center"
                            initial={reduceMotion ? {} : { scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        >
                            <ShieldAlert className="h-12 w-12 text-destructive" />
                        </motion.div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {t("ERROR.UNAUTHORIZED.TITLE")}
                            </h1>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {t("ERROR.UNAUTHORIZED.MESSAGE")}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Button asChild variant="outline" className="min-w-[140px]">
                                <Link to="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    {t("ERROR.UNAUTHORIZED.GO_HOME")}
                                </Link>
                            </Button>
                            {!isAuthenticated && (
                                <Button asChild className="min-w-[140px]">
                                    <Link to="/login">
                                        <LogIn className="mr-2 h-4 w-4" />
                                        {t("ERROR.UNAUTHORIZED.SIGN_IN")}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

