import { createBrowserRouter } from "react-router-dom";
import { PrivateGuard, PublicGuard } from "@/router/guards.tsx";
import Login from "@/features/auth/pages/login/login";
import AuthLayout from "@/features/auth/pages/auth-layout";
import ModuleLayout from "@/shared/ui/layouts/module-loyout";
import NotFoundPage from "./not-found";
import HomePage from "@/features/home/pages/home";
import UsersPage from "@/features/users/pages/users";
import ProjectDetailPage from "@/features/projects/pages/project-detail";
import ProjectsPage from "@/features/projects/pages/projects";
import { PermissionGuard } from "./permission-guard";

export const router = createBrowserRouter([
  {
    element: <PublicGuard />,
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
    children: [
      {
        element: <ModuleLayout />,
        children: [
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
              { index: true, element: <ProjectsPage /> },
              { path: ":id", element: <ProjectDetailPage /> },
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
