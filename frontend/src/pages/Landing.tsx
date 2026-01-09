import { Hero, Features, HowItWorks, Footer } from "@/components/landing";

export default function Landing() {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">
                <Hero />
                <Features />
                <HowItWorks />
            </main>
            <Footer />
        </div>
    );
}

