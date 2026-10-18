import { createContext } from "react";
import type { AuthenticatedUserDto } from "@orbit/shared";

export type UserSession = AuthenticatedUserDto;

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionError: string | undefined;
  login: (user: UserSession) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
