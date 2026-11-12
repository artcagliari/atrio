import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import type { Atendimento, DiaSemana, StatusAtendimento, StatusConsulta } from "./types";

/** Ensina ao tailwind-merge a escala tipográfica própria — sem isso, "text-corpo" seria tratado como cor e apagaria "text-tinta". */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display-1", "display-2", "display-3", "corpo", "apoio", "micro"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uid = (prefixo = "id") => `${prefixo}-${Math.random().toString(36).slice(2, 9)}`;

/* ---------- Rótulos ---------- */

export const STATUS_LABEL: Record<StatusAtendimento, string> = {
  novo: "Novo",
  aguardando_analise: "Aguardando análise",
  consulta_agendada: "Consulta agendada",
  contratou: "Contratou",
  nao_contratou: "Não contratou",
  fora_de_escopo: "Fora de escopo",
};

export const STATUS_ORDEM: StatusAtendimento[] = [
  "novo",
  "aguardando_analise",
  "consulta_agendada",
  "contratou",
  "nao_contratou",
  "fora_de_escopo",
];

export const STATUS_CONSULTA_LABEL: Record<StatusConsulta, string> = {
  pre_agendada: "Pré-agendada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  cancelada: "Cancelada",
};

export const DIAS_SEMANA: Record<DiaSemana, { curto: string; longo: string }> = {
  0: { curto: "Dom", longo: "Domingo" },
  1: { curto: "Seg", longo: "Segunda-feira" },
  2: { curto: "Ter", longo: "Terça-feira" },
  3: { curto: "Qua", longo: "Quarta-feira" },
  4: { curto: "Qui", longo: "Quinta-feira" },
  5: { curto: "Sex", longo: "Sexta-feira" },
  6: { curto: "Sáb", longo: "Sábado" },
};

/* ---------- Datas (Intl, sem dependências) ---------- */

const fmtHora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const fmtDataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const fmtDataLonga = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const fmtDataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const fmtMesAno = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export const formatarHora = (d: Date | string) => fmtHora.format(new Date(d));
export const formatarDataCurta = (d: Date | string) => fmtDataCurta.format(new Date(d));
export const formatarDataLonga = (d: Date | string) => fmtDataLonga.format(new Date(d));
export const formatarDataHora = (d: Date | string) => fmtDataHora.format(new Date(d));
export const formatarMesAno = (d: Date | string) => fmtMesAno.format(new Date(d));

export function inicioDoDia(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function adicionarDias(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Semana começando na segunda-feira. */
export function inicioDaSemana(d: Date) {
  const r = inicioDoDia(d);
  const dia = r.getDay();
  return adicionarDias(r, dia === 0 ? -6 : 1 - dia);
}

export const mesmoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function tempoRelativo(iso: string, agora = Date.now()) {
  const diff = Math.max(0, agora - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1 dia" : `${d} dias`;
}

/* ---------- Regras de negócio da lista ---------- */

/** Atendimento ainda depende de um primeiro retorno da equipe. */
export const aguardaRetorno = (a: Atendimento) =>
  !a.ultimoContatoHumano && (a.status === "novo" || a.status === "aguardando_analise");

/** Urgente que ainda não recebeu retorno — alimenta o contador vermelho. */
export const urgentePendente = (a: Atendimento) => a.urgente && aguardaRetorno(a);

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

/** Normaliza para busca sem acento e sem diferenciar maiúsculas. */
export const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* ---------- Horários ---------- */

export function minutosDe(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function hhmmDe(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
