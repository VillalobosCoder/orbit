import { createBrowserRouter } from "react-router-dom";
import { PrivateGuard, PublicGuard } from "@/router/guards.tsx";
import Login from "@/features/auth/pages/login/login";
import AuthLayout from "@/features/auth/pages/auth-layout";
import ModuleLayout from "@/shared/ui/layouts/module-loyout";
import NotFoundPage from "./not-found";
import HomePage from "@/features/home/pages/home";
import UsersPage from "@/features/users/pages/users";

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
            index: true,
            element: <HomePage />,
          },
          {
            path: "users",
            element: <UsersPage />,
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
