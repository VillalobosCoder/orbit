import { eq } from "drizzle-orm";
import type { FileIdRequestDto, StoredFileDto } from "@orbit/shared";
import type {
  CreateFileCommand,
  FileRepository,
} from "../../../application/file/ports/file-repository.port.js";
import type { DbContext } from "../db-context.js";
import { files } from "../schema/files.js";

const READY_STATUS = "active";

export class DBFileRepository implements FileRepository {
  constructor(private readonly context: DbContext) {}

  private get db() {
    return this.context.db;
  }

  async create({
    actorUserId,
    sizeBytes,
    ...file
  }: CreateFileCommand): Promise<number> {
    const [row] = await this.db
      .insert(files)
      .values({
        ...file,
        sizeBytes: BigInt(sizeBytes),
        uploadedByUserId: actorUserId,
        createdByUserId: actorUserId,
        status: READY_STATUS,
      })
      .returning({ id: files.id });

    return row.id;
  }

  async findById({ id }: FileIdRequestDto): Promise<StoredFileDto | null> {
    const [row] = await this.db
      .select({
        id: files.id,
        storageKey: files.storageKey,
        mimeType: files.mimeType,
      })
      .from(files)
      .where(eq(files.id, id))
      .limit(1);

    return row ?? null;
  }

  async delete({ id }: FileIdRequestDto): Promise<void> {
    await this.db.delete(files).where(eq(files.id, id));
  }
}
