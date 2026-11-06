export const PNG_HEADER = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
export const JPEG_HEADER = [0xff, 0xd8, 0xff, 0xe0];
export const MP4_HEADER = [0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70];

export function bytes(header: number[], size = 32): Buffer {
  const buffer = Buffer.alloc(size);
  Buffer.from(header).copy(buffer);

  return buffer;
}
