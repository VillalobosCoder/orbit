export type TeamDto = {
  id: number;
  name: string;
  description: string | null;
};

export type TeamIdRequestDto = {
  id: number;
};

export type SaveTeamRequestDto = {
  name: string;
  description?: string | null;
};
