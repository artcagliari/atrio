/**
 * Fundo: base em azul petróleo profundo, quatro luzes grandes e intensas, muito desfocadas
 * (o que faz o vidro desfocar cor de verdade) e grão fino a ~3%.
 * As luzes "acendem" em 800 ms e derivam devagar; prefers-reduced-motion desliga o movimento.
 */
const RUIDO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23r)'/%3E%3C/svg%3E\")";

export function BackgroundLights() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#05141A] to-[#0A2A30]">
      <div className="absolute inset-0 animate-in fade-in-0 [animation-duration:800ms]">
        {/* 1. Ciano luminoso — a luz entrando pelo teto */}
        <div className="absolute -top-[30vh] left-1/2 h-[62vh] w-[62vw] -translate-x-1/2">
          <div className="size-full rounded-full bg-[#2FB8B8] opacity-[0.45] blur-[150px] will-change-transform motion-safe:animate-deriva-1" />
        </div>
        {/* 2. Petróleo vivo — esquerda, meio */}
        <div className="absolute -left-[14vw] top-[24vh] h-[60vh] w-[46vw] rounded-full bg-[#0E7C86] opacity-[0.5] blur-[140px] will-change-transform motion-safe:animate-deriva-2" />
        {/* 3. Âmbar/latão quente — canto inferior direito, menor */}
        <div className="absolute -bottom-[14vh] -right-[6vw] h-[40vh] w-[30vw] rounded-full bg-[#C98B3A] opacity-[0.45] blur-[130px] will-change-transform motion-safe:animate-deriva-3" />
        {/* 4. Azul-esverdeado escuro — canto inferior esquerdo */}
        <div className="absolute -bottom-[24vh] -left-[10vw] h-[60vh] w-[50vw] rounded-full bg-[#0B4F5C] opacity-[0.55] blur-[160px] will-change-transform motion-safe:animate-deriva-1" />
      </div>
      {/* Grão */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: RUIDO }} />
    </div>
  );
}
