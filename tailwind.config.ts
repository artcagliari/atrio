import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Geist Mono Variable"', "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ['"Source Serif 4 Variable"', "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        // Serifa (títulos): 36 / 28 / 21 · Geist: 15 / 13 / 12
        "display-1": ["36px", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-2": ["28px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "display-3": ["21px", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        corpo: ["15px", { lineHeight: "1.5" }],
        apoio: ["13px", { lineHeight: "1.45" }],
        micro: ["12px", { lineHeight: "1.4" }],
      },
      colors: {
        foreground: "rgb(var(--fg) / <alpha-value>)",
        /** white/65 por padrão — ajustado em index.css para manter AA */
        muted: { foreground: "rgb(var(--fg) / var(--fg-2-a))" },
        /** white/45 por padrão — ajustado em index.css para manter AA */
        terciario: "rgb(var(--fg) / var(--fg-3-a))",
        latao: "rgb(var(--latao) / <alpha-value>)",
        tinta: "rgb(var(--tinta) / <alpha-value>)",
        urgente: "rgb(var(--urgente) / <alpha-value>)",
        ciano: "rgb(var(--ciano) / <alpha-value>)",
        // Pares shadcn — nenhum combina fundo claro com texto claro
        primary: { DEFAULT: "rgb(var(--primary) / <alpha-value>)", foreground: "rgb(var(--primary-foreground) / <alpha-value>)" },
        secondary: { DEFAULT: "rgb(var(--secondary) / 0.10)", foreground: "rgb(var(--secondary-foreground) / <alpha-value>)" },
        accent: { DEFAULT: "rgb(var(--accent) / 0.15)", foreground: "rgb(var(--accent-foreground) / <alpha-value>)" },
        ring: "rgb(var(--latao) / <alpha-value>)",
      },
      borderRadius: {
        "3xl": "24px",
        "2xl": "16px",
        xl: "12px",
        lg: "10px",
        md: "8px",
      },
      transitionTimingFunction: { suave: "cubic-bezier(0.22, 1, 0.36, 1)" },
      keyframes: {
        "deriva-1": {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "100%": { transform: "translate3d(4vw,5vh,0) scale(1.08)" },
        },
        "deriva-2": {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "100%": { transform: "translate3d(-6vw,-4vh,0) scale(1.06)" },
        },
        "deriva-3": {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "100%": { transform: "translate3d(5vw,-6vh,0) scale(0.94)" },
        },
        "faixa-de-luz": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulso: {
          "0%": { boxShadow: "0 0 0 0 rgb(229 72 77 / 0.55)" },
          "70%": { boxShadow: "0 0 0 7px rgb(229 72 77 / 0)" },
          "100%": { boxShadow: "0 0 0 0 rgb(229 72 77 / 0)" },
        },
      },
      animation: {
        "deriva-1": "deriva-1 34s ease-in-out infinite alternate",
        "deriva-2": "deriva-2 38s ease-in-out infinite alternate",
        "deriva-3": "deriva-3 31s ease-in-out infinite alternate",
        "faixa-de-luz": "faixa-de-luz 1.8s ease-in-out infinite",
        pulso: "pulso 2.4s ease-out infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
