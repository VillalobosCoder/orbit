export type FileIdRequestDto = {
  id: number;
};

export type CreateFileRequestDto = {
  bucket: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
};

export type StoredFileDto = {
  id: number;
  storageKey: string;
  mimeType: string;
};
