import { Building2, User } from "lucide-react";
import { Link } from "react-router";

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
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="font-bold text-primary hover:underline">
                    Create one
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[520px] p-8">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-2xl font-bold text-center">
                        Create your account
                    </DialogTitle>
                    <p className="text-center text-muted-foreground">
                        Choose the account type that fits your role
                    </p>
                </DialogHeader>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {/* Worker */}
                    <Link
                        to="/register/worker"
                        className="group rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="h-7 w-7" />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold">Worker</h3>
                                <p className="text-sm text-muted-foreground">
                                    Independent professional offering services
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Institution */}
                    <Link
                        to="/register/institution"
                        className="group rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Building2 className="h-7 w-7" />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold">Institution</h3>
                                <p className="text-sm text-muted-foreground">
                                    Organization looking for qualified workers
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                <DialogClose asChild>
                    <Button variant="ghost" className="mt-6 w-full">
                        Cancel
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
