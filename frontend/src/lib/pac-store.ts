import { useState, useEffect } from "react";
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
import { defaultPacState } from "@/lib/mock-pac-default";

export const PAC_STORAGE_KEY = "autoproc.pac_state.v1";

export interface ClinicianProfile {
  name: string;
  shortName: string;
  title: string;
  crfa: string;
  clinicName: string;
  email: string;
  phone: string;
  hasSignature: boolean;
  hasClinicLogo: boolean;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  ageLabel: string;
  birthDate: string;
  referral: string;
  lastEvaluationDate: string;
  totalExams: number;
  clinicalNotes: string;
}

export interface AuditorySkillsSummary {
  fechamentoAuditivo: "Normal" | "Alterado";
  figuraFundo: "Normal" | "Alterado";
  integracaoBinaural: "Normal" | "Alterado";
  separacaoBinaural: "Normal" | "Alterado";
  ordenacaoTemporal: "Normal" | "Alterado";
  resolucaoTemporal: "Normal" | "Alterado";
  localizacaoSonora: "Normal" | "Alterado";
}

export interface PatientInfo {
  name: string;
  age: string;
  birthDate: string;
  date: string;
  examiner: string;
  referral: string;
  selectedTests: string[];
}

export interface PacState {
  clinician: ClinicianProfile;
  patients: PatientRecord[];
  evaluations: EvaluationRecord[];
  activePatientId: string;
  activeEvaluationId: string;
  sidebarOpen: boolean;
  patient: PatientInfo;
  bandinha: {
    localizacao: {
      direita: boolean;
      esquerda: boolean;
      acima: boolean;
      frente: boolean;
      atras: boolean;
    };
    memoriaNaoVerbal: [boolean, boolean, boolean];
    memoriaVerbal: [boolean, boolean, boolean];
    observacoes: string;
  };
  falaNoRuido: {
    od: {
      intensidade: number;
      iprfGravacao: number;
      erros: number[];
    };
    oe: {
      intensidade: number;
      iprfGravacao: number;
      erros: number[];
    };
    observacoes: string;
  };
  tdd: {
    integracao: {
      odIntensidade: number;
      odErrors: number;
      oeIntensidade: number;
      oeErrors: number;
    };
    separacao: {
      odIntensidade: number;
      odErrors: number;
      oeIntensidade: number;
      oeErrors: number;
    };
    observacoes: string;
  };
  temporal: {
    freqHumming: number;
    freqNomeacao: number;
    durHumming: number;
    durNomeacao: number;
    freqHummingGrid: boolean[];
    freqNomeacaoGrid: boolean[];
    durHummingGrid: boolean[];
    durNomeacaoGrid: boolean[];
    rgdt: {
      500: number;
      1000: number;
      2000: number;
      4000: number;
    };
    observacoes: string;
  };
  psi: {
    mode: "psi" | "ssi";
    od: {
      db0: number;
      dbMinus10: number;
      dbMinus15: number;
      enabled0: boolean;
      enabledMinus10: boolean;
      enabledMinus15: boolean;
    };
    oe: {
      db0: number;
      dbMinus10: number;
      dbMinus15: number;
      enabled0: boolean;
      enabledMinus10: boolean;
      enabledMinus15: boolean;
    };
    observacoes: string;
  };
  ssw: {
    errors: {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
      f: number;
      g: number;
      h: number;
    };
    observacoes: string;
  };
  laudo: {
    comportamento: string;
    conclusao: string[];
    recomendacoes: string[];
  };
}

export interface EvaluationSnapshot {
  patient: PatientInfo;
  bandinha: PacState["bandinha"];
  falaNoRuido: PacState["falaNoRuido"];
  tdd: PacState["tdd"];
  temporal: PacState["temporal"];
  psi: PacState["psi"];
  ssw: PacState["ssw"];
  laudo: PacState["laudo"];
}

export interface EvaluationRecord {
  id: string;
  patientId: string;
  patientName: string;
  ageLabel: string;
  date: string;
  status: "finalizada" | "rascunho";
  rectified?: boolean;
  examiner: string;
  referral: string;
  skills: AuditorySkillsSummary;
  snapshot?: EvaluationSnapshot;
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

/**
 * Extracts a deep copy of protocol inputs, patient exam metadata, and laudo notes.
 */
export function extractSnapshot(state: PacState): EvaluationSnapshot {
  return cloneValue({
    patient: state.patient,
    bandinha: state.bandinha,
    falaNoRuido: state.falaNoRuido,
    tdd: state.tdd,
    temporal: state.temporal,
    psi: state.psi,
    ssw: state.ssw,
    laudo: state.laudo,
  });
}

/**
 * Returns cloned protocol/laudo fields from an evaluation snapshot when available.
 */
export function restoreSnapshotFields(
  ev: EvaluationRecord,
): Partial<EvaluationSnapshot> {
  if (!ev.snapshot) return {};
  const snap = cloneValue(ev.snapshot);
  return {
    bandinha: snap.bandinha,
    falaNoRuido: snap.falaNoRuido,
    tdd: snap.tdd,
    temporal: snap.temporal,
    psi: snap.psi,
    ssw: snap.ssw,
    laudo: snap.laudo,
  };
}

export type ProtocolSummaryInput = Pick<
  PacState,
  "patient" | "bandinha" | "falaNoRuido" | "tdd" | "temporal" | "psi" | "ssw"
>;

/**
 * Computes numeric scores, normative statuses, and the 7 auditory skills summary.
 */
export function computeEvaluationSummary(state: ProtocolSummaryInput) {
  const patientAge = parsePatientAge(
    state.patient.age,
    state.patient.birthDate,
    state.patient.date,
  );

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

  const odFr = Math.max(0, 100 - state.falaNoRuido.od.erros.length * 4);
  const oeFr = Math.max(0, 100 - state.falaNoRuido.oe.erros.length * 4);
  const odFrEval = evaluateFalaNoRuido(state.falaNoRuido.od.iprfGravacao, odFr);
  const oeFrEval = evaluateFalaNoRuido(state.falaNoRuido.oe.iprfGravacao, oeFr);
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

  const psiOdPct = state.psi.od.dbMinus15 * 10;
  const psiOePct = state.psi.oe.dbMinus15 * 10;
  const psiOdEval = evaluatePsiSsi(-15, state.psi.od.dbMinus15);
  const psiOeEval = evaluatePsiSsi(-15, state.psi.oe.dbMinus15);
  const psiStatus: "Normal" | "Alterado" =
    psiOdEval.status === "Normal" && psiOeEval.status === "Normal"
      ? "Normal"
      : "Alterado";

  const freqPct = Math.round((state.temporal.freqNomeacao / 10) * 100);
  const durPct = Math.round((state.temporal.durNomeacao / 10) * 100);
  const freqNorm = evaluateTemporalAuditec("freqNomeacao", freqPct);
  const durNorm = evaluateTemporalAuditec("durNomeacao", durPct);
  const rgdtEval = evaluateRgdt(state.temporal.rgdt);

  const tddIntegOd = Math.max(0, 100 - state.tdd.integracao.odErrors * 2.5);
  const tddIntegOe = Math.max(0, 100 - state.tdd.integracao.oeErrors * 2.5);
  const tddSepOd = Math.max(0, 100 - state.tdd.separacao.odErrors * 5);
  const tddSepOe = Math.max(0, 100 - state.tdd.separacao.oeErrors * 5);
  const tddIntegOdEval = evaluateTddIntegracao(patientAge, "OD", tddIntegOd);
  const tddIntegOeEval = evaluateTddIntegracao(patientAge, "OE", tddIntegOe);
  const tddSepOdEval = evaluateTddSeparacao(patientAge, "OD", tddSepOd);
  const tddSepOeEval = evaluateTddSeparacao(patientAge, "OE", tddSepOe);

  const sswDc = Math.max(
    0,
    100 - (state.ssw.errors.b + state.ssw.errors.g) * 2.5,
  );
  const sswEc = Math.max(
    0,
    100 - (state.ssw.errors.c + state.ssw.errors.f) * 2.5,
  );
  const sswDcEval = evaluateSswQuantitativo(patientAge, "DC", sswDc);
  const sswEcEval = evaluateSswQuantitativo(patientAge, "EC", sswEc);
  const sswStatus: "Normal" | "Alterado" =
    sswDcEval.status === "Normal" && sswEcEval.status === "Normal"
      ? "Normal"
      : "Alterado";

  const { a, b, c, d, e, f, g, h } = state.ssw.errors;
  const efeitoOrdem = a + b + e + f - (c + d + g + h);
  const efeitoAuditivo = a + b + c + d - (e + f + g + h);
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
    bandinha: {
      locCount,
      locStatus: locNorm.status,
      mvCount,
      mvStatus: mvNorm.status,
      mnvCount,
      mnvStatus: mnvNorm.status,
    },
    falaNoRuido: {
      odFr,
      odStatus: odFrEval.fr.status,
      oeFr,
      oeStatus: oeFrEval.fr.status,
      diffMax: frDiffMax,
      diffStatus: frDiffStatus,
    },
    psi: {
      odPct: psiOdPct,
      odStatus: psiOdEval.status,
      oePct: psiOePct,
      oeStatus: psiOeEval.status,
    },
    temporal: {
      rgdtMedia: rgdtEval.media,
      rgdtStatus: rgdtEval.status,
      freqPct,
      freqStatus: freqNorm.status,
      durPct,
      durStatus: durNorm.status,
    },
    tdd: {
      integOd: tddIntegOd,
      integOdStatus: tddIntegOdEval.status,
      integOe: tddIntegOe,
      integOeStatus: tddIntegOeEval.status,
      sepOd: tddSepOd,
      sepOdStatus: tddSepOdEval.status,
      sepOe: tddSepOe,
      sepOeStatus: tddSepOeEval.status,
    },
    ssw: {
      dc: sswDc,
      dcStatus: sswDcEval.status,
      ec: sswEc,
      ecStatus: sswEcEval.status,
      ordemLabel: efeitoOrdem > 3 ? "A/B" : efeitoOrdem < -3 ? "B/A" : "NS",
      auditivoLabel:
        efeitoAuditivo > 4 ? "A/B" : efeitoAuditivo < -4 ? "B/A" : "NS",
      tipoA,
      tipoALabel: `${tipoA} (${tipoA <= 3 ? "NS" : "Tipo A"})`,
    },
    skills,
  };
}

/**
 * Computes all 7 auditory skills statuses from protocol inputs using the normative engine.
 */
export function computeAuditorySkills(
  state: ProtocolSummaryInput,
): AuditorySkillsSummary {
  return computeEvaluationSummary(state).skills;
}

/**
 * Recomputes totalExams and optional lastEvaluationDate for a patient from evaluations.
 */
export function updatePatientExamStats(
  patients: PatientRecord[],
  evaluations: EvaluationRecord[],
  patientId: string,
): PatientRecord[] {
  const patientEvals = evaluations.filter((ev) => ev.patientId === patientId);
  return patients.map((p) => {
    if (p.id !== patientId) return p;
    return {
      ...p,
      totalExams: patientEvals.length,
      lastEvaluationDate: patientEvals[0]?.date ?? "—",
    };
  });
}

/**
 * Promotes the active draft evaluation (or creates a finalized record) and updates patient stats.
 */
export function finalizeEvaluationState(
  prev: PacState,
  comportamento: string,
): PacState {
  const nextWithLaudo: PacState = {
    ...prev,
    laudo: { ...prev.laudo, comportamento },
  };
  const skills = computeAuditorySkills(nextWithLaudo);
  const snapshot = extractSnapshot(nextWithLaudo);
  const existingDraft = prev.evaluations.find(
    (ev) =>
      ev.id === prev.activeEvaluationId &&
      ev.patientId === prev.activePatientId &&
      ev.status === "rascunho",
  );
  const targetEvalId = existingDraft?.id ?? `eval-${Date.now()}`;
  const baseFields = {
    patientName: prev.patient.name,
    ageLabel: prev.patient.age,
    date: prev.patient.date,
    status: "finalizada" as const,
    examiner: prev.clinician.shortName,
    referral: prev.patient.referral,
    skills,
    snapshot,
  };
  const nextEvaluations: EvaluationRecord[] = existingDraft
    ? prev.evaluations.map((ev) =>
        ev.id === targetEvalId ? { ...ev, ...baseFields } : ev,
      )
    : [
        { id: targetEvalId, patientId: prev.activePatientId, ...baseFields },
        ...prev.evaluations,
      ];

  return {
    ...nextWithLaudo,
    activeEvaluationId: targetEvalId,
    patients: updatePatientExamStats(
      prev.patients,
      nextEvaluations,
      prev.activePatientId,
    ),
    evaluations: nextEvaluations,
  };
}

/**
 * Marks the active finalized evaluation as rectified and opens a new draft with its snapshot.
 */
export function rectifyEvaluationState(
  prev: PacState,
  comportamento: string,
): PacState {
  const nextWithLaudo: PacState = {
    ...prev,
    laudo: { ...prev.laudo, comportamento },
  };
  const newDraftId = `eval-${Date.now()}`;
  const newDraft: EvaluationRecord = {
    id: newDraftId,
    patientId: prev.activePatientId,
    patientName: prev.patient.name,
    ageLabel: prev.patient.age,
    date: prev.patient.date,
    status: "rascunho",
    examiner: prev.clinician.shortName,
    referral: prev.patient.referral,
    skills: computeAuditorySkills(nextWithLaudo),
    snapshot: extractSnapshot(nextWithLaudo),
  };
  const nextEvaluations = [
    newDraft,
    ...prev.evaluations.map((ev) =>
      ev.id === prev.activeEvaluationId && ev.status === "finalizada"
        ? { ...ev, rectified: true }
        : ev,
    ),
  ];

  return {
    ...nextWithLaudo,
    sidebarOpen: true,
    activeEvaluationId: newDraftId,
    patients: updatePatientExamStats(
      prev.patients,
      nextEvaluations,
      prev.activePatientId,
    ),
    evaluations: nextEvaluations,
  };
}

function loadInitialState(): PacState {
  const base = cloneValue(defaultPacState);
  if (typeof localStorage === "undefined") {
    return base;
  }
  try {
    const raw = localStorage.getItem(PAC_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<PacState> | null;
    if (!parsed || typeof parsed !== "object") return base;

    return {
      ...base,
      ...parsed,
      clinician: { ...base.clinician, ...parsed.clinician },
      patients: Array.isArray(parsed.patients)
        ? parsed.patients
        : base.patients,
      evaluations: Array.isArray(parsed.evaluations)
        ? parsed.evaluations
        : base.evaluations,
      patient: { ...base.patient, ...parsed.patient },
      bandinha: {
        ...base.bandinha,
        ...parsed.bandinha,
        localizacao: {
          ...base.bandinha.localizacao,
          ...parsed.bandinha?.localizacao,
        },
      },
      falaNoRuido: {
        ...base.falaNoRuido,
        ...parsed.falaNoRuido,
        od: { ...base.falaNoRuido.od, ...parsed.falaNoRuido?.od },
        oe: { ...base.falaNoRuido.oe, ...parsed.falaNoRuido?.oe },
      },
      tdd: {
        ...base.tdd,
        ...parsed.tdd,
        integracao: {
          ...base.tdd.integracao,
          ...parsed.tdd?.integracao,
        },
        separacao: {
          ...base.tdd.separacao,
          ...parsed.tdd?.separacao,
        },
      },
      temporal: {
        ...base.temporal,
        ...parsed.temporal,
        rgdt: { ...base.temporal.rgdt, ...parsed.temporal?.rgdt },
      },
      psi: {
        ...base.psi,
        ...parsed.psi,
        od: { ...base.psi.od, ...parsed.psi?.od },
        oe: { ...base.psi.oe, ...parsed.psi?.oe },
      },
      ssw: {
        ...base.ssw,
        ...parsed.ssw,
        errors: { ...base.ssw.errors, ...parsed.ssw?.errors },
      },
      laudo: {
        ...base.laudo,
        ...parsed.laudo,
      },
    };
  } catch {
    return base;
  }
}

function saveStateToStorage(state: PacState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PAC_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

function syncActiveDraft(prev: PacState, next: PacState): PacState {
  const protocolChanged =
    next.bandinha !== prev.bandinha ||
    next.falaNoRuido !== prev.falaNoRuido ||
    next.tdd !== prev.tdd ||
    next.temporal !== prev.temporal ||
    next.psi !== prev.psi ||
    next.ssw !== prev.ssw ||
    next.laudo !== prev.laudo;

  if (!protocolChanged) return next;

  const activeDraft = next.evaluations.find(
    (ev) =>
      ev.id === next.activeEvaluationId &&
      ev.status === "rascunho" &&
      ev.patientId === next.activePatientId,
  );
  if (!activeDraft) return next;

  const updatedSnapshot = extractSnapshot(next);
  const updatedSkills = computeAuditorySkills(next);

  return {
    ...next,
    evaluations: next.evaluations.map((ev) =>
      ev.id === activeDraft.id
        ? {
            ...ev,
            date: next.patient.date,
            ageLabel: next.patient.age,
            referral: next.patient.referral,
            skills: updatedSkills,
            snapshot: updatedSnapshot,
          }
        : ev,
    ),
  };
}

let currentState: PacState = loadInitialState();
const listeners = new Set<(state: PacState) => void>();

export const pacStore = {
  getState(): PacState {
    return currentState;
  },
  setState(updater: Partial<PacState> | ((prev: PacState) => PacState)): void {
    const prevState = currentState;
    const rawNext =
      typeof updater === "function"
        ? updater(prevState)
        : { ...prevState, ...updater };
    currentState = syncActiveDraft(prevState, rawNext);
    saveStateToStorage(currentState);
    listeners.forEach((listener) => listener(currentState));
  },
  subscribe(listener: (state: PacState) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  resetState(): void {
    currentState = cloneValue(defaultPacState);
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(PAC_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    listeners.forEach((listener) => listener(currentState));
  },
};

export function usePacStore(): [PacState, typeof pacStore.setState] {
  const [state, setState] = useState<PacState>(() => pacStore.getState());

  useEffect(() => {
    return pacStore.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  return [state, pacStore.setState];
}
