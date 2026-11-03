import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n/use-i18n";

export type MediaViewerItem = {
  id: number | string;
  kind: "image" | "video";
  src: string;
  name: string;
};

interface MediaViewerComponentProps {
  items: MediaViewerItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

const SWIPE_MIN_PX = 50;

const controlClass =
  "absolute z-10 text-white hover:bg-white/15 hover:text-white";

export function MediaViewerComponent({
  items,
  index,
  onIndexChange,
}: MediaViewerComponentProps) {
  const { t } = useI18n();
  const touchStartX = useRef<number | null>(null);
  const current = index === null ? undefined : items[index];
  const isOpen = current !== undefined;

  useEffect(() => {
    if (index !== null && index >= items.length) {
      onIndexChange(items.length === 0 ? null : items.length - 1);
    }
  }, [index, items.length, onIndexChange]);

  function go(step: number) {
    if (index === null || items.length < 2) return;
    onIndexChange((index + step + items.length) % items.length);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onIndexChange(null);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col items-center justify-center gap-0 rounded-none bg-black/95 p-0 text-white ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">
          {t("shell.ui.mediaViewer")}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {current?.name}
        </DialogDescription>

        {current && (
          <div
            className="flex h-full w-full items-center justify-center p-4 sm:px-20"
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0].clientX;
            }}
            onTouchEnd={(event) => {
              if (touchStartX.current === null) return;
              const delta =
                event.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (Math.abs(delta) >= SWIPE_MIN_PX) go(delta > 0 ? -1 : 1);
            }}
          >
            {current.kind === "video" ? (
              <video
                key={current.id}
                src={current.src}
                controls
                autoPlay
                className="max-h-full max-w-full"
              />
            ) : (
              <img
                key={current.id}
                src={current.src}
                alt={current.name}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        )}

        <DialogClose
          render={
            <Button
              variant="ghost"
              size="icon"
              className={`${controlClass} top-3 right-3`}
            />
          }
        >
          <X />
          <span className="sr-only">{t("shell.ui.closeMediaViewer")}</span>
        </DialogClose>

        {items.length > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label={t("shell.ui.previous")}
              className={`${controlClass} top-1/2 left-3 -translate-y-1/2`}
              onClick={() => go(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label={t("shell.ui.next")}
              className={`${controlClass} top-1/2 right-3 -translate-y-1/2`}
              onClick={() => go(1)}
            >
              <ChevronRight />
            </Button>
          </>
        )}

        {current && index !== null && (
          <p className="absolute bottom-3 left-1/2 z-10 max-w-[80%] -translate-x-1/2 truncate text-xs text-white/80">
            {current.name} · {index + 1} / {items.length}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
