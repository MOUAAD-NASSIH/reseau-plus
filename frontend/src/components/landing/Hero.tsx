import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export function Hero() {
    const highlights = [
        "Connect with verified social workers",
        "Streamlined mission management",
        "Secure payment processing",
    ];

    return (
        <section className="relative overflow-hidden bg-linear-to-b from-background to-muted/30 py-20 sm:py-32">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
                        <span className="mr-2 h-2 w-2 rounded-full bg-primary" />
                        Trusted by social work professionals
                    </div>

                    {/* Main Heading */}
                    <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        Connect{" "}
                        <span className="text-primary">Social Workers</span>
                        <br />
                        with{" "}
                        <span className="text-secondary">Institutions</span>
                    </h1>

                    {/* Subheading */}
                    <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                        The professional network for independent social workers and
                        institutions. Find missions, manage availability, and grow your
                        career in social work.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="lg" asChild className="btn-glow w-full sm:w-auto">
                            <Link to="/register/worker">
                                Join as Worker
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="hover-lift w-full sm:w-auto"
                        >
                            <Link to="/register/institution">Register Institution</Link>
                        </Button>
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
                        {highlights.map((highlight) => (
                            <div
                                key={highlight}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span>{highlight}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

