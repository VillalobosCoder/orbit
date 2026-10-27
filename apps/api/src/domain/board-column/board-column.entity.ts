import { BoardColumnCategory } from "@orbit/shared";
import { LastBoardColumnOfCategoryError } from "./board-column.errors.js";

export type BoardColumnDetails = {
  name: string;
  color?: string | null;
  wipLimit?: number | null;
};

export type BoardColumnPrimitives = {
  id: number;
  projectId: number;
  name: string;
  category: BoardColumnCategory;
  position: number;
  color: string | null;
  wipLimit: number | null;
};

type BoardColumnProps = Omit<BoardColumnPrimitives, "id"> & { id?: number };

/** Categorías que el proyecto necesita siempre: dónde nacen y dónde terminan los issues. */
const REQUIRED_CATEGORIES: BoardColumnCategory[] = [
  BoardColumnCategory.TODO,
  BoardColumnCategory.DONE,
];

export class BoardColumn {
  private constructor(private readonly props: Readonly<BoardColumnProps>) {}

  static register(
    input: BoardColumnDetails & {
      projectId: number;
      category: BoardColumnCategory;
      position: number;
    },
  ): BoardColumn {
    return new BoardColumn({
      projectId: input.projectId,
      category: input.category,
      position: input.position,
      ...BoardColumn.normalizeDetails(input),
    });
  }

  static fromPersistence(data: BoardColumnPrimitives): BoardColumn {
    return new BoardColumn({ ...data });
  }

  private static normalizeDetails(input: BoardColumnDetails) {
    return {
      name: input.name.trim(),
      color: input.color?.trim() || null,
      wipLimit: input.wipLimit ?? null,
    };
  }

  withDetails(input: BoardColumnDetails): BoardColumn {
    return new BoardColumn({
      ...this.props,
      ...BoardColumn.normalizeDetails(input),
    });
  }

  /** `siblings` son todas las columnas del proyecto, incluida esta. */
  assertRemovable(siblings: BoardColumn[]): void {
    const isRequired = REQUIRED_CATEGORIES.includes(this.props.category);
    const sameCategory = siblings.filter(
      (column) => column.category === this.props.category,
    );

    if (isRequired && sameCategory.length <= 1) {
      throw new LastBoardColumnOfCategoryError();
    }
  }

  toPrimitives(): BoardColumnProps {
    return { ...this.props };
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get projectId(): number {
    return this.props.projectId;
  }

  get name(): string {
    return this.props.name;
  }

  get category(): BoardColumnCategory {
    return this.props.category;
  }

  get position(): number {
    return this.props.position;
  }

  get color(): string | null {
    return this.props.color;
  }

  get wipLimit(): number | null {
    return this.props.wipLimit;
  }
}
