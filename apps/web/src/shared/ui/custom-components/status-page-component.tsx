import type { ReactNode } from "react";

interface StatusPageComponentProps {
  code: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function StatusPageComponent({
  code,
  title,
  description,
  children,
}: StatusPageComponentProps) {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 items-center justify-center">
      <div className="flex w-full max-w-lg flex-col items-center gap-4 text-center">
        <svg
          aria-hidden="true"
          viewBox="0 40 240 120"
          fill="none"
          className="h-36 w-60"
        >
          <ellipse
            cx="120"
            cy="100"
            rx="110"
            ry="34"
            transform="rotate(-18 120 100)"
            className="stroke-info"
            strokeOpacity=".4"
          />
          <ellipse
            cx="120"
            cy="100"
            rx="76"
            ry="22"
            transform="rotate(-18 120 100)"
            className="stroke-primary"
            strokeOpacity=".6"
          />
          <circle
            cx="120"
            cy="100"
            r="16"
            className="fill-card stroke-primary"
            strokeOpacity=".8"
          />
          <circle cx="205" cy="76" r="3.5" className="fill-info" />
        </svg>

        <p className="bg-linear-to-br from-primary to-info bg-clip-text text-7xl leading-none font-bold tracking-tighter text-transparent">
          {code}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
          {description}
        </p>

        {children && (
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
