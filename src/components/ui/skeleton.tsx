import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Esqueleto com uma faixa de luz atravessando — como luz entrando no átrio. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div aria-hidden="true" className={cn("relative overflow-hidden rounded-lg bg-white/[0.07]", className)} {...props}>
      <div className="absolute inset-0 animate-faixa-de-luz bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
    </div>
  );
}
