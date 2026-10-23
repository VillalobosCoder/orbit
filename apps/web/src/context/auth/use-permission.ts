import { useAuth } from "./use-auth";

export function usePermission(module: string) {
  const { user } = useAuth();
  const permission = user?.permissions.find((item) => item.module === module);
  const canRead = permission?.canRead ?? false;
  const canWrite = permission?.canWrite ?? false;

  return {
    canRead,
    canWrite,
    hasAccess: canRead || canWrite,
  };
}
