import { Outlet } from "react-router-dom";
import { ThemeToggleComponent } from "@/components/ui/theme-toggle-component";

export default function AuthLayout() {
  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_50%_-10%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 900 900"
        fill="none"
        className="pointer-events-none absolute -right-64 -bottom-96 -z-10 size-[900px] text-primary opacity-40"
      >
        <ellipse
          cx="450"
          cy="450"
          rx="430"
          ry="150"
          transform="rotate(-24 450 450)"
          stroke="currentColor"
          strokeOpacity=".5"
        />
        <ellipse
          cx="450"
          cy="450"
          rx="330"
          ry="110"
          transform="rotate(-24 450 450)"
          stroke="currentColor"
          strokeOpacity=".7"
        />
        <circle cx="640" cy="330" r="10" className="fill-info" />
      </svg>

      <div className="absolute top-4 right-4">
        <ThemeToggleComponent />
      </div>

      <div className="w-full max-w-5xl">
        <Outlet />
      </div>
    </div>
  );
}
