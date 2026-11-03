import { Bell, BellOff, Languages, Moon, Sun, type LucideIcon } from "lucide-react";
import { LOCALES, type Locale, type MessageKey } from "@orbit/i18n";
import { cn } from "cn";

import { useTheme } from "@/context/theme/use-theme";
import type { Theme } from "@/context/theme/theme-context";
import { PageHeaderComponent } from "@/components/ui/page-header-component";
import { useI18n } from "@/i18n/use-i18n";
import {
  setSuccessToastsEnabled,
  useSuccessToastsEnabled,
} from "@/notifications/notification-preference";

const THEME_OPTIONS: {
  value: Theme;
  label: MessageKey;
  description: MessageKey;
  icon: LucideIcon;
}[] = [
  {
    value: "light",
    label: "settings.appearance.light",
    description: "settings.appearance.lightDescription",
    icon: Sun,
  },
  {
    value: "dark",
    label: "settings.appearance.dark",
    description: "settings.appearance.darkDescription",
    icon: Moon,
  },
];

const LOCALE_OPTIONS: Record<
  Locale,
  { label: MessageKey; description: MessageKey }
> = {
  es: {
    label: "settings.language.es",
    description: "settings.language.esDescription",
  },
  en: {
    label: "settings.language.en",
    description: "settings.language.enDescription",
  },
};

function OptionButton({
  selected,
  onSelect,
  icon: Icon,
  label,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: LucideIcon;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
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
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const successToasts = useSuccessToastsEnabled();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <PageHeaderComponent
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <section
        aria-label={t("settings.appearance.title")}
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">
          {t("settings.appearance.title")}
        </h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          {t("settings.appearance.hint")}
        </p>
        <div
          role="radiogroup"
          aria-label={t("settings.appearance.themeGroup")}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {THEME_OPTIONS.map(({ value, label, description, icon }) => (
            <OptionButton
              key={value}
              selected={theme === value}
              onSelect={() => setTheme(value)}
              icon={icon}
              label={t(label)}
              description={t(description)}
            />
          ))}
        </div>
      </section>

      <section
        aria-label={t("settings.language.title")}
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">{t("settings.language.title")}</h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          {t("settings.language.hint")}
        </p>
        <div
          role="radiogroup"
          aria-label={t("settings.language.group")}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {LOCALES.map((value) => (
            <OptionButton
              key={value}
              selected={locale === value}
              onSelect={() => setLocale(value)}
              icon={Languages}
              label={t(LOCALE_OPTIONS[value].label)}
              description={t(LOCALE_OPTIONS[value].description)}
            />
          ))}
        </div>
      </section>

      <section
        aria-label={t("notifications.title")}
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">{t("notifications.title")}</h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          {t("notifications.hint")}
        </p>
        <div
          role="radiogroup"
          aria-label={t("notifications.group")}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <OptionButton
            selected={successToasts}
            onSelect={() => setSuccessToastsEnabled(true)}
            icon={Bell}
            label={t("notifications.on")}
            description={t("notifications.onDescription")}
          />
          <OptionButton
            selected={!successToasts}
            onSelect={() => setSuccessToastsEnabled(false)}
            icon={BellOff}
            label={t("notifications.off")}
            description={t("notifications.offDescription")}
          />
        </div>
      </section>
    </div>
  );
}
