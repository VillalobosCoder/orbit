import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme/use-theme";
import { useI18n } from "@/i18n/use-i18n";

export function ThemeToggleComponent() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t(isDark ? "shell.theme.toLight" : "shell.theme.toDark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
