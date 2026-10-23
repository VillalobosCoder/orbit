import { HttpMethod, injectQuery } from "@/api/config";
import { MODULES } from "@/api/uris";
import type { ModuleDto } from "@orbit/shared";
import { useQuery } from "@tanstack/react-query";

export function useGetModules() {
  return useQuery({
    queryKey: [MODULES],
    queryFn: async () => {
      const modules = await injectQuery<ModuleDto[]>([MODULES], {
        method: HttpMethod.GET,
      });

      if (!modules) {
        throw new Error("La API no devolvió los módulos.");
      }

      return modules;
    },
  });
}
