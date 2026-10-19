import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="max-w-md mx-auto flex min-h-screen flex-col justify-center space-y-6">
      <Outlet />
    </div>
  );
}
