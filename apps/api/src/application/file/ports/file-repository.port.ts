import type {
  CreateFileRequestDto,
  FileIdRequestDto,
  StoredFileDto,
} from "@orbit/shared";
import type { Actor } from "../../shared/actor.js";

export type CreateFileCommand = CreateFileRequestDto & Actor;

export type FileContent = {
  content: Buffer;
  mimeType: string;
};

export interface FileRepository {
  create(command: CreateFileCommand): Promise<number>;
  findById(command: FileIdRequestDto): Promise<StoredFileDto | null>;
  delete(command: FileIdRequestDto): Promise<void>;
}
