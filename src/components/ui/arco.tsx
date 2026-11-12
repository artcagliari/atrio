import { cn, iniciais } from "@/lib/utils";

/** Inicial dentro de uma forma de arco (topo arredondado), em vez de círculo. */
export function ArcoInicial({ nome, tamanho = "md", className }: { nome: string; tamanho?: "sm" | "md" | "lg"; className?: string }) {
  const t = { sm: "h-8 w-7 text-micro", md: "h-11 w-10 text-apoio", lg: "h-14 w-12 text-corpo" }[tamanho];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "arco vidro-interno flex shrink-0 items-end justify-center pb-1.5 font-medium text-foreground [--vidro-a:0.1]",
        t,
        className,
      )}
    >
      {iniciais(nome).slice(0, tamanho === "sm" ? 1 : 2)}
    </span>
  );
}
