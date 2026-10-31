export function buildAvatarUrl(
  userId: number,
  avatarFileId: number | null,
): string | null {
  return avatarFileId === null
    ? null
    : `/users/${userId}/avatar?v=${avatarFileId}`;
}
