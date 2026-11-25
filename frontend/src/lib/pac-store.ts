import { useState, useEffect } from "react";
import {
  ALL_PROTOCOL_IDS,
  computeEvaluationSummary,
} from "@/lib/evaluation-summary";
import type { ClinicLogo } from "@/lib/clinic-logo";
import { parseDateString, type NormativeStatus } from "@/lib/normative-engine";
import {
  DEMO_PATIENT_IDS,
  createCleanProtocolState,
  defaultPacState,
} from "@/lib/mock-pac-default";
import { migratePacState, PAC_SCHEMA_VERSION } from "@/lib/pac-migration";

export { computeEvaluationSummary, migratePacState, PAC_SCHEMA_VERSION };

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
  /** Printed in the report footer. */
  clinicAddress?: string;
  /** Printed in the report header when `hasClinicLogo` is on. */
  clinicLogo?: ClinicLogo;
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
  fechamentoAuditivo: NormativeStatus;
  figuraFundo: NormativeStatus;
  integracaoBinaural: NormativeStatus;
  separacaoBinaural: NormativeStatus;
  ordenacaoTemporal: NormativeStatus;
  resolucaoTemporal: NormativeStatus;
  localizacaoSonora: NormativeStatus;
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
  schemaVersion?: number;
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
    inversoes: number;
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
 * Returns cloned protocol/laudo fields from an evaluation snapshot. An
 * evaluation saved without a snapshot (legacy/demo data) yields clean protocol
 * fields, never whatever the live store happens to hold for another patient.
 */
export function restoreSnapshotFields(
  ev: EvaluationRecord,
): Partial<EvaluationSnapshot> {
  if (!ev.snapshot) return createCleanProtocolState();
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
 * The raw answers that belong to one saved evaluation. Without a snapshot there
 * are no raw answers: every protocol is reported as not applied instead of
 * borrowing the live store's values.
 */
export function getEvaluationData(
  ev: EvaluationRecord,
  store: PacState,
): EvaluationSnapshot {
  if (ev.snapshot) return cloneValue(ev.snapshot);
  const patient = store.patients.find((p) => p.id === ev.patientId);
  return {
    ...createCleanProtocolState(),
    patient: {
      name: ev.patientName,
      age: ev.ageLabel,
      birthDate: patient?.birthDate ?? "",
      date: ev.date,
      examiner: ev.examiner,
      referral: ev.referral,
      selectedTests: [],
    },
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
  // Latest by calendar date, not by array position.
  const latest = patientEvals
    .map((ev) => ({ date: ev.date, time: parseDateString(ev.date)?.getTime() }))
    .filter((x): x is { date: string; time: number } => x.time !== undefined)
    .sort((x, y) => y.time - x.time)[0];
  return patients.map((p) => {
    if (p.id !== patientId) return p;
    return {
      ...p,
      totalExams: patientEvals.length,
      lastEvaluationDate: latest?.date ?? "—",
    };
  });
}

/**
 * Deletes an evaluation ONLY if it is a draft ("rascunho").
 * Finalized evaluations are immutable per CRFa rules and cannot be deleted.
 */
export function deleteEvaluationState(
  prev: PacState,
  evaluationId: string,
): PacState {
  const target = prev.evaluations.find((ev) => ev.id === evaluationId);
  if (!target || target.status !== "rascunho") {
    return prev;
  }
  const nextEvaluations = prev.evaluations.filter(
    (ev) => ev.id !== evaluationId,
  );
  return {
    ...prev,
    activeEvaluationId:
      prev.activeEvaluationId === evaluationId ? "" : prev.activeEvaluationId,
    evaluations: nextEvaluations,
    patients: updatePatientExamStats(
      prev.patients,
      nextEvaluations,
      target.patientId,
    ),
  };
}

/**
 * Removes ONLY the seeded demo patients (from mock-pac-default.ts) and their evaluations,
 * preserving all user-created patients and evaluations (D11).
 */
export function removeDemoPatientsState(prev: PacState): PacState {
  const demoSet = new Set(DEMO_PATIENT_IDS);
  const nextPatients = prev.patients.filter((p) => !demoSet.has(p.id));
  const nextEvaluations = prev.evaluations.filter(
    (ev) => !demoSet.has(ev.patientId),
  );
  const activePatientRemoved = demoSet.has(prev.activePatientId);
  const nextActivePatient = activePatientRemoved
    ? nextPatients[0]
    : nextPatients.find((p) => p.id === prev.activePatientId);

  const nextActiveEvalStillExists = nextEvaluations.some(
    (ev) => ev.id === prev.activeEvaluationId,
  );

  const cleanProtocols = activePatientRemoved
    ? createCleanProtocolState()
    : undefined;

  return {
    ...prev,
    ...(cleanProtocols ?? {}),
    patients: nextPatients,
    evaluations: nextEvaluations,
    activePatientId: nextActivePatient?.id ?? "",
    activeEvaluationId: nextActiveEvalStillExists
      ? prev.activeEvaluationId
      : "",
    patient: activePatientRemoved
      ? {
          ...prev.patient,
          name: nextActivePatient?.name ?? "",
          age: nextActivePatient?.ageLabel ?? "",
          birthDate: nextActivePatient?.birthDate ?? "",
          referral: nextActivePatient?.referral ?? "",
          selectedTests: [...ALL_PROTOCOL_IDS],
        }
      : prev.patient,
  };
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

function loadStateFromRaw(raw: string | null): PacState {
  if (!raw) {
    return {
      ...cloneValue(defaultPacState),
      schemaVersion: PAC_SCHEMA_VERSION,
    };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return migratePacState(parsed);
  } catch {
    return {
      ...cloneValue(defaultPacState),
      schemaVersion: PAC_SCHEMA_VERSION,
    };
  }
}

function loadInitialState(): PacState {
  if (typeof localStorage === "undefined") {
    return {
      ...cloneValue(defaultPacState),
      schemaVersion: PAC_SCHEMA_VERSION,
    };
  }
  try {
    const raw = localStorage.getItem(PAC_STORAGE_KEY);
    return loadStateFromRaw(raw);
  } catch {
    return {
      ...cloneValue(defaultPacState),
      schemaVersion: PAC_SCHEMA_VERSION,
    };
  }
}

function saveStateToStorage(state: PacState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      PAC_STORAGE_KEY,
      JSON.stringify({ ...state, schemaVersion: PAC_SCHEMA_VERSION }),
    );
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

export interface PacStoreInstance {
  getState: () => PacState;
  setState: (
    updater: Partial<PacState> | ((prev: PacState) => PacState),
  ) => void;
  subscribe: (listener: (state: PacState) => void) => () => void;
  subscribeExternalSync: (listener: () => void) => () => void;
  resetState: () => void;
  removeDemoPatients: () => void;
  deleteEvaluation: (evaluationId: string) => void;
  destroy: () => void;
}

export function createPacStore(): PacStoreInstance {
  let state: PacState = loadInitialState();
  const listeners = new Set<(s: PacState) => void>();
  const externalSyncListeners = new Set<() => void>();

  function handleStorageEvent(event: StorageEvent): void {
    if (event.key !== null && event.key !== PAC_STORAGE_KEY) return;
    state = loadStateFromRaw(event.newValue);
    listeners.forEach((listener) => listener(state));
    externalSyncListeners.forEach((listener) => listener());
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
  }

  return {
    getState(): PacState {
      return state;
    },
    setState(
      updater: Partial<PacState> | ((prev: PacState) => PacState),
    ): void {
      const prevState = state;
      const rawNext =
        typeof updater === "function"
          ? updater(prevState)
          : { ...prevState, ...updater };
      state = {
        ...syncActiveDraft(prevState, rawNext),
        schemaVersion: PAC_SCHEMA_VERSION,
      };
      saveStateToStorage(state);
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener: (s: PacState) => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    subscribeExternalSync(listener: () => void): () => void {
      externalSyncListeners.add(listener);
      return () => externalSyncListeners.delete(listener);
    },
    resetState(): void {
      state = {
        ...cloneValue(defaultPacState),
        schemaVersion: PAC_SCHEMA_VERSION,
      };
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.removeItem(PAC_STORAGE_KEY);
        } catch {
          // Ignore storage errors
        }
      }
      listeners.forEach((listener) => listener(state));
    },
    removeDemoPatients(): void {
      this.setState((prev) => removeDemoPatientsState(prev));
    },
    deleteEvaluation(evaluationId: string): void {
      this.setState((prev) => deleteEvaluationState(prev, evaluationId));
    },
    destroy(): void {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageEvent);
      }
      listeners.clear();
      externalSyncListeners.clear();
    },
  };
}

export const pacStore = createPacStore();

export function usePacStore(): [PacState, typeof pacStore.setState] {
  const [state, setState] = useState<PacState>(() => pacStore.getState());

  useEffect(() => {
    return pacStore.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  return [state, pacStore.setState];
}

export function useExternalTabSyncNotice(): [boolean, () => void] {
  const [noticed, setNoticed] = useState(false);

  useEffect(() => {
    return pacStore.subscribeExternalSync(() => {
      setNoticed(true);
    });
  }, []);

  return [noticed, () => setNoticed(false)];
}
