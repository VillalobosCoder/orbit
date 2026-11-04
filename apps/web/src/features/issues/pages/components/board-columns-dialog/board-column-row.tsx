import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "cn";
import { columnLabel } from "@/i18n/catalog";
import { useI18n } from "@/i18n/use-i18n";
import { type DraftColumn } from "./board-columns-draft";
import { CATEGORY_DOT } from "../../../utils/category-dot";

export default function ColumnRow({
  draft,
  nameError,
  isProtected,
  targets,
  canMoveUp,
  canMoveDown,
  disabled,
  onChange,
  onMove,
  onRemove,
}: {
  draft: DraftColumn;
  nameError: string | null;
  isProtected: boolean;
  targets: DraftColumn[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled: boolean;
  onChange: (changes: Partial<DraftColumn>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: (moveToId?: number) => void;
}) {
  const { t } = useI18n();
  const existingTargets = targets.filter((target) => target.id !== null);
  const categoryName = t(`issues.categories.${draft.category}`);
  const [targetId, setTargetId] = useState<number | null>(null);
  const selectedTarget =
    existingTargets.find((target) => target.id === targetId) ??
    existingTargets[0];

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
      <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto_7rem]">
        <span className="flex flex-col gap-0.5">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            disabled={!canMoveUp || disabled}
            aria-label={t("issues.columns.row.moveUp", { name: draft.name })}
            onClick={() => onMove(-1)}
          >
            <ChevronUp />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            disabled={!canMoveDown || disabled}
            aria-label={t("issues.columns.row.moveDown", { name: draft.name })}
            onClick={() => onMove(1)}
          >
            <ChevronDown />
          </Button>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "size-2.5 rounded-full",
            !draft.color && CATEGORY_DOT[draft.category],
          )}
          style={draft.color ? { backgroundColor: draft.color } : undefined}
        />
        <Input
          aria-label={t("issues.columns.row.nameField")}
          aria-invalid={nameError ? true : undefined}
          value={draft.name}
          maxLength={50}
          disabled={disabled}
          onChange={(event) => onChange({ name: event.currentTarget.value })}
        />
        <Badge className="max-sm:col-start-3 max-sm:justify-self-start">
          {draft.id === null
            ? t("issues.columns.row.newBadge", { category: categoryName })
            : categoryName}
        </Badge>
        <Input
          type="number"
          aria-label={t("issues.columns.row.wipField")}
          min={1}
          max={1000}
          value={draft.wipLimit ?? ""}
          placeholder={t("issues.columns.row.noLimit")}
          disabled={disabled}
          className="max-sm:col-start-3"
          onChange={(event) =>
            onChange({
              wipLimit: event.currentTarget.value
                ? Number(event.currentTarget.value)
                : null,
            })
          }
        />
      </div>

      {nameError && (
        <p className="pl-1 text-xs text-destructive">{nameError}</p>
      )}

      <div className="flex flex-wrap items-center gap-2.5 pl-1 text-sm text-muted-foreground">
        {draft.id === null ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onRemove()}
          >
            {t("issues.columns.row.remove")}
          </Button>
        ) : isProtected ? (
          <p>
            {t("issues.columns.row.onlyOfCategory", { category: categoryName })}
          </p>
        ) : (
          <>
            <label htmlFor={`target-${draft.key}`}>
              {t("issues.columns.row.moveIssuesTo")}
            </label>
            <NativeSelect
              id={`target-${draft.key}`}
              className="h-8 w-44 text-[0.8125rem]"
              value={selectedTarget?.id ?? ""}
              disabled={disabled}
              onChange={(event) =>
                setTargetId(Number(event.currentTarget.value))
              }
            >
              {existingTargets.map((target) => (
                <option key={target.key} value={target.id!}>
                  {columnLabel(t, target)}
                </option>
              ))}
            </NativeSelect>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={disabled || !selectedTarget}
              onClick={() => selectedTarget && onRemove(selectedTarget.id!)}
            >
              {t("common.delete")}
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
