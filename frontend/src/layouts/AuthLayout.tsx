import { ThemeToggle } from "@/components/common/ThemeToggle";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Theme toggle in top-right corner */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Centered card container */}
            <div className="w-full max-w-md">
                <div className="bg-card rounded-xl border border-border shadow-lg p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

