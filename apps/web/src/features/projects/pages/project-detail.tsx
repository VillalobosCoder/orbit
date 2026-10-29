import { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import IssueBoard from "@/features/issues/pages/components/issue-board";
import { AssigneeStack } from "@/features/issues/pages/components/issue-visuals";
import { ConfirmDialogComponent } from "@/shared/ui/custom-components/confirm-dialog-component";
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
  const { data: project, isLoading, error } = useGetProject(projectId);
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
      <p
        role="alert"
        className="m-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {error?.message ?? "Proyecto no encontrado."}
      </p>
    );
  }

  const isOwner = project.ownerUserId === user?.id;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
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
            aria-pressed={view === "members"}
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
      {view === "board" ? (
        <IssueBoard project={project} />
      ) : (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Volver al tablero"
              onClick={() => setView("board")}
            >
              <ArrowLeft />
            </Button>
            <h2 className="text-lg font-semibold">Miembros</h2>
          </div>
          <ProjectMembers
            project={project}
            canManage={canWrite && isOwner}
          />
        </section>
      )}
      <Outlet />
    </div>
  );
}
