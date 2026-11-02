import { HttpMethod, injectQuery, requireData } from "@/api/config";
import { HOME, SUMMARY } from "@/api/uris";
import type { HomeSummaryDto } from "@orbit/shared";
import { useQuery } from "@tanstack/react-query";
import { t } from "@/i18n/locale-store";

export function useGetHomeSummary({ enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: [HOME, SUMMARY],
    enabled,
    staleTime: 0,
    refetchOnMount: true,
    queryFn: () =>
      requireData(
        injectQuery<HomeSummaryDto>([HOME, SUMMARY], {
          method: HttpMethod.GET,
        }),
        t("api.emptyHome"),
      ),
  });
}
