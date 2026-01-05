import { Link } from "react-router";
import { Users } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        platform: [
            { label: "For Workers", href: "#workers" },
            { label: "For Institutions", href: "#institutions" },
            { label: "Features", href: "#features" },
        ],
        account: [
            { label: "Sign In", href: "/login" },
            { label: "Register as Worker", href: "/register/worker" },
            { label: "Register Institution", href: "/register/institution" },
        ],
        legal: [
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
            { label: "Contact", href: "#" },
        ],
    };

    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                                <Users className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-semibold text-lg">Réseau Social</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Connecting independent social workers with institutions for
                            meaningful missions.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="mb-4 font-semibold">Platform</h4>
                        <ul className="space-y-2">
                            {footerLinks.platform.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Account Links */}
                    <div>
                        <h4 className="mb-4 font-semibold">Account</h4>
                        <ul className="space-y-2">
                            {footerLinks.account.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="mb-4 font-semibold">Legal</h4>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 border-t pt-8">
                    <p className="text-center text-sm text-muted-foreground">
                        © {currentYear} Réseau de Travailleurs Sociaux Indépendants. All
                        rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
