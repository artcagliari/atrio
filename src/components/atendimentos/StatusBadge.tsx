import type { StatusAtendimento } from "@/lib/types";
import { cn, STATUS_LABEL } from "@/lib/utils";

/** Status em texto discreto. */
export function StatusBadge({ status, className }: { status: StatusAtendimento; className?: string }) {
  return <span className={cn("text-apoio text-muted-foreground", className)}>{STATUS_LABEL[status]}</span>;
}
