"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Laptop, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

// Custom hook to check if component is mounted (avoids setState in useEffect)
function useIsMounted() {
  return useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

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