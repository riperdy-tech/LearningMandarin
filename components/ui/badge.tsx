import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full bg-jade-50 px-3 text-xs font-semibold text-jade-900 ring-1 ring-jade-500/20",
        className
      )}
      {...props}
    />
  );
}
