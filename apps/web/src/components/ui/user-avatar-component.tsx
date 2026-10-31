import { useState } from "react";
import { cn } from "cn";

import { resolveAssetUrl } from "@/api/config";

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "?";
}

export function UserAvatarComponent({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showPhoto = avatarUrl && avatarUrl !== failedUrl;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground",
        className,
      )}
    >
      {showPhoto ? (
        <img
          src={resolveAssetUrl(avatarUrl)}
          alt=""
          className="size-full object-cover"
          onError={() => setFailedUrl(avatarUrl)}
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
