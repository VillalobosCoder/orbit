import type { Readable } from "node:stream";

export type FileRange = { start: number; end: number };

export interface FileStorage {
  save(key: string, content: Buffer): Promise<void>;
  read(key: string): Promise<Buffer | null>;
  size(key: string): Promise<number | null>;
  openRead(key: string, range?: FileRange): Readable;
  delete(key: string): Promise<void>;
}
