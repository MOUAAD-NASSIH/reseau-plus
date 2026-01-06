import { Clock, FileCheck, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

/**
 * Page displayed to workers with PENDING status when they try to access
 * restricted pages that require verification.
 */
export default function PendingApproval() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                        <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
                    <CardDescription className="text-base">
                        Your account is currently under review by our admin team
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>What happens next?</AlertTitle>
                        <AlertDescription>
                            Our administrators will review your profile and documents. This process
                            typically takes 1-3 business days. You'll receive a notification once
                            your account has been verified.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <h3 className="font-semibold">While you wait, you can:</h3>
                        <div className="grid gap-3">
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Complete your profile</p>
                                    <p className="text-sm text-muted-foreground">
                                        Make sure all your information is accurate and up-to-date
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border p-3">
                                <FileCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Upload required documents</p>
                                    <p className="text-sm text-muted-foreground">
                                        Ensure all necessary documents are uploaded for faster approval
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Button onClick={() => navigate("/worker/profile")} variant="default">
                            Go to Profile
                        </Button>
                        <Button onClick={() => navigate("/worker/documents")} variant="outline">
                            Manage Documents
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

