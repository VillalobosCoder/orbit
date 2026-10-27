import type {
  BoardColumnDto,
  DifficultyDto,
  IssueTypeDto,
  PriorityDto,
  ProjectIdRequestDto,
} from "@orbit/shared";

export type SeedDefaultCatalogCommand = ProjectIdRequestDto & {
  actorUserId: number;
};

export interface IssueCatalogRepository {
  findColumns(query: ProjectIdRequestDto): Promise<BoardColumnDto[]>;
  findIssueTypes(query: ProjectIdRequestDto): Promise<IssueTypeDto[]>;
  findPriorities(query: ProjectIdRequestDto): Promise<PriorityDto[]>;
  findDifficulties(): Promise<DifficultyDto[]>;
  seedDefaults(command: SeedDefaultCatalogCommand): Promise<void>;
}
