import {
  evaluateBandinhaLocalizacao,
  evaluateBandinhaMemoria,
  evaluateFalaNoRuido,
  evaluatePsiSsi,
  evaluateRgdt,
  evaluateSswQuantitativo,
  evaluateTddIntegracao,
  evaluateTddSeparacao,
  evaluateTemporalAuditec,
  parsePatientAge,
} from "@/lib/normative-engine";
import type {
  AuditorySkillsSummary,
  ProtocolSummaryInput,
} from "@/lib/pac-store";

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

  // 1. Testes Dióticos (Bandinha)
  const locCount = Object.values(state.bandinha.localizacao).filter(
    Boolean,
  ).length;
  const mnvCount = state.bandinha.memoriaNaoVerbal.filter(Boolean).length;
  const mvCount = state.bandinha.memoriaVerbal.filter(Boolean).length;
  const locNorm = evaluateBandinhaLocalizacao(
    locCount,
    state.bandinha.localizacao.direita,
    state.bandinha.localizacao.esquerda,
  );
  const mnvNorm = evaluateBandinhaMemoria(mnvCount);
  const mvNorm = evaluateBandinhaMemoria(mvCount);
  const bandinhaStatus: "Normal" | "Alterado" =
    locNorm.status === "Normal" &&
    mnvNorm.status === "Normal" &&
    mvNorm.status === "Normal"
      ? "Normal"
      : "Alterado";

  // 2. Tarefas Monoaurais de Baixa Redundância (Fala no Ruído e PSI/SSI)
  const odFr = Math.max(0, 100 - state.falaNoRuido.od.erros.length * 4);
  const oeFr = Math.max(0, 100 - state.falaNoRuido.oe.erros.length * 4);
  const odFrEval = evaluateFalaNoRuido(state.falaNoRuido.od.iprfGravacao, odFr);
  const oeFrEval = evaluateFalaNoRuido(state.falaNoRuido.oe.iprfGravacao, oeFr);
  const iprfStatus: "Normal" | "Alterado" =
    odFrEval.iprf.status === "Normal" && oeFrEval.iprf.status === "Normal"
      ? "Normal"
      : "Alterado";
  const frDiffMax = Math.max(odFrEval.diffValue, oeFrEval.diffValue);
  const frDiffStatus: "Normal" | "Alterado" =
    odFrEval.diff.status === "Normal" && oeFrEval.diff.status === "Normal"
      ? "Normal"
      : "Alterado";
  const frStatus: "Normal" | "Alterado" =
    odFrEval.fr.status === "Normal" &&
    oeFrEval.fr.status === "Normal" &&
    frDiffStatus === "Normal"
      ? "Normal"
      : "Alterado";

  const psiOd0Pct = state.psi.od.db0 * 10;
  const psiOd10Pct = state.psi.od.dbMinus10 * 10;
  const psiOd15Pct = state.psi.od.dbMinus15 * 10;
  const psiOe0Pct = state.psi.oe.db0 * 10;
  const psiOe10Pct = state.psi.oe.dbMinus10 * 10;
  const psiOe15Pct = state.psi.oe.dbMinus15 * 10;
  const psiOd0Eval = evaluatePsiSsi(0, state.psi.od.db0);
  const psiOd10Eval = evaluatePsiSsi(-10, state.psi.od.dbMinus10);
  const psiOd15Eval = evaluatePsiSsi(-15, state.psi.od.dbMinus15);
  const psiOe0Eval = evaluatePsiSsi(0, state.psi.oe.db0);
  const psiOe10Eval = evaluatePsiSsi(-10, state.psi.oe.dbMinus10);
  const psiOe15Eval = evaluatePsiSsi(-15, state.psi.oe.dbMinus15);
  const psiStatus: "Normal" | "Alterado" =
    psiOd15Eval.status === "Normal" && psiOe15Eval.status === "Normal"
      ? "Normal"
      : "Alterado";

  // 3. Processamento Temporal
  const freqHummingPct = Math.round((state.temporal.freqHumming / 10) * 100);
  const freqPct = Math.round((state.temporal.freqNomeacao / 10) * 100);
  const durHummingPct = Math.round((state.temporal.durHumming / 10) * 100);
  const durPct = Math.round((state.temporal.durNomeacao / 10) * 100);
  const freqHummingNorm = evaluateTemporalAuditec(
    "freqHumming",
    freqHummingPct,
  );
  const freqNorm = evaluateTemporalAuditec("freqNomeacao", freqPct);
  const durHummingNorm = evaluateTemporalAuditec("durHumming", durHummingPct);
  const durNorm = evaluateTemporalAuditec("durNomeacao", durPct);
  const temporalOrdStatus: "Normal" | "Alterado" =
    freqNorm.status === "Normal" && durNorm.status === "Normal"
      ? "Normal"
      : "Alterado";
  const rgdtEval = evaluateRgdt(state.temporal.rgdt);

  // 4. Tarefas Dicóticas (TDD e SSW)
  const tddIntegOd = Math.max(0, 100 - state.tdd.integracao.odErrors * 2.5);
  const tddIntegOe = Math.max(0, 100 - state.tdd.integracao.oeErrors * 2.5);
  const tddSepOd = Math.max(0, 100 - state.tdd.separacao.odErrors * 5);
  const tddSepOe = Math.max(0, 100 - state.tdd.separacao.oeErrors * 5);
  const tddIntegOdEval = evaluateTddIntegracao(patientAge, "OD", tddIntegOd);
  const tddIntegOeEval = evaluateTddIntegracao(patientAge, "OE", tddIntegOe);
  const tddSepOdEval = evaluateTddSeparacao(patientAge, "OD", tddSepOd);
  const tddSepOeEval = evaluateTddSeparacao(patientAge, "OE", tddSepOe);
  const tddStatus: "Normal" | "Alterado" =
    tddIntegOdEval.status === "Normal" &&
    tddIntegOeEval.status === "Normal" &&
    tddSepOdEval.status === "Normal" &&
    tddSepOeEval.status === "Normal"
      ? "Normal"
      : "Alterado";

  const { a, b, c, d, e, f, g, h } = state.ssw.errors;
  const dncTotal = a + h;
  const dcTotal = b + g;
  const ecTotal = c + f;
  const encTotal = d + e;
  const pctDnc = Math.max(0, 100 - dncTotal * 2.5);
  const sswDc = Math.max(0, 100 - dcTotal * 2.5);
  const sswEc = Math.max(0, 100 - ecTotal * 2.5);
  const pctEnc = Math.max(0, 100 - encTotal * 2.5);
  const sswDcEval = evaluateSswQuantitativo(patientAge, "DC", sswDc);
  const sswEcEval = evaluateSswQuantitativo(patientAge, "EC", sswEc);
  const sswStatus: "Normal" | "Alterado" =
    sswDcEval.status === "Normal" && sswEcEval.status === "Normal"
      ? "Normal"
      : "Alterado";

  const efeitoOrdem = a + b + e + f - (c + d + g + h);
  const efeitoAuditivo = a + b + c + d - (e + f + g + h);
  const efeitoAuditivoNormal = efeitoAuditivo >= -4 && efeitoAuditivo <= 4;
  const efeitoOrdemNormal = efeitoOrdem >= -3 && efeitoOrdem <= 3;
  const tipoA = Math.min(b, f);

  const skills: AuditorySkillsSummary = {
    fechamentoAuditivo: frStatus,
    figuraFundo:
      psiStatus === "Normal" && sswStatus === "Normal" ? "Normal" : "Alterado",
    integracaoBinaural:
      tddIntegOdEval.status === "Normal" && tddIntegOeEval.status === "Normal"
        ? "Normal"
        : "Alterado",
    separacaoBinaural:
      tddSepOdEval.status === "Normal" && tddSepOeEval.status === "Normal"
        ? "Normal"
        : "Alterado",
    ordenacaoTemporal:
      mnvNorm.status === "Normal" &&
      mvNorm.status === "Normal" &&
      freqNorm.status === "Normal" &&
      durNorm.status === "Normal"
        ? "Normal"
        : "Alterado",
    resolucaoTemporal: rgdtEval.status,
    localizacaoSonora: locNorm.status,
  };

  return {
    patientAge,
    bandinha: {
      locCount,
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
      odIprf: state.falaNoRuido.od.iprfGravacao,
      odIprfStatus: odFrEval.iprf.status,
      odIprfRefText: odFrEval.iprf.refText,
      oeIprf: state.falaNoRuido.oe.iprfGravacao,
      oeIprfStatus: oeFrEval.iprf.status,
      iprfStatus,
      odFr,
      odStatus: odFrEval.fr.status,
      odDiff: odFrEval.diffValue,
      odDiffStatus: odFrEval.diff.status,
      oeFr,
      oeStatus: oeFrEval.fr.status,
      oeDiff: oeFrEval.diffValue,
      oeDiffStatus: oeFrEval.diff.status,
      diffMax: frDiffMax,
      diffStatus: frDiffStatus,
      overallStatus: frStatus,
    },
    psi: {
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
      odPct: psiOd15Pct,
      odStatus: psiOd15Eval.status,
      oePct: psiOe15Pct,
      oeStatus: psiOe15Eval.status,
      overallStatus: psiStatus,
    },
    temporal: {
      rgdtMedia: rgdtEval.media,
      rgdtStatus: rgdtEval.status,
      rgdtRefText: rgdtEval.refText,
      freqHummingPct,
      freqHummingStatus: freqHummingNorm.status,
      freqHummingRefText: freqHummingNorm.refText,
      freqPct,
      freqStatus: freqNorm.status,
      freqRefText: freqNorm.refText,
      durHummingPct,
      durHummingStatus: durHummingNorm.status,
      durHummingRefText: durHummingNorm.refText,
      durPct,
      durStatus: durNorm.status,
      durRefText: durNorm.refText,
      ordStatus: temporalOrdStatus,
    },
    tdd: {
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
      efeitoOrdem,
      efeitoOrdemNormal,
      ordemLabel: efeitoOrdem > 3 ? "A/B" : efeitoOrdem < -3 ? "B/A" : "NS",
      auditivoLabel:
        efeitoAuditivo > 4 ? "A/B" : efeitoAuditivo < -4 ? "B/A" : "NS",
      qualitativeStatus: (efeitoAuditivoNormal && efeitoOrdemNormal
        ? "Normal"
        : "Alterado") as "Normal" | "Alterado",
      tipoA,
      tipoALabel: `${tipoA} (${tipoA <= 3 ? "NS" : "Tipo A"})`,
    },
    skills,
  };
}

export type EvaluationSummary = ReturnType<typeof computeEvaluationSummary>;
