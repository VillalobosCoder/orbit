import { HttpMethod, injectQuery, requireData } from "@/api/config";
import { MODULES } from "@/api/uris";
import type { ModuleDto } from "@orbit/shared";
import { useQuery } from "@tanstack/react-query";
import { t } from "@/i18n/locale-store";

export function useGetModules() {
  return useQuery({
    queryKey: [MODULES],
    queryFn: () =>
      requireData(
        injectQuery<ModuleDto[]>([MODULES], { method: HttpMethod.GET }),
        t("api.emptyModules"),
      ),
  });
}
