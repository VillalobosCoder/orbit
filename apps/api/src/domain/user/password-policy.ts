export const MAX_PASSWORD_BYTES = 1024;

export function exceedsPasswordByteLimit(password: string): boolean {
  return new TextEncoder().encode(password).byteLength > MAX_PASSWORD_BYTES;
}
