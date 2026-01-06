import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Users, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Users className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="hidden font-semibold text-lg sm:inline-block">
                        Réseau Social
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-6 md:flex">
                    <a
                        href="#features"
                        className="link-hover text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Features
                    </a>
                    <a
                        href="#workers"
                        className="link-hover text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        For Workers
                    </a>
                    <a
                        href="#institutions"
                        className="link-hover text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        For Institutions
                    </a>
                </nav>

                {/* Desktop Auth Buttons */}
                <div className="hidden items-center gap-3 md:flex">
                    <ThemeToggle />
                    <Button variant="ghost" asChild>
                        <Link to="/login">Sign In</Link>
                    </Button>
                    <Button asChild>
                        <Link to="/register/worker">Get Started</Link>
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="border-t bg-background md:hidden">
                    <nav className="container mx-auto flex flex-col gap-4 px-4 py-4">
                        <a
                            href="#features"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Features
                        </a>
                        <a
                            href="#workers"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            For Workers
                        </a>
                        <a
                            href="#institutions"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            For Institutions
                        </a>
                        <div className="flex flex-col gap-2 pt-2">
                            <Button variant="outline" asChild className="w-full">
                                <Link to="/login">Sign In</Link>
                            </Button>
                            <Button asChild className="w-full">
                                <Link to="/register/worker">Get Started</Link>
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}

