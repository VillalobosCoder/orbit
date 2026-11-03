import {
  handleMutationError,
  HttpMethod,
  injectQuery,
  requireData,
} from "@/api/config";
import { POLL_INTERVAL_MS, queryClient } from "@/api/tanstack-query-config";
import { NOTIFICATIONS, PREFERENCE, READ, READ_ALL } from "@/api/uris";
import type {
  NotificationIdRequestDto,
  NotificationListDto,
  NotificationListQueryDto,
  SetNotificationPreferenceRequestDto,
} from "@orbit/shared";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { t } from "@/i18n/locale-store";

const notificationsKey = [NOTIFICATIONS] as const;

function invalidateNotifications() {
  return queryClient.invalidateQueries({ queryKey: notificationsKey });
}

export function useGetNotifications(query: NotificationListQueryDto) {
  return useQuery({
    queryKey: [...notificationsKey, query],
    placeholderData: keepPreviousData,
    queryFn: () =>
      requireData(
        injectQuery<NotificationListDto>(
          [NOTIFICATIONS],
          { method: HttpMethod.GET },
          query,
        ),
        t("api.emptyNotifications"),
      ),
    refetchInterval: POLL_INTERVAL_MS,
  });
}

export function useMarkNotificationRead() {
  return useMutation<unknown, Error, NotificationIdRequestDto>({
    mutationFn: ({ id }) =>
      injectQuery([NOTIFICATIONS, `/${id}`, READ], {
        method: HttpMethod.PATCH,
      }),
    onSuccess: invalidateNotifications,
    onError: handleMutationError,
  });
}

export function useMarkAllNotificationsRead() {
  return useMutation<unknown, Error, void>({
    mutationFn: () =>
      injectQuery([NOTIFICATIONS, READ_ALL], { method: HttpMethod.POST }),
    onSuccess: invalidateNotifications,
    onError: handleMutationError,
  });
}

export function useSetNotificationPreference() {
  return useMutation<unknown, Error, SetNotificationPreferenceRequestDto>({
    mutationFn: (payload) =>
      injectQuery([NOTIFICATIONS, PREFERENCE], {
        method: HttpMethod.PUT,
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidateNotifications,
    onError: handleMutationError,
  });
}
