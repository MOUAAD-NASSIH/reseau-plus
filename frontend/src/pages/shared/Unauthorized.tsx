import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Home, LogIn } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/features/store";

export default function Unauthorized() {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4">
                        <ShieldAlert className="h-16 w-16 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Access Denied</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        You don't have permission to access this page. Please contact an
                        administrator if you believe this is an error.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button asChild variant="outline">
                            <Link to="/">
                                <Home className="mr-2 h-4 w-4" />
                                Go Home
                            </Link>
                        </Button>
                        {!isAuthenticated && (
                            <Button asChild>
                                <Link to="/login">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
