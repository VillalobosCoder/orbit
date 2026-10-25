import { AsyncLocalStorage } from "node:async_hooks";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { TransactionManager } from "../../application/shared/ports/transaction-manager.port.js";

type DbTransaction = Parameters<
  Parameters<NodePgDatabase["transaction"]>[0]
>[0];

export type DbExecutor = NodePgDatabase | DbTransaction;

export class DbContext implements TransactionManager {
  private readonly storage = new AsyncLocalStorage<DbExecutor>();

  constructor(private readonly root: NodePgDatabase) {}

  get db(): DbExecutor {
    return this.storage.getStore() ?? this.root;
  }

  run<T>(work: () => Promise<T>): Promise<T> {
    if (this.storage.getStore()) {
      return work();
    }

    return this.root.transaction((tx) => this.storage.run(tx, work));
  }
}
