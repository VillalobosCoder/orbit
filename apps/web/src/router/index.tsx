import { createBrowserRouter, Navigate } from "react-router-dom";
import { PrivateGuard, PublicGuard } from "@/router/guards.tsx";
import Login from "@/features/auth/pages/login/login";
import ChangePasswordPage from "@/features/auth/pages/change-password/change-password";
import ProfilePage from "@/features/profile/pages/profile";
import SettingsPage from "@/features/settings/pages/settings";
import AuthLayout from "@/features/auth/pages/auth-layout";
import ModuleLayout from "@/shared/ui/layouts/module-loyout";
import NotFoundPage from "./not-found";
import RouteErrorPage from "./route-error";
import HomePage from "@/features/home/pages/home";
import UsersPage from "@/features/users/pages/users";
import PlanningPage from "@/features/sprints/pages/planning";
import IssueDetailDialog from "@/features/issues/pages/components/issue-detail-dialog";
import ProjectDetailPage from "@/features/projects/pages/project-detail";
import { PermissionGuard } from "./permission-guard";

export const router = createBrowserRouter([
  {
    element: <PublicGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: "/login", element: <Login /> }],
      },
    ],
  },
  {
    path: "/",
    element: <PrivateGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "cambiar-contrasena", element: <ChangePasswordPage /> },
        ],
      },
      {
        element: <ModuleLayout />,
        children: [
          { path: "perfil", element: <ProfilePage /> },
          { path: "configuracion", element: <SettingsPage /> },
          {
            element: <PermissionGuard module="home" />,
            children: [{ index: true, element: <HomePage /> }],
          },
          {
            path: "users",
            element: <PermissionGuard module="users" />,
            children: [{ index: true, element: <UsersPage /> }],
          },
          {
            path: "projects",
            element: <PermissionGuard module="projects" />,
            children: [
              { index: true, element: <Navigate to="/" replace /> },
              { path: ":id/planning", element: <PlanningPage /> },
              {
                path: ":id",
                element: <ProjectDetailPage />,
                children: [
                  { path: "issues/:issueId", element: <IssueDetailDialog /> },
                ],
              },
            ],
          },
          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);
