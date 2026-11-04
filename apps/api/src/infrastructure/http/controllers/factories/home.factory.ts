import { GetHomeSummaryUseCase } from "../../../../application/home/use-cases/get-home-summary.use-case.js";
import { HomeController } from "../home.controller.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createHomeController(dependencies: ControllerDependencies) {
  return new HomeController(
    new GetHomeSummaryUseCase(dependencies.homeRepository),
  );
}
