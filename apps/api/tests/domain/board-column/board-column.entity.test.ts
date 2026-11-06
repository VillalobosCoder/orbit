import { describe, expect, it } from "vitest";
import { BoardColumnCategory } from "@orbit/shared";
import { BoardColumn } from "../../../src/domain/board-column/board-column.entity.js";
import { LastBoardColumnOfCategoryError } from "../../../src/domain/board-column/board-column.errors.js";
import { aColumn, columnEntities } from "../../support/fixtures.js";

describe("BoardColumn", () => {
  it("trims the name and turns blank color into null", () => {
    const column = BoardColumn.register({
      projectId: 10,
      name: "  Review ",
      color: "  ",
      category: BoardColumnCategory.IN_PROGRESS,
      position: 3,
    });

    expect(column.toPrimitives()).toMatchObject({
      name: "Review",
      color: null,
      wipLimit: null,
      position: 3,
    });
  });

  it("updates name, color and limit but never the category or position", () => {
    const updated = aColumn({ category: BoardColumnCategory.IN_PROGRESS, position: 4 }).withDetails({
      name: " Doing ",
      color: "#fff",
      wipLimit: 5,
    });

    expect(updated.toPrimitives()).toMatchObject({
      name: "Doing",
      color: "#fff",
      wipLimit: 5,
      category: BoardColumnCategory.IN_PROGRESS,
      position: 4,
    });
  });

  describe("assertRemovable", () => {
    it("never removes the last todo column", () => {
      expect(() => columnEntities[0]!.assertRemovable(columnEntities)).toThrow(
        LastBoardColumnOfCategoryError,
      );
    });

    it("never removes the last done column", () => {
      expect(() => columnEntities[2]!.assertRemovable(columnEntities)).toThrow(
        LastBoardColumnOfCategoryError,
      );
    });

    it("allows removing an in-progress column", () => {
      expect(() => columnEntities[1]!.assertRemovable(columnEntities)).not.toThrow();
    });

    it("allows removing a todo column when another one remains", () => {
      const extra = aColumn({ id: 9, name: "Backlog", category: BoardColumnCategory.TODO });

      expect(() => columnEntities[0]!.assertRemovable([...columnEntities, extra])).not.toThrow();
    });
  });
});
