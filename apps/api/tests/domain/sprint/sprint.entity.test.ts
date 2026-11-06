import { describe, expect, it } from "vitest";
import { SprintStatus } from "@orbit/shared";
import { Sprint } from "../../../src/domain/sprint/sprint.entity.js";
import {
  InvalidSprintDatesError,
  InvalidSprintStateError,
} from "../../../src/domain/sprint/sprint.errors.js";
import { aSprint } from "../../support/fixtures.js";

describe("Sprint", () => {
  it("starts planned, with trimmed name and empty goal as null", () => {
    const sprint = Sprint.register({ projectId: 10, name: "  Sprint 1 ", goal: "  " });

    expect(sprint.toPrimitives()).toMatchObject({
      name: "Sprint 1",
      goal: null,
      status: SprintStatus.PLANNED,
    });
  });

  it("rejects an end date before the start date", () => {
    expect(() =>
      Sprint.register({ projectId: 10, name: "S", startDate: "2026-11-10", endDate: "2026-11-01" }),
    ).toThrow(InvalidSprintDatesError);
  });

  it("accepts a sprint that starts and ends the same day or has no dates", () => {
    expect(() =>
      Sprint.register({ projectId: 10, name: "S", startDate: "2026-11-01", endDate: "2026-11-01" }),
    ).not.toThrow();
    expect(() => Sprint.register({ projectId: 10, name: "S" })).not.toThrow();
  });

  describe("lifecycle", () => {
    it("goes planned → active → closed", () => {
      const planned = aSprint();
      const active = planned.start();
      const closed = active.close();

      expect(active.toPrimitives().status).toBe(SprintStatus.ACTIVE);
      expect(closed.toPrimitives().status).toBe(SprintStatus.CLOSED);
    });

    it("can only start a planned sprint", () => {
      expect(() => aSprint({ status: SprintStatus.ACTIVE }).start()).toThrow(InvalidSprintStateError);
      expect(() => aSprint({ status: SprintStatus.CLOSED }).start()).toThrow(InvalidSprintStateError);
    });

    it("can only close an active sprint", () => {
      expect(() => aSprint({ status: SprintStatus.PLANNED }).close()).toThrow(InvalidSprintStateError);
      expect(() => aSprint({ status: SprintStatus.CLOSED }).close()).toThrow(InvalidSprintStateError);
    });

    it("can only be deleted while planned", () => {
      expect(() => aSprint({ status: SprintStatus.PLANNED }).assertDeletable()).not.toThrow();
      expect(() => aSprint({ status: SprintStatus.ACTIVE }).assertDeletable()).toThrow(InvalidSprintStateError);
      expect(() => aSprint({ status: SprintStatus.CLOSED }).assertDeletable()).toThrow(InvalidSprintStateError);
    });

    it("accepts issues unless it is closed", () => {
      expect(() => aSprint({ status: SprintStatus.PLANNED }).assertAcceptsIssues()).not.toThrow();
      expect(() => aSprint({ status: SprintStatus.ACTIVE }).assertAcceptsIssues()).not.toThrow();
      expect(() => aSprint({ status: SprintStatus.CLOSED }).assertAcceptsIssues()).toThrow(InvalidSprintStateError);
    });

    it("cannot be edited once closed", () => {
      expect(() => aSprint({ status: SprintStatus.CLOSED }).withDetails({ name: "x" })).toThrow(
        InvalidSprintStateError,
      );
      expect(aSprint().withDetails({ name: " Renamed " }).toPrimitives().name).toBe("Renamed");
    });
  });
});
