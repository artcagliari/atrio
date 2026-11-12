import type { ConfigHorarios, Consulta, DiaSemana } from "./types";
import { adicionarDias, inicioDoDia, minutosDe } from "./utils";

/** Próximos dias (a partir de hoje) em que há atendimento configurado. */
export function proximosDiasDisponiveis(horarios: ConfigHorarios, quantidade = 10, agora = new Date()) {
  const dias: Date[] = [];
  for (let i = 0; dias.length < quantidade && i < 60; i++) {
    const d = adicionarDias(inicioDoDia(agora), i);
    const faixa = horarios.faixas.find((f) => f.dia === (d.getDay() as DiaSemana));
    if (faixa?.ativo) dias.push(d);
  }
  return dias;
}

/** Horários livres de um dia, de acordo com a configuração e as consultas já marcadas. */
export function horariosLivres(dia: Date, horarios: ConfigHorarios, consultas: Consulta[], agora = new Date()) {
  const faixa = horarios.faixas.find((f) => f.dia === (dia.getDay() as DiaSemana));
  if (!faixa?.ativo) return [];
  const dur = horarios.duracaoMinutos;
  const ocupadas = consultas
    .filter((c) => c.status !== "cancelada")
    .map((c) => [new Date(c.inicio).getTime(), new Date(c.fim).getTime()] as const);

  const livres: Date[] = [];
  for (let m = minutosDe(faixa.inicio); m + dur <= minutosDe(faixa.fim); m += dur) {
    const inicio = new Date(inicioDoDia(dia));
    inicio.setMinutes(m);
    const ini = inicio.getTime();
    const fim = ini + dur * 60_000;
    if (ini <= agora.getTime()) continue;
    if (ocupadas.some(([a, b]) => ini < b && fim > a)) continue;
    livres.push(inicio);
  }
  return livres;
}
