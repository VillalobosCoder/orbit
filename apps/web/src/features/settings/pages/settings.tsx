import { Moon, Sun, type LucideIcon } from "lucide-react";
import { cn } from "cn";

import { useTheme } from "@/context/theme/use-theme";
import type { Theme } from "@/context/theme/theme-context";
import { PageHeaderComponent } from "@/shared/ui/custom-components/page-header-component";

const THEME_OPTIONS: {
  value: Theme;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    value: "light",
    label: "Claro",
    description: "Fondo luminoso, ideal con mucha luz.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Oscuro",
    description: "Fondo espacial, más cómodo de noche.",
    icon: Moon,
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <PageHeaderComponent
        title="Configuración"
        description="Preferencias de la aplicación en este navegador."
      />

      <section
        aria-label="Apariencia"
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">Apariencia</h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          El tema se guarda en este navegador.
        </p>
        <div
          role="radiogroup"
          aria-label="Tema"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
            const selected = theme === value;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/60",
                )}
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>
                  <span className="block font-medium">{label}</span>
                  <span className="block text-sm text-muted-foreground">
                    {description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
