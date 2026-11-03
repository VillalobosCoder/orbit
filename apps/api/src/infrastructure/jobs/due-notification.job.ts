import type { GenerateDueNotificationsUseCase } from "../../application/notification/use-cases/generate-due-notifications.use-case.js";

const INTERVAL_MS = 10 * 60 * 1000;

export function startDueNotificationJob(
  useCase: GenerateDueNotificationsUseCase,
): () => void {
  async function run() {
    try {
      const created = await useCase.execute();

      if (created > 0) {
        console.log(`Due date notifications created: ${created}.`);
      }
    } catch (error) {
      console.error("Could not generate due date notifications.", error);
    }
  }

  void run();
  const timer = setInterval(() => void run(), INTERVAL_MS);
  timer.unref();

  return () => clearInterval(timer);
}
