"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/50"
      onClick={cycleTheme}
      title={`Current theme: ${theme}`}
    >
      {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />}
      {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />}
      {(theme === "system" || !theme) && <Laptop className="h-[1.2rem] w-[1.2rem] transition-all" />}
      <span className="sr-only" aria-label="Toggle theme">Toggle theme</span>
    </Button>
  );
}