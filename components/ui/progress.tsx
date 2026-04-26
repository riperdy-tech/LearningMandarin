import { cn } from "@/lib/utils";

export function Progress({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-black/10", className)}>
      <div
        className="h-full rounded-full bg-jade-600 transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
