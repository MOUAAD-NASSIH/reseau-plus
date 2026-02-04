import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { shouldReduceMotion, fadeUpItem } from "@/lib/animations";

export default function NotFound() {
    const { t } = useTranslation();
    const reduceMotion = shouldReduceMotion();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background embellishments */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
                <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
            </div>

            <motion.div
                initial="initial"
                animate="animate"
                variants={reduceMotion ? {} : fadeUpItem}
            >
                <Card className="w-full max-w-md text-center border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-12 pb-8 px-8 space-y-8">

                        <div className="relative">
                            <motion.div
                                className="text-[8rem] font-bold leading-none text-primary/10 select-none"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                404
                            </motion.div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        {t("ERROR.NOT_FOUND.TITLE")}
                                    </h1>
                                </motion.div>
                            </div>
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed max-w-[300px] mx-auto">
                            {t("ERROR.NOT_FOUND.MESSAGE")}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild variant="outline" className="min-w-[130px]">
                                <Link to="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    {t("ERROR.NOT_FOUND.GO_HOME")}
                                </Link>
                            </Button>
                            <Button asChild className="min-w-[130px]">
                                <Link to={-1 as unknown as string} onClick={(e) => {
                                    e.preventDefault();
                                    window.history.back();
                                }}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    {t("ERROR.NOT_FOUND.GO_BACK")}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

