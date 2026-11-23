import { useState, useEffect } from "react";
import { computeEvaluationSummary } from "@/lib/evaluation-summary";
import { defaultPacState } from "@/lib/mock-pac-default";

export { computeEvaluationSummary };

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
