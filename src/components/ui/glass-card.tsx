import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const glassVariants = cva("", {
  variants: {
    /** leve: white/7 · medio: white/10 (padrão) · leitura: white/13, blur maior */
    nivel: { leve: "vidro-leve", medio: "vidro", leitura: "vidro-leitura" },
    /** painel: cantos 24px · card: cantos 16px */
    forma: { painel: "rounded-3xl", card: "rounded-2xl" },
    clicavel: { true: "vidro-clicavel cursor-pointer", false: "" },
  },
  defaultVariants: { nivel: "medio", forma: "card", clicavel: false },
});

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof glassVariants> {}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({ className, nivel, forma, clicavel, ...props }, ref) => (
  <div ref={ref} className={cn(glassVariants({ nivel, forma, clicavel }), className)} {...props} />
));
GlassCard.displayName = "GlassCard";

export { glassVariants };
