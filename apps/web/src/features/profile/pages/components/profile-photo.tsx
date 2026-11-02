import { useRef, useState, type ChangeEvent } from "react";
import { Camera, CircleAlert, Trash2 } from "lucide-react";
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES } from "@orbit/shared";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatarComponent } from "@/components/ui/user-avatar-component";
import { useRemoveAvatar, useUploadAvatar } from "@/features/auth/api/queries";
import { useI18n } from "@/i18n/use-i18n";

const MAX_MEGABYTES = AVATAR_MAX_BYTES / (1024 * 1024);

function isAvatarType(type: string) {
  return (AVATAR_MIME_TYPES as readonly string[]).includes(type);
}

interface ProfilePhotoProps {
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export default function ProfilePhoto({
  fullName,
  email,
  avatarUrl,
}: ProfilePhotoProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const [validationError, setValidationError] = useState<string | null>(null);
  const isBusy = uploadAvatar.isPending || removeAvatar.isPending;
  const requestError = [uploadAvatar.error, removeAvatar.error].find(
    (error) => error instanceof Error,
  );
  const errorMessage = validationError ?? requestError?.message ?? null;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    if (!file) return;

    removeAvatar.reset();
    uploadAvatar.reset();

    if (!isAvatarType(file.type)) {
      setValidationError(t("profile.photo.invalidType"));
      return;
    }

    if (file.size > AVATAR_MAX_BYTES) {
      setValidationError(t("profile.photo.tooLarge", { size: MAX_MEGABYTES }));
      return;
    }

    setValidationError(null);
    uploadAvatar.mutate(file);
  }

  function handleRemove() {
    setValidationError(null);
    uploadAvatar.reset();
    removeAvatar.mutate();
  }

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <UserAvatarComponent
          name={fullName}
          avatarUrl={avatarUrl}
          className="size-20 text-2xl"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{fullName}</p>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={AVATAR_MIME_TYPES.join(",")}
              className="hidden"
              onChange={handleFileChange}
              aria-label={t("profile.photo.chooseFile")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
            >
              {uploadAvatar.isPending ? <Spinner /> : <Camera />}
              {t(avatarUrl ? "profile.photo.change" : "profile.photo.upload")}
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={handleRemove}
              >
                {removeAvatar.isPending ? <Spinner /> : <Trash2 />}
                {t("profile.photo.remove")}
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {t("profile.photo.hint", { size: MAX_MEGABYTES })}
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {errorMessage}
        </div>
      )}
    </div>
  );
}
