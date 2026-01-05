import {
    Briefcase,
    Calendar,
    CreditCard,
    FileCheck,
    Search,
    Shield,
    Star,
    Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Feature {
    icon: React.ElementType;
    title: string;
    description: string;
}

const workerFeatures: Feature[] = [
    {
        icon: Search,
        title: "Find Missions",
        description:
            "Browse available missions matching your expertise and availability.",
    },
    {
        icon: Calendar,
        title: "Manage Availability",
        description:
            "Set your schedule with an intuitive calendar interface.",
    },
    {
        icon: FileCheck,
        title: "Document Management",
        description:
            "Upload and manage your professional documents securely.",
    },
    {
        icon: Star,
        title: "Build Reputation",
        description:
            "Collect reviews and build your professional reputation.",
    },
];

const institutionFeatures: Feature[] = [
    {
        icon: Briefcase,
        title: "Post Missions",
        description:
            "Create and publish missions to find qualified social workers.",
    },
    {
        icon: Users,
        title: "Review Applicants",
        description:
            "Browse applications and select the best candidates.",
    },
    {
        icon: CreditCard,
        title: "Secure Payments",
        description:
            "Process payments securely through our integrated system.",
    },
    {
        icon: Shield,
        title: "Verified Workers",
        description:
            "Access a network of verified and qualified professionals.",
    },
];

function FeatureCard({ feature }: { feature: Feature }) {
    const Icon = feature.icon;
    return (
        <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="pb-2">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
        </Card>
    );
}

export function Features() {
    return (
        <section id="features" className="py-20 sm:py-32">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Everything you need to succeed
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Our platform provides all the tools for social workers and
                        institutions to connect and collaborate effectively.
                    </p>
                </div>

                {/* Workers Section */}
                <div id="workers" className="mb-20">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <Users className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h3 className="text-2xl font-semibold">For Social Workers</h3>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {workerFeatures.map((feature) => (
                            <FeatureCard key={feature.title} feature={feature} />
                        ))}
                    </div>
                </div>

                {/* Institutions Section */}
                <div id="institutions">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            <Briefcase className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <h3 className="text-2xl font-semibold">For Institutions</h3>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {institutionFeatures.map((feature) => (
                            <FeatureCard key={feature.title} feature={feature} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
