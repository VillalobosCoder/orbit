import { useRef, type ChangeEvent } from "react";
import { Camera, Trash2 } from "lucide-react";
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES } from "@orbit/shared";

import { Button } from "@/components/ui/button";
import { UserAvatarComponent } from "@/components/ui/user-avatar-component";
import { useRemoveAvatar, useUploadAvatar } from "@/features/auth/api/queries";
import { useI18n } from "@/i18n/use-i18n";
import { notifyError } from "@/notifications/notify";

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
  const isBusy = uploadAvatar.isPending || removeAvatar.isPending;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    if (!file) return;

    removeAvatar.reset();
    uploadAvatar.reset();

    if (!isAvatarType(file.type)) {
      notifyError(t("profile.photo.invalidType"));
      return;
    }

    if (file.size > AVATAR_MAX_BYTES) {
      notifyError(t("profile.photo.tooLarge", { size: MAX_MEGABYTES }));
      return;
    }

    uploadAvatar.mutate(file);
  }

  function handleRemove() {
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
              loading={uploadAvatar.isPending}
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
            >
              <Camera />
              {t(avatarUrl ? "profile.photo.change" : "profile.photo.upload")}
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                loading={removeAvatar.isPending}
                disabled={isBusy}
                onClick={handleRemove}
              >
                <Trash2 />
                {t("profile.photo.remove")}
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {t("profile.photo.hint", { size: MAX_MEGABYTES })}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
