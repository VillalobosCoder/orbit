export interface TransactionManager {
  /**
   * Ejecuta `work` dentro de una transacción. Todo repositorio llamado desde
   * `work` participa en ella; si ya hay una abierta, se reutiliza.
   */
  run<T>(work: () => Promise<T>): Promise<T>;
}
