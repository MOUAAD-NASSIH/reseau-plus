import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const languages = [
        { code: "en", label: "English", flag: "🇺🇸", tag: "US" },
        { code: "fr", label: "Français", flag: "🇫🇷", tag: "FR" },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-full border border-transparent hover:border-border/40 hover:bg-muted/50 transition-all px-2 md:px-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="hidden md:inline-block text-sm font-medium text-muted-foreground">
                        {i18n.language === 'fr' ? 'Français' : 'English'}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className="cursor-pointer gap-3 py-2"
                    >
                        <span className="text-lg leading-none">{lang.flag}</span>
                        <span className="flex-1 text-sm font-medium">{lang.label}</span>
                        {i18n.language === lang.code && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
