import { createContext } from "react";
import type { LoginResponseDto } from "@orbit/shared";

export interface AuthContextType {
  user: LoginResponseDto["user"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionError: string | undefined;
  login: (response: LoginResponseDto) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
