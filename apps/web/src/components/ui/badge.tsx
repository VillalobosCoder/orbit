import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex h-[22px] items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-secondary-foreground",
        muted: "border-border bg-transparent text-muted-foreground",
        primary: "border-primary/50 bg-primary/15 text-primary",
        info: "border-info/50 bg-info/15 text-info",
        success: "border-success/50 bg-success/15 text-success",
        warning: "border-warning/50 bg-warning/15 text-warning",
        destructive: "border-destructive/50 bg-destructive/15 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge }
