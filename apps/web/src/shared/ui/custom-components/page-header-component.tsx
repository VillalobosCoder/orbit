import type { ReactNode } from "react";

interface PageHeaderComponentProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeaderComponent({
  title,
  description,
  children,
}: PageHeaderComponentProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
