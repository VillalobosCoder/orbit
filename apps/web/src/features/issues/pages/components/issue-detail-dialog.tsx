import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  useGetProject,
  useGetProjectMembers,
} from "@/features/projects/api/queries";
import { useGetPlanning } from "@/features/sprints/api/queries";
import { useGetBoard, useGetIssueOptions } from "../../api/queries";
import IssueDialog from "./issue-dialog";
import { useI18n } from "@/i18n/use-i18n";

export default function IssueDetailDialog() {
  const { t } = useI18n();
  const params = useParams();
  const projectId = Number(params.id);
  const issueId = Number(params.issueId);
  const navigate = useNavigate();
  const project = useGetProject(projectId);
  const board = useGetBoard(projectId);
  const options = useGetIssueOptions(projectId);
  const members = useGetProjectMembers(projectId);
  const planning = useGetPlanning(projectId);
  const close = () => navigate(`/projects/${projectId}`);

  const shell = (title: string, content: ReactNode) => (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
    >
      <DialogContent className="flex h-[min(90vh,50rem)] flex-col gap-4 overflow-hidden sm:max-w-4xl">
        {content ?? (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Spinner />
              {title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("issues.loader.loadingDescription")}
            </DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );

  if (
    project.isLoading ||
    board.isLoading ||
    options.isLoading ||
    members.isLoading
  ) {
    return shell(t("issues.loader.loading"), null);
  }

  const loadError = [project, board, options, members].find(
    (query) => query.isError,
  )?.error;

  if (loadError) {
    return shell(
      t("issues.loader.loadFailed"),
      <>
        <DialogHeader>
          <DialogTitle>{t("issues.loader.loadFailed")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("issues.loader.loadFailedDescription")}
          </DialogDescription>
        </DialogHeader>
      </>,
    );
  }

  if (!project.data || !board.data || !options.data || !members.data) {
    return null;
  }

  const issue = board.data.issues.find((item) => item.id === issueId);

  if (!issue) {
    return shell(
      t("issues.loader.notFound"),
      <>
        <DialogHeader>
          <DialogTitle>{t("issues.loader.notFound")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("issues.loader.notFoundDescription")}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("issues.loader.notFoundBody")}
        </p>
      </>,
    );
  }

  return (
    <IssueDialog
      key={issue.id}
      project={project.data}
      options={options.data}
      columns={board.data.columns}
      issues={board.data.issues}
      sprints={planning.data?.sprints ?? []}
      members={members.data}
      issue={issue}
      onClose={close}
    />
  );
}
