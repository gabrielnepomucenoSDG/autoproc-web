import { ALL_PROTOCOL_IDS } from "@/lib/evaluation-summary";
import type { NormativeStatus } from "@/lib/normative-engine";
import { defaultPacState } from "@/lib/mock-pac-default";
import type {
  EvaluationRecord,
  EvaluationSnapshot,
  PacState,
  PatientRecord,
} from "@/lib/pac-store";

export const PAC_SCHEMA_VERSION = 2;

const VALID_STATUSES = new Set<NormativeStatus>([
  "Normal",
  "Alterado",
  "Não aplicável",
  "Não avaliado",
]);

function normalizeStatus(value: unknown): NormativeStatus {
  if (
    typeof value === "string" &&
    VALID_STATUSES.has(value as NormativeStatus)
  ) {
    return value as NormativeStatus;
  }
  return "Não avaliado";
}

function migrateSnapshot(
  raw: Partial<EvaluationSnapshot> | undefined,
  base: PacState,
): EvaluationSnapshot | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  return {
    patient: {
      ...base.patient,
      ...raw.patient,
      selectedTests: Array.isArray(raw.patient?.selectedTests)
        ? raw.patient.selectedTests
        : [...ALL_PROTOCOL_IDS],
    },
    bandinha: {
      ...base.bandinha,
      ...raw.bandinha,
      localizacao: {
        ...base.bandinha.localizacao,
        ...raw.bandinha?.localizacao,
      },
    },
    falaNoRuido: {
      ...base.falaNoRuido,
      ...raw.falaNoRuido,
      od: { ...base.falaNoRuido.od, ...raw.falaNoRuido?.od },
      oe: { ...base.falaNoRuido.oe, ...raw.falaNoRuido?.oe },
    },
    tdd: {
      ...base.tdd,
      ...raw.tdd,
      integracao: { ...base.tdd.integracao, ...raw.tdd?.integracao },
      separacao: { ...base.tdd.separacao, ...raw.tdd?.separacao },
    },
    temporal: {
      ...base.temporal,
      ...raw.temporal,
      rgdt: { ...base.temporal.rgdt, ...raw.temporal?.rgdt },
    },
    psi: {
      ...base.psi,
      ...raw.psi,
      od: { ...base.psi.od, ...raw.psi?.od },
      oe: { ...base.psi.oe, ...raw.psi?.oe },
    },
    ssw: {
      ...base.ssw,
      ...raw.ssw,
      errors: { ...base.ssw.errors, ...raw.ssw?.errors },
      inversoes:
        typeof raw.ssw?.inversoes === "number" &&
        Number.isFinite(raw.ssw.inversoes)
          ? Math.max(0, Math.round(raw.ssw.inversoes))
          : 0,
    },
    laudo: {
      ...base.laudo,
      ...raw.laudo,
    },
  };
}

/**
 * Migrates raw/legacy parsed state (v1 without schemaVersion, ssw.inversoes, or new statuses)
 * to the current PAC_SCHEMA_VERSION safely without throwing.
 */
export function migratePacState(raw: unknown): PacState {
  const base: PacState = {
    ...structuredClone(defaultPacState),
    schemaVersion: PAC_SCHEMA_VERSION,
  };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return base;
  }

  const parsed = raw as Partial<PacState>;
  const evaluations: EvaluationRecord[] = Array.isArray(parsed.evaluations)
    ? parsed.evaluations
        .filter((ev): ev is EvaluationRecord =>
          Boolean(ev && typeof ev === "object" && typeof ev.id === "string"),
        )
        .map((ev) => ({
          ...ev,
          status: ev.status === "finalizada" ? "finalizada" : "rascunho",
          skills: {
            fechamentoAuditivo: normalizeStatus(ev.skills?.fechamentoAuditivo),
            figuraFundo: normalizeStatus(ev.skills?.figuraFundo),
            integracaoBinaural: normalizeStatus(ev.skills?.integracaoBinaural),
            separacaoBinaural: normalizeStatus(ev.skills?.separacaoBinaural),
            ordenacaoTemporal: normalizeStatus(ev.skills?.ordenacaoTemporal),
            resolucaoTemporal: normalizeStatus(ev.skills?.resolucaoTemporal),
            localizacaoSonora: normalizeStatus(ev.skills?.localizacaoSonora),
          },
          snapshot: migrateSnapshot(ev.snapshot, base),
        }))
    : base.evaluations;

  const patients: PatientRecord[] = Array.isArray(parsed.patients)
    ? parsed.patients.filter((p): p is PatientRecord =>
        Boolean(p && typeof p === "object" && typeof p.id === "string"),
      )
    : base.patients;

  return {
    ...base,
    ...parsed,
    schemaVersion: PAC_SCHEMA_VERSION,
    clinician: { ...base.clinician, ...parsed.clinician },
    patients,
    evaluations,
    patient: {
      ...base.patient,
      ...parsed.patient,
      selectedTests: Array.isArray(parsed.patient?.selectedTests)
        ? parsed.patient.selectedTests
        : base.patient.selectedTests,
    },
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
      inversoes:
        typeof parsed.ssw?.inversoes === "number" &&
        Number.isFinite(parsed.ssw.inversoes)
          ? Math.max(0, Math.round(parsed.ssw.inversoes))
          : 0,
    },
    laudo: {
      ...base.laudo,
      ...parsed.laudo,
    },
  };
}
