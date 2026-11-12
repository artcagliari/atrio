import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "mark";
  /** "latao" (marca) ou "neutro" (white/65, para usos repetidos como o balão do assistente) */
  tom?: "latao" | "neutro";
  className?: string;
  tamanho?: number;
}

/**
 * Arco romano em traço fino cuja abertura forma a letra "A",
 * com um ponto de luz ciano no topo — a luz entrando pelo átrio.
 */
export function Logo({ variant = "full", tom = "latao", className, tamanho = 32 }: LogoProps) {
  const traco = tom === "latao" ? "rgb(var(--latao))" : "rgb(var(--fg) / 0.65)";
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0 overflow-visible">
        {/* arco externo */}
        <path d="M7 28V15.5a9 9 0 0 1 18 0V28" fill="none" stroke={traco} strokeWidth="1.5" strokeLinecap="round" />
        {/* travessa do "A" */}
        <path d="M7 20.5h18" fill="none" stroke={traco} strokeWidth="1.5" strokeLinecap="round" />
        {/* luz entrando pelo teto */}
        <circle cx="16" cy="3.2" r="1.9" fill="rgb(var(--ciano))" />
        <circle cx="16" cy="3.2" r="4.5" fill="rgb(var(--ciano))" opacity="0.18" />
      </svg>
      {variant === "full" && <span className="font-serif text-[22px] leading-none">Átrio</span>}
      {variant === "mark" && <span className="sr-only">Átrio</span>}
    </span>
  );
}
