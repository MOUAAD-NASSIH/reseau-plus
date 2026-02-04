import { Building2, User } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";

export default function RegisterRoleDialog() {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
                    {t('AUTH.LOGIN.CREATE_ACCOUNT')}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[520px] p-8">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-2xl font-bold text-center">
                        {t('AUTH.REGISTER_DIALOG.TITLE')}
                    </DialogTitle>
                    <p className="text-center text-muted-foreground">
                        {t('AUTH.REGISTER_DIALOG.SUBTITLE')}
                    </p>
                </DialogHeader>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {/* Worker */}
                    <Link
                        to="/register/worker"
                        className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                <User className="h-8 w-8" />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                                    {t('AUTH.REGISTER_DIALOG.WORKER.TITLE')}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('AUTH.REGISTER_DIALOG.WORKER.DESC')}
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Institution */}
                    <Link
                        to="/register/institution"
                        className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                <Building2 className="h-8 w-8" />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                                    {t('AUTH.REGISTER_DIALOG.INSTITUTION.TITLE')}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('AUTH.REGISTER_DIALOG.INSTITUTION.DESC')}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                <DialogClose asChild>
                    <Button variant="ghost" className="mt-6 w-full text-muted-foreground hover:text-foreground">
                        {t('AUTH.REGISTER_DIALOG.CANCEL')}
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
