import { useState } from "react";
import { NavLink } from "react-router-dom";
import { CornerDownRight, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialogComponent } from "@/components/ui/confirm-dialog-component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import IssueAttachments from "./components/shared/issue-attachments";
import IssueComments from "@/features/comments/pages/components/issue-comments";
import {
  useCreateIssue,
  useDeleteIssue,
  useUpdateIssue,
} from "@/features/issues/api/queries";
import {
  ISSUE_DESCRIPTION_MAX_LENGTH,
  ISSUE_TITLE_MAX_LENGTH,
  ModuleKey,
  type BoardColumnDto,
  type IssueDto,
  type IssueOptionsDto,
  type ProjectDto,
  type ProjectMemberDto,
  type SprintDto,
} from "@orbit/shared";
import {
  buildIssueDraft,
  toSaveIssueInput,
  type IssueDraft,
} from "./components/issue-dialog/issue-draft";
import IssueSidebar from "./components/issue-dialog/issue-sidebar";
import IssueSubtasks from "./components/issue-dialog/issue-subtasks";
import { IssueTypeIcon } from "./components/shared/issue-visuals";
import { useI18n } from "@/i18n/use-i18n";


interface IssueDialogProps {
  project: ProjectDto;
  options: IssueOptionsDto;
  columns: BoardColumnDto[];
  issues: IssueDto[];
  sprints: SprintDto[];
  members: ProjectMemberDto[];
  issue?: IssueDto;
  defaults?: { typeId?: number; parentId?: number };
  defaultSprintId?: number | null;
  onClose: () => void;
}

export default function IssueDialog({
  project,
  options,
  columns,
  issues,
  sprints,
  members,
  issue,
  defaults,
  defaultSprintId = null,
  onClose,
}: IssueDialogProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { canWrite } = usePermission(ModuleKey.PROJECTS);
  const { canWrite: canWriteIssues } = usePermission(ModuleKey.PROJECT_ISSUES);
  const { canWrite: canMoveIssues } = usePermission(
    ModuleKey.PROJECT_MOVE_ISSUES,
  );
  const { canWrite: canEditSprints } = usePermission(ModuleKey.PROJECT_SPRINTS);
  const createIssue = useCreateIssue();
  const updateIssue = useUpdateIssue();
  const deleteIssue = useDeleteIssue();
  const isCreating = issue === undefined;
  const [isEditing, setIsEditing] = useState(isCreating);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);

  const [draft, setDraft] = useState<IssueDraft>(() =>
    buildIssueDraft({ issue, defaults, defaultSprintId, options, columns }),
  );

  function updateDraft(changes: Partial<IssueDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  const mutation = isCreating ? createIssue : updateIssue;
  const draftType = options.issueTypes.find((type) => type.id === draft.typeId);
  const isDraftSubtask = draftType?.isSubtask ?? false;
  const parentCandidates = issues.filter(
    (candidate) =>
      candidate.id !== issue?.id &&
      candidate.parentId === null &&
      !options.issueTypes.find((type) => type.id === candidate.typeId)
        ?.isSubtask,
  );

  function startEditing() {
    setDraft(
      buildIssueDraft({ issue, defaults, defaultSprintId, options, columns }),
    );
    updateIssue.reset();
    setIsEditing(true);
  }

  function cancelEditing() {
    if (isCreating) {
      onClose();
      return;
    }

    updateIssue.reset();
    setIsEditing(false);
  }

  const isSaveDisabled =
    mutation.isPending ||
    draft.title.trim() === "" ||
    (isDraftSubtask && draft.parentId === null);

  function handleSave() {
    if (isSaveDisabled) return;

    const input = toSaveIssueInput(draft, isDraftSubtask);

    if (issue) {
      updateIssue.mutate(
        { id: project.id, issueId: issue.id, ...input },
        { onSuccess: () => setIsEditing(false) },
      );
    } else {
      createIssue.mutate({ id: project.id, ...input }, { onSuccess: onClose });
    }
  }

  const type = options.issueTypes.find((item) => item.id === issue?.typeId);
  const parent = issues.find((item) => item.id === issue?.parentId);
  const subtasks = issue
    ? issues
        .filter((item) => item.parentId === issue.id)
        .sort((a, b) => a.issueNumber - b.issueNumber)
    : [];
  const subtaskType = options.issueTypes.find((item) => item.isSubtask);
  const canAddSubtask =
    canWriteIssues &&
    !isEditing &&
    subtaskType !== undefined &&
    parent === undefined &&
    !type?.isSubtask;

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="flex h-[min(90vh,50rem)] flex-col gap-4 overflow-hidden sm:max-w-4xl">
        <DialogHeader className="shrink-0 pr-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <IssueTypeIcon type={isEditing ? draftType : type} />
              {issue ? (
                <span className="font-mono text-sm font-medium text-info">
                  {issue.issueKey}
                </span>
              ) : (
                <span className="text-sm font-medium">
                  {t("issues.dialog.newTitle")}
                </span>
              )}
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelEditing}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  loading={mutation.isPending}
                  disabled={isSaveDisabled}
                  onClick={handleSave}
                >
                  {t(issue ? "common.saveChanges" : "issues.dialog.create")}
                </Button>
              </div>
            ) : (
              canWriteIssues && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startEditing}
                  >
                    <Pencil />
                    {t("common.edit")}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsConfirmingDelete(true)}
                  >
                    <Trash2 />
                    {t("common.delete")}
                  </Button>
                </div>
              )
            )}
          </div>
          {isEditing ? (
            <>
              <DialogTitle className="sr-only">
                {issue
                  ? t("issues.dialog.editingTitle", { key: issue.issueKey })
                  : t("issues.dialog.newTitle")}
              </DialogTitle>
              <Input
                aria-label={t("issues.dialog.titleLabel")}
                placeholder={t("issues.dialog.titlePlaceholder")}
                value={draft.title}
                maxLength={ISSUE_TITLE_MAX_LENGTH}
                autoFocus
                className="h-11 text-lg font-semibold"
                onChange={(event) =>
                  updateDraft({ title: event.currentTarget.value })
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSave();
                  }
                }}
              />
            </>
          ) : (
            <DialogTitle className="text-2xl leading-snug font-bold tracking-tight [overflow-wrap:anywhere]">
              {issue?.title}
            </DialogTitle>
          )}
          <DialogDescription className="text-sm">
            {!isEditing && parent ? (
              <span className="inline-flex items-center gap-1.5">
                <CornerDownRight className="size-3.5" aria-hidden="true" />
                {t("issues.dialog.subtaskOf")}{" "}
                <NavLink
                  to={`/projects/${project.id}/issues/${parent.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {parent.issueKey} · {parent.title}
                </NavLink>
              </span>
            ) : isCreating ? (
              t("issues.dialog.createdIn", {
                key: project.projectKey,
                name: project.name,
              })
            ) : (
              <span className="sr-only">
                {t("issues.dialog.viewDescription", {
                  key: project.projectKey,
                })}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>


        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_16rem] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
          <div className="flex min-w-0 flex-col gap-7 lg:overflow-y-auto lg:pr-2">
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">
                {t("issues.dialog.description")}
              </h2>
              {isEditing ? (
                <>
                  <Textarea
                    aria-label={t("issues.dialog.description")}
                    value={draft.description}
                    maxLength={ISSUE_DESCRIPTION_MAX_LENGTH}
                    className="h-32 resize-none"
                    onChange={(event) =>
                      updateDraft({ description: event.currentTarget.value })
                    }
                  />
                  <span className="self-end text-xs text-muted-foreground">
                    {draft.description.length} / {ISSUE_DESCRIPTION_MAX_LENGTH}
                  </span>
                </>
              ) : issue?.description ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] text-foreground/90">
                  {issue.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("issues.dialog.noDescription")}
                </p>
              )}
            </section>

            {issue && (
              <IssueAttachments
                issue={{ id: project.id, issueId: issue.id }}
                canWrite={canWriteIssues && isEditing}
              />
            )}

            {issue && (subtasks.length > 0 || canAddSubtask) && (
              <IssueSubtasks
                projectId={project.id}
                subtasks={subtasks}
                columns={columns}
                canAdd={canAddSubtask}
                onAdd={() => setIsCreatingSubtask(true)}
              />
            )}

            {issue && (
              <IssueComments
                issue={{ id: project.id, issueId: issue.id }}
                currentUserId={user?.id}
                canWrite={canWrite}
              />
            )}
          </div>

          <IssueSidebar
            issue={issue}
            draft={draft}
            onChange={updateDraft}
            isEditing={isEditing}
            isCreating={isCreating}
            options={options}
            columns={columns}
            sprints={sprints}
            members={members}
            parentCandidates={parentCandidates}
            isDraftSubtask={isDraftSubtask}
            canMoveIssues={canMoveIssues}
            canEditSprints={canEditSprints}
          />
        </div>

        {issue && (
          <ConfirmDialogComponent
            open={isConfirmingDelete}
            title={t("issues.dialog.deleteDialog.title", { key: issue.issueKey })}
            description={
              subtasks.length > 0
                ? t("issues.dialog.deleteDialog.withSubtasks", {
                    count: subtasks.length,
                  })
                : t("issues.dialog.deleteDialog.simple")
            }
            confirmLabel={t("issues.dialog.deleteDialog.confirm")}
            isPending={deleteIssue.isPending}
            destructive
            onClose={() => setIsConfirmingDelete(false)}
            onConfirm={() =>
              deleteIssue.mutate(
                { id: project.id, issueId: issue.id },
                {
                  onSuccess: onClose,
                  onSettled: () => setIsConfirmingDelete(false),
                },
              )
            }
          />
        )}

        {issue && isCreatingSubtask && subtaskType && (
          <IssueDialog
            project={project}
            options={options}
            columns={columns}
            issues={issues}
            sprints={sprints}
            members={members}
            defaults={{ typeId: subtaskType.id, parentId: issue.id }}
            onClose={() => setIsCreatingSubtask(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
