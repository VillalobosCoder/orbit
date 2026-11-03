import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useGetModules } from "@/features/modules/api/queries";
import {
  useCreateUser,
  useGetUser,
  useUpdateUser,
} from "@/features/users/api/queries";
import TemporaryPassword from "./temporary-password";
import type {
  SaveUserRequestDto,
  UserDetailDto,
  UserPermissionDto,
} from "@orbit/shared";
import { useI18n } from "@/i18n/use-i18n";
import { moduleLabel } from "@/i18n/catalog";

type PermissionFlags = Pick<UserPermissionDto, "canRead" | "canWrite">;

interface UserFormDialogProps {
  /** Sin `userId` el diálogo crea un usuario; con `userId` lo edita. */
  userId?: number;
  isSelf?: boolean;
  onClose: () => void;
}

export default function UserFormDialog({
  userId,
  isSelf = false,
  onClose,
}: UserFormDialogProps) {
  const { t } = useI18n();
  const isEditing = userId !== undefined;
  const userQuery = useGetUser(isEditing ? userId : null);

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        {isEditing && userQuery.isPending && (
          <div aria-busy="true" className="flex flex-col gap-4 py-2">
            <DialogTitle className="sr-only">
              {t("users.form.editTitle")}
            </DialogTitle>
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        )}
        {(!isEditing || userQuery.data) && (
          <UserForm user={userQuery.data} isSelf={isSelf} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function UserForm({
  user,
  isSelf,
  onClose,
}: {
  user?: UserDetailDto;
  isSelf: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const isEditing = user !== undefined;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const mutation = isEditing ? updateUser : createUser;
  const modulesQuery = useGetModules();
  const [permissions, setPermissions] = useState<
    Record<string, PermissionFlags>
  >(() =>
    Object.fromEntries(
      (user?.permissions ?? []).map(({ module, canRead, canWrite }) => [
        module,
        { canRead, canWrite },
      ]),
    ),
  );
  const temporaryPassword = createUser.data?.temporaryPassword;

  function setFlag(module: string, flag: keyof PermissionFlags, value: boolean) {
    setPermissions((current) => {
      const previous = current[module] ?? { canRead: false, canWrite: false };
      const next = { ...previous, [flag]: value };

      if (flag === "canWrite" && value) next.canRead = true;
      if (flag === "canRead" && !value) next.canWrite = false;

      const updated = { ...current, [module]: next };

      if (!next.canRead && !next.canWrite) {
        modulesQuery.data
          ?.filter((item) => item.parentKey === module)
          .forEach((child) => {
            updated[child.key] = { canRead: false, canWrite: false };
          });
      }

      return updated;
    });
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const lastName = formData.get("lastName");
    const email = formData.get("email");

    if (
      typeof name !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string"
    ) {
      return;
    }

    const input: SaveUserRequestDto = {
      name,
      lastName,
      email,
      permissions: isSelf
        ? undefined
        : Object.entries(permissions)
            .filter(([, flags]) => flags.canRead || flags.canWrite)
            .map(([module, flags]) => ({ module, ...flags })),
    };

    if (isEditing) {
      updateUser.mutate({ id: user.id, ...input }, { onSuccess: onClose });
    } else {
      createUser.mutate(input);
    }
  }

  if (temporaryPassword) {
    return (
      <TemporaryPassword
        title={t("users.form.createdTitle")}
        description={t("users.form.createdDescription")}
        password={temporaryPassword}
        onClose={onClose}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {t(isEditing ? "users.form.editTitle" : "users.form.newTitle")}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? t("users.form.editDescription", {
                name: `${user.name} ${user.lastName}`,
              })
            : t("users.form.newDescription")}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="name">{t("common.name")}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user?.name}
              minLength={2}
              maxLength={50}
              required
            />
          </Field>
          <Field>
            <Label htmlFor="lastName">{t("common.lastName")}</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={user?.lastName}
              minLength={2}
              maxLength={50}
              required
            />
          </Field>
        </div>
        <Field>
          <Label htmlFor="email">{t("common.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email}
            maxLength={254}
            autoComplete="email"
            required
          />
        </Field>

        {isSelf ? (
          <p className="rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
            {t("users.form.ownPermissions")}
          </p>
        ) : (
          <fieldset className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <legend className="text-sm font-medium">
                {t("users.form.permissionsLegend")}
              </legend>
              <span className="text-xs text-muted-foreground">
                {t("users.form.writeIncludesRead")}
              </span>
            </div>
            {modulesQuery.isPending && (
              <Skeleton aria-hidden="true" className="h-48 w-full rounded-lg" />
            )}
            {modulesQuery.data && (
              <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
                <div className="grid grid-cols-[minmax(0,1fr)_5rem_5rem] items-center bg-muted/60 px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <span>{t("users.form.moduleColumn")}</span>
                  <span className="text-center">{t("users.form.read")}</span>
                  <span className="text-center">{t("users.form.write")}</span>
                </div>
                {modulesQuery.data.map((module) => {
                  const flags = permissions[module.key] ?? {
                    canRead: false,
                    canWrite: false,
                  };
                  const isChild = module.parentKey !== null;
                  const parentFlags = isChild
                    ? permissions[module.parentKey!]
                    : undefined;
                  const parentGranted = Boolean(
                    parentFlags?.canRead || parentFlags?.canWrite,
                  );
                  const label = moduleLabel(t, module.key, module.name);

                  return (
                    <div
                      key={module.key}
                      className="grid grid-cols-[minmax(0,1fr)_5rem_5rem] items-center border-t border-border px-4 py-3"
                    >
                      <span
                        className={cn(
                          "min-w-0 truncate text-sm font-medium",
                          isChild &&
                            "ml-4 border-l border-border pl-3 font-normal text-muted-foreground",
                        )}
                      >
                        {label}
                      </span>
                      <span className="flex justify-center">
                        {isChild ? (
                          <span
                            aria-hidden="true"
                            className="text-muted-foreground"
                          >
                            —
                          </span>
                        ) : (
                          <Checkbox
                            aria-label={t("users.form.readOf", { label })}
                            checked={flags.canRead}
                            onCheckedChange={(checked) =>
                              setFlag(module.key, "canRead", checked)
                            }
                          />
                        )}
                      </span>
                      <span className="flex justify-center">
                        <Checkbox
                          aria-label={t("users.form.writeOf", { label })}
                          checked={flags.canWrite}
                          disabled={isChild && !parentGranted}
                          onCheckedChange={(checked) =>
                            setFlag(module.key, "canWrite", checked)
                          }
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {t("users.form.subsectionsHint")}
            </p>
          </fieldset>
        )}
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          loading={mutation.isPending}
          disabled={!isSelf && (modulesQuery.isPending || modulesQuery.isError)}
        >
          {t(isEditing ? "common.saveChanges" : "users.form.create")}
        </Button>
      </DialogFooter>
    </form>
  );
}
