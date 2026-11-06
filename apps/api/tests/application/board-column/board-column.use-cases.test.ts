import { describe, expect, it } from "vitest";
import { BoardColumnCategory } from "@orbit/shared";
import type { BoardColumnRepository } from "../../../src/application/board-column/ports/board-column-repository.port.js";
import { CreateBoardColumnUseCase } from "../../../src/application/board-column/use-cases/create-board-column.use-case.js";
import { DeleteBoardColumnUseCase } from "../../../src/application/board-column/use-cases/delete-board-column.use-case.js";
import { ReorderBoardColumnsUseCase } from "../../../src/application/board-column/use-cases/reorder-board-columns.use-case.js";
import { UpdateBoardColumnUseCase } from "../../../src/application/board-column/use-cases/update-board-column.use-case.js";
import {
  BoardColumnNotFoundError,
  InvalidBoardColumnOrderError,
  InvalidBoardColumnTargetError,
  LastBoardColumnOfCategoryError,
} from "../../../src/domain/board-column/board-column.errors.js";
import { ProjectNotFoundError } from "../../../src/domain/project/project.errors.js";
import { transactionDouble } from "../../support/doubles.js";
import { aColumn, columnEntities } from "../../support/fixtures.js";
import { projectsDouble } from "../../support/issue-ports.js";
import { stub } from "../../support/stub.js";

function columnsDouble(all = columnEntities) {
  return stub<BoardColumnRepository>({
    findAllByProject: async () => all,
    findById: async ({ columnId }) => all.find((column) => column.id === columnId) ?? null,
    save: async () => 9,
    update: async () => undefined,
    reorder: async () => undefined,
    moveIssues: async () => undefined,
    delete: async () => undefined,
  });
}

describe("CreateBoardColumnUseCase", () => {
  it("adds the column at the end of the board", async () => {
    const columns = columnsDouble();

    const result = await new CreateBoardColumnUseCase(projectsDouble(), columns).execute({
      id: 10,
      name: " Review ",
      category: BoardColumnCategory.IN_PROGRESS,
      actorUserId: 1,
    });

    expect(result).toMatchObject({ id: 9, name: "Review", position: 3 });
  });

  it("starts at position 0 on an empty board", async () => {
    const result = await new CreateBoardColumnUseCase(projectsDouble(), columnsDouble([])).execute({
      id: 10,
      name: "First",
      category: BoardColumnCategory.TODO,
      actorUserId: 1,
    });

    expect(result.position).toBe(0);
  });

  it("answers not found to people outside the project", async () => {
    await expect(
      new CreateBoardColumnUseCase(projectsDouble(false), columnsDouble()).execute({
        id: 10,
        name: "x",
        category: BoardColumnCategory.TODO,
        actorUserId: 9,
      }),
    ).rejects.toThrow(ProjectNotFoundError);
  });
});

describe("UpdateBoardColumnUseCase", () => {
  it("renames the column and sets its limit", async () => {
    const columns = columnsDouble();

    await new UpdateBoardColumnUseCase(projectsDouble(), columns).execute({
      id: 10,
      columnId: 2,
      name: " Doing ",
      wipLimit: 3,
      actorUserId: 1,
    });

    const [saved] = columns.update.mock.calls[0]!;
    expect(saved.toPrimitives()).toMatchObject({ id: 2, name: "Doing", wipLimit: 3 });
  });

  it("fails when the column does not exist in the project", async () => {
    await expect(
      new UpdateBoardColumnUseCase(projectsDouble(), columnsDouble()).execute({
        id: 10,
        columnId: 99,
        name: "x",
        actorUserId: 1,
      }),
    ).rejects.toThrow(BoardColumnNotFoundError);
  });
});

describe("ReorderBoardColumnsUseCase", () => {
  const input = { id: 10, actorUserId: 1 };

  it("applies a permutation of all the columns", async () => {
    const columns = columnsDouble();

    await new ReorderBoardColumnsUseCase(projectsDouble(), columns, transactionDouble()).execute({
      ...input,
      columnIds: [3, 1, 2],
    });

    expect(columns.reorder).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["a missing column", [1, 2]],
    ["a repeated column", [1, 2, 2]],
    ["a column of another project", [1, 2, 99]],
    ["an extra column", [1, 2, 3, 4]],
  ])("rejects %s", async (_name, columnIds) => {
    const columns = columnsDouble();

    await expect(
      new ReorderBoardColumnsUseCase(projectsDouble(), columns, transactionDouble()).execute({
        ...input,
        columnIds,
      }),
    ).rejects.toThrow(InvalidBoardColumnOrderError);
    expect(columns.reorder).not.toHaveBeenCalled();
  });
});

describe("DeleteBoardColumnUseCase", () => {
  const input = { id: 10, columnId: 2, moveIssuesToColumnId: 1, actorUserId: 1 };

  it("moves the issues to the chosen column and then deletes it", async () => {
    const columns = columnsDouble();

    await new DeleteBoardColumnUseCase(projectsDouble(), columns, transactionDouble()).execute(input);

    expect(columns.moveIssues).toHaveBeenCalledWith({
      id: 10,
      fromColumnId: 2,
      toColumnId: 1,
      toIsDone: false,
      actorUserId: 1,
    });
    expect(columns.delete).toHaveBeenCalledWith(input);
  });

  it("marks the moved issues as done when the target is a done column", async () => {
    const columns = columnsDouble();

    await new DeleteBoardColumnUseCase(projectsDouble(), columns, transactionDouble()).execute({
      ...input,
      moveIssuesToColumnId: 3,
    });

    expect(columns.moveIssues).toHaveBeenCalledWith(expect.objectContaining({ toIsDone: true }));
  });

  it("requires a different, existing target column", async () => {
    const columns = columnsDouble();
    const useCase = new DeleteBoardColumnUseCase(projectsDouble(), columns, transactionDouble());

    await expect(useCase.execute({ ...input, moveIssuesToColumnId: 2 })).rejects.toThrow(
      InvalidBoardColumnTargetError,
    );
    await expect(useCase.execute({ ...input, moveIssuesToColumnId: 99 })).rejects.toThrow(
      InvalidBoardColumnTargetError,
    );
    expect(columns.delete).not.toHaveBeenCalled();
  });

  it("never deletes the last todo or done column", async () => {
    const columns = columnsDouble();

    await expect(
      new DeleteBoardColumnUseCase(projectsDouble(), columns, transactionDouble()).execute({
        ...input,
        columnId: 1,
        moveIssuesToColumnId: 2,
      }),
    ).rejects.toThrow(LastBoardColumnOfCategoryError);
    expect(columns.moveIssues).not.toHaveBeenCalled();
  });

  it("fails when the column does not exist", async () => {
    await expect(
      new DeleteBoardColumnUseCase(projectsDouble(), columnsDouble(), transactionDouble()).execute({
        ...input,
        columnId: 99,
      }),
    ).rejects.toThrow(BoardColumnNotFoundError);
  });

  it("allows deleting a todo column when another todo column exists", async () => {
    const columns = columnsDouble([...columnEntities, aColumn({ id: 7, name: "Backlog" })]);

    await expect(
      new DeleteBoardColumnUseCase(projectsDouble(), columns, transactionDouble()).execute({
        ...input,
        columnId: 1,
        moveIssuesToColumnId: 7,
      }),
    ).resolves.toBeUndefined();
  });
});
