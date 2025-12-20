import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/features/slices/themeSlice";
import { useAppDispatch, useAppSelector } from "@/features/helpers";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <div
      className={cn(
        "hidden sm:inline-grid grid-cols-2 gap-1 rounded-full p-1 border",
        "bg-card text-card-foreground border-border"
      )}
    >
      {/* 🌞 LIGHT */}
      <button
        onClick={() => mode === "dark" && dispatch(toggleTheme())}
        aria-label="Light Theme"
        className={cn(
          "flex items-center justify-center p-2 rounded-full transition duration-300",
          mode === "light"
            ? "bg-background text-foreground shadow-md"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <Sun className="h-4 w-4" />
      </button>

      {/* 🌙 DARK */}
      <button
        onClick={() => mode === "light" && dispatch(toggleTheme())}
        aria-label="Dark Theme"
        className={cn(
          "flex items-center justify-center p-2 rounded-full transition duration-300",
          mode === "dark"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
