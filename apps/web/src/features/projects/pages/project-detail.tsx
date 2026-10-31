import { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import IssueBoard from "@/features/issues/pages/components/issue-board";
import { AssigneeStack } from "@/features/issues/pages/components/issue-visuals";
import { ConfirmDialogComponent } from "@/components/ui/confirm-dialog-component";
import {
  useDeleteProject,
  useGetProject,
  useGetProjectMembers,
} from "../api/queries";
import ProjectFormDialog from "./components/project-form-dialog";
import ProjectMembers from "./components/project-members";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const { user } = useAuth();
  const { canWrite } = usePermission("projects");
  const {
    data: project,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetProject(projectId);
  const members = useGetProjectMembers(projectId);
  const deleteProject = useDeleteProject();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [view, setView] = useState<"board" | "members">("board");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6" aria-busy="true">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="mt-4 h-72 w-full" />
      </div>
    );
  }
  if (error || !project) {
    return (
      <div className="m-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <p role="alert">{error?.message ?? "Proyecto no encontrado."}</p>
        {error && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isRefetching}
            onClick={() => void refetch()}
          >
            {isRefetching ? "Reintentando..." : "Reintentar"}
          </Button>
        )}
      </div>
    );
  }

  const isOwner = project.ownerUserId === user?.id;

  if (view === "members") {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <button
          type="button"
          onClick={() => setView("board")}
          className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span className="font-mono text-xs">{project.projectKey}</span>
          {project.name}
        </button>
        <ProjectMembers project={project} canManage={canWrite && isOwner} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-[40rem] w-full max-w-[1600px] flex-col gap-6 p-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-medium text-info">
              {project.projectKey}
            </span>
            <h1 className="text-2xl font-bold tracking-tight">
              {project.name}
            </h1>
          </div>
          {project.description && (
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {members.data && members.data.length > 0 && (
            <span className="pr-2">
              <AssigneeStack people={members.data} max={3} />
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setView("members")}
          >
            <Users />
            Miembros
            {members.data && (
              <span className="text-muted-foreground">
                · {members.data.length}
              </span>
            )}
          </Button>
          {canWrite && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Pencil />
              Editar proyecto
            </Button>
          )}
          {canWrite && isOwner && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 />
              Eliminar
            </Button>
          )}
        </div>
      </header>
      {deleteProject.isError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {deleteProject.error.message}
        </p>
      )}
      <ConfirmDialogComponent
        open={isConfirmingDelete}
        title="¿Eliminar proyecto?"
        description={
          <>
            Se eliminará{" "}
            <strong className="font-medium text-foreground">
              {project.projectKey} · {project.name}
            </strong>{" "}
            y dejará de estar disponible para todos sus miembros. No hay forma
            de recuperarlo desde la aplicación.
          </>
        }
        confirmLabel="Eliminar proyecto"
        pendingLabel="Eliminando..."
        isPending={deleteProject.isPending}
        destructive
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={() =>
          deleteProject.mutate(project.id, {
            onSuccess: () => navigate("/", { replace: true }),
            onSettled: () => setIsConfirmingDelete(false),
          })
        }
      />
      {isEditing && (
        <ProjectFormDialog
          project={project}
          onClose={() => setIsEditing(false)}
        />
      )}
      <IssueBoard project={project} />
      <Outlet />
    </div>
  );
}
