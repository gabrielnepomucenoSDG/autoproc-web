import {
  aggregateSkillStatus,
  evaluateBandinhaLocalizacao,
  evaluateBandinhaMemoria,
  evaluateFalaNoRuido,
  evaluatePsiSsi,
  evaluateRgdt,
  evaluateSswInversoes,
  evaluateSswQuantitativo,
  evaluateSswTipoA,
  evaluateTddIntegracao,
  evaluateTddSeparacao,
  evaluateTemporalAuditec,
  parsePatientAge,
  type NormativeStatus,
} from "@/lib/normative-engine";
import type {
  AuditorySkillsSummary,
  ProtocolSummaryInput,
} from "@/lib/pac-store";

export const PROTOCOL_IDS = {
  FALA_NO_RUIDO: "1. Fala no Ruído",
  TDD: "2. TDD",
  SSW: "3. SSW",
  TEMPORAL: "4. Processamento Temporal/RGDT",
  PSI_SSI: "5. PSI/SSI",
  BANDINHA: "6. Bandinha",
} as const;

export const ALL_PROTOCOL_IDS: string[] = [
  PROTOCOL_IDS.FALA_NO_RUIDO,
  PROTOCOL_IDS.TDD,
  PROTOCOL_IDS.SSW,
  PROTOCOL_IDS.TEMPORAL,
  PROTOCOL_IDS.PSI_SSI,
  PROTOCOL_IDS.BANDINHA,
];

function isSelected(selectedTests: string[] | undefined, id: string): boolean {
  if (!selectedTests) return true;
  return selectedTests.includes(id);
}

function formatPsiEarDetail(
  applied: boolean,
  ear: ProtocolSummaryInput["psi"]["od"],
): string {
  if (!applied) return "Protocolo não aplicado";
  const parts: string[] = [];
  if (ear.enabled0) parts.push(`0dB: ${ear.db0 * 10}%`);
  if (ear.enabledMinus10) parts.push(`-10dB: ${ear.dbMinus10 * 10}%`);
  if (ear.enabledMinus15) parts.push(`-15dB: ${ear.dbMinus15 * 10}%`);
  return parts.length > 0 ? parts.join(" | ") : "Não avaliado";
}

function formatPsiRefText(
  applied: boolean,
  od: ProtocolSummaryInput["psi"]["od"],
  oe: ProtocolSummaryInput["psi"]["oe"],
  ref0: string,
  ref10: string,
  ref15: string,
): string {
  if (!applied) return "—";
  const parts: string[] = [];
  if (od.enabled0 || oe.enabled0) parts.push(`0dB ${ref0}`);
  if (od.enabledMinus10 || oe.enabledMinus10) parts.push(`-10dB ${ref10}`);
  if (od.enabledMinus15 || oe.enabledMinus15) parts.push(`-15dB ${ref15}`);
  return parts.length > 0 ? parts.join(" / ") : "—";
}

export function buildClinicalConclusion(skills: AuditorySkillsSummary): {
  alteredSkills: string[];
  lines: string[];
} {
  const entries: Array<{ label: string; status: NormativeStatus }> = [
    { label: "Fechamento Auditivo", status: skills.fechamentoAuditivo },
    { label: "Figura-Fundo", status: skills.figuraFundo },
    { label: "Integração Binaural", status: skills.integracaoBinaural },
    { label: "Separação Binaural", status: skills.separacaoBinaural },
    { label: "Ordenação Temporal", status: skills.ordenacaoTemporal },
    { label: "Resolução Temporal", status: skills.resolucaoTemporal },
    { label: "Localização Sonora", status: skills.localizacaoSonora },
  ];

  const alteredSkills = entries
    .filter((s) => s.status === "Alterado")
    .map((s) => s.label);
  const normalCount = entries.filter((s) => s.status === "Normal").length;

  if (alteredSkills.length > 0) {
    return {
      alteredSkills,
      lines: [
        "Os achados auditivos comportamentais sugerem alteração nas seguintes habilidades auditivas:",
        `${alteredSkills.join("; ")}.`,
      ],
    };
  }

  if (normalCount > 0) {
    return {
      alteredSkills: [],
      lines: [
        "Os achados auditivos comportamentais encontram-se dentro dos padrões de normalidade para a faixa etária nas habilidades avaliadas.",
      ],
    };
  }

  return {
    alteredSkills: [],
    lines: [
      "Nenhuma habilidade auditiva pôde ser classificada como normal ou alterada na bateria aplicada.",
    ],
  };
}

export function computeEvaluationSummary(
  state: ProtocolSummaryInput,
  ageOverride?: number,
) {
  const patientAge =
    ageOverride !== undefined
      ? ageOverride
      : parsePatientAge(
          state.patient.age,
          state.patient.birthDate,
          state.patient.date,
        );

  const selected = state.patient.selectedTests;
  const bandinhaApplied = isSelected(selected, PROTOCOL_IDS.BANDINHA);
  const fnrApplied = isSelected(selected, PROTOCOL_IDS.FALA_NO_RUIDO);
  const tddApplied = isSelected(selected, PROTOCOL_IDS.TDD);
  const sswApplied = isSelected(selected, PROTOCOL_IDS.SSW);
  const temporalApplied = isSelected(selected, PROTOCOL_IDS.TEMPORAL);
  const psiApplied = isSelected(selected, PROTOCOL_IDS.PSI_SSI);

  // 1. Testes Dióticos (Bandinha)
  const loc = state.bandinha.localizacao;
  const locCount = Object.values(loc).filter(Boolean).length;
  const missedDirections: string[] = [];
  if (!loc.direita) missedDirections.push("direita");
  if (!loc.esquerda) missedDirections.push("esquerda");
  if (!loc.acima) missedDirections.push("acima");
  if (!loc.frente) missedDirections.push("à frente");
  if (!loc.atras) missedDirections.push("atrás");
  const locDisplay = !bandinhaApplied
    ? "Não avaliado"
    : missedDirections.length === 0
      ? `${locCount}/5`
      : `${locCount}/5 (errou: ${missedDirections.join(", ")})`;

  const mnvCount = state.bandinha.memoriaNaoVerbal.filter(Boolean).length;
  const mvCount = state.bandinha.memoriaVerbal.filter(Boolean).length;
  const locNorm = bandinhaApplied
    ? evaluateBandinhaLocalizacao(locCount, loc.direita, loc.esquerda)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const mnvNorm = bandinhaApplied
    ? evaluateBandinhaMemoria(mnvCount)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const mvNorm = bandinhaApplied
    ? evaluateBandinhaMemoria(mvCount)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const bandinhaStatus = aggregateSkillStatus([
    locNorm.status,
    mnvNorm.status,
    mvNorm.status,
  ]);

  // 2. Tarefas Monoaurais de Baixa Redundância (Fala no Ruído e PSI/SSI)
  const odFr = Math.max(0, 100 - state.falaNoRuido.od.erros.length * 4);
  const oeFr = Math.max(0, 100 - state.falaNoRuido.oe.erros.length * 4);
  const odFrEval = evaluateFalaNoRuido(state.falaNoRuido.od.iprfGravacao, odFr);
  const oeFrEval = evaluateFalaNoRuido(state.falaNoRuido.oe.iprfGravacao, oeFr);
  const odIprfStatus: NormativeStatus = fnrApplied
    ? odFrEval.iprf.status
    : "Não avaliado";
  const oeIprfStatus: NormativeStatus = fnrApplied
    ? oeFrEval.iprf.status
    : "Não avaliado";
  const iprfStatus = aggregateSkillStatus([odIprfStatus, oeIprfStatus]);
  const odFrStatus: NormativeStatus = fnrApplied
    ? odFrEval.fr.status
    : "Não avaliado";
  const oeFrStatus: NormativeStatus = fnrApplied
    ? oeFrEval.fr.status
    : "Não avaliado";
  const odDiffStatus: NormativeStatus = fnrApplied
    ? odFrEval.diff.status
    : "Não avaliado";
  const oeDiffStatus: NormativeStatus = fnrApplied
    ? oeFrEval.diff.status
    : "Não avaliado";
  const frDiffMax = Math.max(odFrEval.diffValue, oeFrEval.diffValue);
  const frDiffStatus = aggregateSkillStatus([odDiffStatus, oeDiffStatus]);
  const frStatus = aggregateSkillStatus([
    odFrStatus,
    oeFrStatus,
    odDiffStatus,
    oeDiffStatus,
  ]);

  // PSI / SSI (D3: respect enabled flags; D6: respect mode label)
  const psiModeLabel = state.psi.mode === "ssi" ? "SSI" : "PSI";
  const psiOd0Pct = state.psi.od.db0 * 10;
  const psiOd10Pct = state.psi.od.dbMinus10 * 10;
  const psiOd15Pct = state.psi.od.dbMinus15 * 10;
  const psiOe0Pct = state.psi.oe.db0 * 10;
  const psiOe10Pct = state.psi.oe.dbMinus10 * 10;
  const psiOe15Pct = state.psi.oe.dbMinus15 * 10;

  const psiOd0Eval =
    psiApplied && state.psi.od.enabled0
      ? evaluatePsiSsi(0, state.psi.od.db0)
      : { status: "Não avaliado" as NormativeStatus, refText: "≥ 80%" };
  const psiOd10Eval =
    psiApplied && state.psi.od.enabledMinus10
      ? evaluatePsiSsi(-10, state.psi.od.dbMinus10)
      : { status: "Não avaliado" as NormativeStatus, refText: "≥ 70%" };
  const psiOd15Eval =
    psiApplied && state.psi.od.enabledMinus15
      ? evaluatePsiSsi(-15, state.psi.od.dbMinus15)
      : { status: "Não avaliado" as NormativeStatus, refText: "≥ 60%" };
  const psiOe0Eval =
    psiApplied && state.psi.oe.enabled0
      ? evaluatePsiSsi(0, state.psi.oe.db0)
      : { status: "Não avaliado" as NormativeStatus, refText: "≥ 80%" };
  const psiOe10Eval =
    psiApplied && state.psi.oe.enabledMinus10
      ? evaluatePsiSsi(-10, state.psi.oe.dbMinus10)
      : { status: "Não avaliado" as NormativeStatus, refText: "≥ 70%" };
  const psiOe15Eval =
    psiApplied && state.psi.oe.enabledMinus15
      ? evaluatePsiSsi(-15, state.psi.oe.dbMinus15)
      : { status: "Não avaliado" as NormativeStatus, refText: "≥ 60%" };

  // All three relations count toward figure-ground (specialist, 25/11/2026);
  // a relation switched off is "Não avaliado" and drops out of the aggregate.
  const psiStatus = aggregateSkillStatus([
    psiOd0Eval.status,
    psiOd10Eval.status,
    psiOd15Eval.status,
    psiOe0Eval.status,
    psiOe10Eval.status,
    psiOe15Eval.status,
  ]);
  const psiOdDetail = formatPsiEarDetail(psiApplied, state.psi.od);
  const psiOeDetail = formatPsiEarDetail(psiApplied, state.psi.oe);
  const psiRefText = formatPsiRefText(
    psiApplied,
    state.psi.od,
    state.psi.oe,
    psiOd0Eval.refText,
    psiOd10Eval.refText,
    psiOd15Eval.refText,
  );

  // 3. Processamento Temporal (D1: < 7 anos Não aplicável; D13: Humming enters Ordenação Temporal)
  const freqHummingPct = Math.round((state.temporal.freqHumming / 10) * 100);
  const freqPct = Math.round((state.temporal.freqNomeacao / 10) * 100);
  const durHummingPct = Math.round((state.temporal.durHumming / 10) * 100);
  const durPct = Math.round((state.temporal.durNomeacao / 10) * 100);
  const freqHummingNorm = temporalApplied
    ? evaluateTemporalAuditec("freqHumming", freqHummingPct, patientAge)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const freqNorm = temporalApplied
    ? evaluateTemporalAuditec("freqNomeacao", freqPct, patientAge)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const durHummingNorm = temporalApplied
    ? evaluateTemporalAuditec("durHumming", durHummingPct, patientAge)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const durNorm = temporalApplied
    ? evaluateTemporalAuditec("durNomeacao", durPct, patientAge)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const freqCombinedStatus = aggregateSkillStatus([
    freqHummingNorm.status,
    freqNorm.status,
  ]);
  const durCombinedStatus = aggregateSkillStatus([
    durHummingNorm.status,
    durNorm.status,
  ]);
  const temporalOrdStatus = aggregateSkillStatus([
    freqHummingNorm.status,
    freqNorm.status,
    durHummingNorm.status,
    durNorm.status,
  ]);
  const rgdtRaw = evaluateRgdt(state.temporal.rgdt);
  const rgdtEval = temporalApplied
    ? rgdtRaw
    : {
        media: rgdtRaw.media,
        status: "Não avaliado" as NormativeStatus,
        refText: "—",
      };

  // 4. Tarefas Dicóticas (TDD e SSW)
  const tddIntegOd = Math.max(0, 100 - state.tdd.integracao.odErrors * 2.5);
  const tddIntegOe = Math.max(0, 100 - state.tdd.integracao.oeErrors * 2.5);
  const tddSepOd = Math.max(0, 100 - state.tdd.separacao.odErrors * 5);
  const tddSepOe = Math.max(0, 100 - state.tdd.separacao.oeErrors * 5);
  const tddIntegOdEval = tddApplied
    ? evaluateTddIntegracao(patientAge, "OD", tddIntegOd)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const tddIntegOeEval = tddApplied
    ? evaluateTddIntegracao(patientAge, "OE", tddIntegOe)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const tddSepOdEval = tddApplied
    ? evaluateTddSeparacao(patientAge, "OD", tddSepOd)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const tddSepOeEval = tddApplied
    ? evaluateTddSeparacao(patientAge, "OE", tddSepOe)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const tddStatus = aggregateSkillStatus([
    tddIntegOdEval.status,
    tddIntegOeEval.status,
    tddSepOdEval.status,
    tddSepOeEval.status,
  ]);

  const { a, b, c, d, e, f, g, h } = state.ssw.errors;
  const dncTotal = a + h;
  const dcTotal = b + g;
  const ecTotal = c + f;
  const encTotal = d + e;
  const pctDnc = Math.max(0, 100 - dncTotal * 2.5);
  const sswDc = Math.max(0, 100 - dcTotal * 2.5);
  const sswEc = Math.max(0, 100 - ecTotal * 2.5);
  const pctEnc = Math.max(0, 100 - encTotal * 2.5);
  const sswDcEval = sswApplied
    ? evaluateSswQuantitativo(patientAge, "DC", sswDc)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const sswEcEval = sswApplied
    ? evaluateSswQuantitativo(patientAge, "EC", sswEc)
    : { status: "Não avaliado" as NormativeStatus, refText: "—" };
  const sswStatus = aggregateSkillStatus([sswDcEval.status, sswEcEval.status]);

  const sswAgeApplicable = Number.isFinite(patientAge) && patientAge >= 7;
  const efeitoOrdem = a + b + e + f - (c + d + g + h);
  const efeitoAuditivo = a + b + c + d - (e + f + g + h);
  const efeitoAuditivoNormal = efeitoAuditivo >= -4 && efeitoAuditivo <= 4;
  const efeitoOrdemNormal = efeitoOrdem >= -3 && efeitoOrdem <= 3;

  const efeitoAuditivoStatus: NormativeStatus = !sswApplied
    ? "Não avaliado"
    : !sswAgeApplicable
      ? "Não aplicável"
      : efeitoAuditivoNormal
        ? "Normal"
        : "Alterado";
  const efeitoOrdemStatus: NormativeStatus = !sswApplied
    ? "Não avaliado"
    : !sswAgeApplicable
      ? "Não aplicável"
      : efeitoOrdemNormal
        ? "Normal"
        : "Alterado";

  const tipoAEval = sswApplied
    ? evaluateSswTipoA(patientAge, state.ssw.errors)
    : {
        value: 0,
        status: "Não avaliado" as NormativeStatus,
        label: "Não avaliado",
        refText: "—",
      };

  const inversoesCount = Math.max(0, Math.round(state.ssw.inversoes ?? 0));
  const inversoesEval = sswApplied
    ? evaluateSswInversoes(patientAge, inversoesCount)
    : {
        status: "Não avaliado" as NormativeStatus,
        label: "Não avaliado",
        refText: "—",
      };

  const ordemLabel = !sswApplied
    ? "Não avaliado"
    : !sswAgeApplicable
      ? "Não aplicável"
      : efeitoOrdem > 3
        ? "A/B"
        : efeitoOrdem < -3
          ? "B/A"
          : "NS";
  const auditivoLabel = !sswApplied
    ? "Não avaliado"
    : !sswAgeApplicable
      ? "Não aplicável"
      : efeitoAuditivo > 4
        ? "A/B"
        : efeitoAuditivo < -4
          ? "B/A"
          : "NS";

  const qualitativeStatus = aggregateSkillStatus([
    efeitoAuditivoStatus,
    efeitoOrdemStatus,
    tipoAEval.status,
    inversoesEval.status,
  ]);

  const skills: AuditorySkillsSummary = {
    fechamentoAuditivo: frStatus,
    // SSW enters figure-ground as a dichotic task (specialist, 25/11/2026).
    figuraFundo: aggregateSkillStatus([
      psiStatus,
      sswDcEval.status,
      sswEcEval.status,
    ]),
    integracaoBinaural: aggregateSkillStatus([
      tddIntegOdEval.status,
      tddIntegOeEval.status,
    ]),
    separacaoBinaural: aggregateSkillStatus([
      tddSepOdEval.status,
      tddSepOeEval.status,
    ]),
    ordenacaoTemporal: aggregateSkillStatus([
      mnvNorm.status,
      mvNorm.status,
      freqHummingNorm.status,
      freqNorm.status,
      durHummingNorm.status,
      durNorm.status,
    ]),
    resolucaoTemporal: rgdtEval.status,
    localizacaoSonora: locNorm.status,
  };

  const conclusion = buildClinicalConclusion(skills);

  return {
    patientAge,
    bandinha: {
      applied: bandinhaApplied,
      locCount,
      missedDirections,
      locDisplay,
      locStatus: locNorm.status,
      locRefText: locNorm.refText,
      mvCount,
      mvStatus: mvNorm.status,
      mvRefText: mvNorm.refText,
      mnvCount,
      mnvStatus: mnvNorm.status,
      mnvRefText: mnvNorm.refText,
      overallStatus: bandinhaStatus,
    },
    falaNoRuido: {
      applied: fnrApplied,
      odIprf: state.falaNoRuido.od.iprfGravacao,
      odIprfStatus,
      odIprfRefText: fnrApplied ? odFrEval.iprf.refText : "—",
      oeIprf: state.falaNoRuido.oe.iprfGravacao,
      oeIprfStatus,
      iprfStatus,
      odFr,
      odStatus: odFrStatus,
      odDiff: odFrEval.diffValue,
      odDiffStatus,
      oeFr,
      oeStatus: oeFrStatus,
      oeDiff: oeFrEval.diffValue,
      oeDiffStatus,
      diffMax: frDiffMax,
      diffStatus: frDiffStatus,
      overallStatus: frStatus,
    },
    psi: {
      applied: psiApplied,
      mode: state.psi.mode,
      modeLabel: psiModeLabel,
      odDb0Pct: psiOd0Pct,
      odDb0Status: psiOd0Eval.status,
      odDb0RefText: psiOd0Eval.refText,
      odDb10Pct: psiOd10Pct,
      odDb10Status: psiOd10Eval.status,
      odDb10RefText: psiOd10Eval.refText,
      odDb15Pct: psiOd15Pct,
      odDb15Status: psiOd15Eval.status,
      odDb15RefText: psiOd15Eval.refText,
      oeDb0Pct: psiOe0Pct,
      oeDb0Status: psiOe0Eval.status,
      oeDb10Pct: psiOe10Pct,
      oeDb10Status: psiOe10Eval.status,
      oeDb15Pct: psiOe15Pct,
      oeDb15Status: psiOe15Eval.status,
      odDetail: psiOdDetail,
      oeDetail: psiOeDetail,
      refText: psiRefText,
      odPct: psiOd15Pct,
      odStatus: psiOd15Eval.status,
      oePct: psiOe15Pct,
      oeStatus: psiOe15Eval.status,
      overallStatus: psiStatus,
    },
    temporal: {
      applied: temporalApplied,
      rgdtMedia: rgdtEval.media,
      rgdtStatus: rgdtEval.status,
      rgdtRefText: rgdtEval.refText,
      freqHummingPct,
      freqHummingStatus: freqHummingNorm.status,
      freqHummingRefText: freqHummingNorm.refText,
      freqPct,
      freqStatus: freqNorm.status,
      freqRefText: freqNorm.refText,
      freqCombinedStatus,
      durHummingPct,
      durHummingStatus: durHummingNorm.status,
      durHummingRefText: durHummingNorm.refText,
      durPct,
      durStatus: durNorm.status,
      durRefText: durNorm.refText,
      durCombinedStatus,
      ordStatus: temporalOrdStatus,
    },
    tdd: {
      applied: tddApplied,
      integOd: tddIntegOd,
      integOdStatus: tddIntegOdEval.status,
      integOdRefText: tddIntegOdEval.refText,
      integOe: tddIntegOe,
      integOeStatus: tddIntegOeEval.status,
      integOeRefText: tddIntegOeEval.refText,
      sepOd: tddSepOd,
      sepOdStatus: tddSepOdEval.status,
      sepOdRefText: tddSepOdEval.refText,
      sepOe: tddSepOe,
      sepOeStatus: tddSepOeEval.status,
      sepOeRefText: tddSepOeEval.refText,
      overallStatus: tddStatus,
    },
    ssw: {
      applied: sswApplied,
      dncTotal,
      dcTotal,
      ecTotal,
      encTotal,
      pctDnc,
      pctEnc,
      dc: sswDc,
      dcStatus: sswDcEval.status,
      dcRefText: sswDcEval.refText,
      ec: sswEc,
      ecStatus: sswEcEval.status,
      ecRefText: sswEcEval.refText,
      overallStatus: sswStatus,
      efeitoAuditivo,
      efeitoAuditivoNormal,
      efeitoAuditivoStatus,
      efeitoOrdem,
      efeitoOrdemNormal,
      efeitoOrdemStatus,
      ordemLabel,
      auditivoLabel,
      qualitativeStatus,
      tipoA: tipoAEval.value,
      tipoAStatus: tipoAEval.status,
      tipoALabel: tipoAEval.label,
      tipoARefText: tipoAEval.refText,
      inversoes: inversoesCount,
      inversoesStatus: inversoesEval.status,
      inversoesLabel: inversoesEval.label,
      inversoesRefText: inversoesEval.refText,
    },
    skills,
    conclusion,
  };
}

export type EvaluationSummary = ReturnType<typeof computeEvaluationSummary>;
