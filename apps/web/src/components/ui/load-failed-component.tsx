import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/use-i18n";

export function LoadFailedComponent({
  message,
  onRetry,
  isRetrying = false,
}: {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="m-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
      <p>{message ?? t("common.loadFailed")}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={isRetrying}
          onClick={onRetry}
        >
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
}
