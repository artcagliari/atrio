import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

/** Arco com luz entrando — ilustração dos estados vazios. */
function ArcoDeLuz() {
  return (
    <svg width="120" height="132" viewBox="0 0 120 132" aria-hidden="true">
      <defs>
        <linearGradient id="luz-arco" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(47 184 184)" stopOpacity="0.55" />
          <stop offset="1" stopColor="rgb(47 184 184)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="brilho-arco" cx="0.5" cy="0" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M22 128V58a38 38 0 0 1 76 0v70Z" fill="url(#luz-arco)" />
      <path d="M22 128V58a38 38 0 0 1 76 0v70" fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1.25" />
      <ellipse cx="60" cy="20" rx="40" ry="22" fill="url(#brilho-arco)" />
      <circle cx="60" cy="8" r="3" fill="rgb(47 184 184)" />
    </svg>
  );
}

export function EmptyState({ titulo, descricao, acao, className }: { titulo: string; descricao?: string; acao?: ReactNode; className?: string }) {
  return (
    <GlassCard nivel="leve" forma="painel" className={cn("flex flex-col items-center gap-5 px-6 py-16 text-center", className)}>
      <ArcoDeLuz />
      <div>
        <h2 className="font-serif text-display-3">{titulo}</h2>
        {descricao && <p className="mx-auto mt-2 max-w-sm text-apoio leading-relaxed text-muted-foreground">{descricao}</p>}
      </div>
      {acao}
    </GlassCard>
  );
}
