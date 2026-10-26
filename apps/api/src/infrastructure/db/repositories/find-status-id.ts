import { and, eq } from "drizzle-orm";
import type { DbExecutor } from "../db-context.js";
import { statuses } from "../schema/statuses.js";

export async function findStatusId(
  db: DbExecutor,
  statusTypeKey: string,
  statusKey: string,
): Promise<number> {
  const [status] = await db
    .select({ id: statuses.id })
    .from(statuses)
    .where(
      and(
        eq(statuses.key, statusKey),
        eq(statuses.statusTypeKey, statusTypeKey),
      ),
    )
    .limit(1);

  if (!status) {
    throw new Error(`No existe el estado "${statusKey}" (${statusTypeKey}).`);
  }

  return status.id;
}
