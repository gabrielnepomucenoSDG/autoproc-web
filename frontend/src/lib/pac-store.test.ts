import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PAC_STORAGE_KEY,
  computeAuditorySkills,
  computeEvaluationSummary,
  extractSnapshot,
  finalizeEvaluationState,
  pacStore,
  rectifyEvaluationState,
  restoreSnapshotFields,
  updatePatientExamStats,
  type EvaluationRecord,
} from "@/lib/pac-store";

describe("pac-store persistence and clinical workflow", () => {
  beforeEach(() => {
    localStorage.clear();
    pacStore.resetState();
  });

  it("persists patient registration and reloads state from localStorage", async () => {
    pacStore.setState((prev) => ({
      ...prev,
      patients: [
        {
          id: "pac-novo",
          name: "Pedro Henrique Alves",
          age: 8,
          ageLabel: "8 anos",
          birthDate: "10/05/2018",
          referral: "Dra. Sofia Lima",
          lastEvaluationDate: "—",
          totalExams: 0,
          clinicalNotes: "Queixa de desatenção em sala.",
        },
        ...prev.patients,
      ],
      activePatientId: "pac-novo",
    }));

    const storedRaw = localStorage.getItem(PAC_STORAGE_KEY);
    expect(storedRaw).not.toBeNull();
    expect(storedRaw).toContain("Pedro Henrique Alves");

    vi.resetModules();
    const reloadedModule = await import("@/lib/pac-store");
    const reloadedState = reloadedModule.pacStore.getState();

    expect(reloadedState.activePatientId).toBe("pac-novo");
    expect(
      reloadedState.patients.some((p) => p.name === "Pedro Henrique Alves"),
    ).toBe(true);
  });

  it("resets state to defaults and removes localStorage entry", () => {
    pacStore.setState((prev) => ({
      ...prev,
      activePatientId: "pac-custom",
    }));
    expect(localStorage.getItem(PAC_STORAGE_KEY)).not.toBeNull();

    pacStore.resetState();
    expect(pacStore.getState().activePatientId).toBe("pac-1");
    expect(localStorage.getItem(PAC_STORAGE_KEY)).toBeNull();
  });

  it("auto-syncs active draft snapshot and skills when protocols change", () => {
    const initial = pacStore.getState();
    const draftId = "eval-draft-test";
    const draftRecord: EvaluationRecord = {
      id: draftId,
      patientId: initial.activePatientId,
      patientName: initial.patient.name,
      ageLabel: initial.patient.age,
      date: "17/11/2026",
      status: "rascunho",
      examiner: initial.clinician.shortName,
      referral: initial.patient.referral,
      skills: computeAuditorySkills(initial),
      snapshot: extractSnapshot(initial),
    };

    pacStore.setState((prev) => ({
      ...prev,
      activeEvaluationId: draftId,
      evaluations: [draftRecord, ...prev.evaluations],
    }));

    // Update Bandinha & Fala no Ruido on active draft
    pacStore.setState((prev) => ({
      ...prev,
      bandinha: {
        ...prev.bandinha,
        localizacao: {
          direita: false,
          esquerda: true,
          acima: false,
          frente: true,
          atras: false,
        },
      },
      falaNoRuido: {
        ...prev.falaNoRuido,
        od: {
          ...prev.falaNoRuido.od,
          erros: [1, 2, 3, 4, 5, 6, 7, 8], // 68% -> Alterado
        },
      },
    }));

    const updatedDraft = pacStore
      .getState()
      .evaluations.find((ev) => ev.id === draftId);

    expect(updatedDraft).toBeDefined();
    expect(updatedDraft?.skills.localizacaoSonora).toBe("Alterado");
    expect(updatedDraft?.skills.fechamentoAuditivo).toBe("Alterado");
    expect(updatedDraft?.snapshot?.bandinha.localizacao.direita).toBe(false);
    expect(updatedDraft?.snapshot?.falaNoRuido.od.erros).toHaveLength(8);
  });

  it("extracts and restores evaluation snapshots without shared references", () => {
    const state = pacStore.getState();
    const snapshot = extractSnapshot(state);
    snapshot.bandinha.observacoes = "Nota isolada do snapshot";

    expect(pacStore.getState().bandinha.observacoes).toBe("");

    const mockEval: EvaluationRecord = {
      id: "eval-snap",
      patientId: "pac-1",
      patientName: "Maria Fernanda Torres",
      ageLabel: "9 anos",
      date: "17/11/2026",
      status: "finalizada",
      examiner: "Dra. Rachel Façanha",
      referral: "Dra. Marcela",
      skills: computeAuditorySkills(state),
      snapshot,
    };

    const restored = restoreSnapshotFields(mockEval);
    expect(restored.bandinha?.observacoes).toBe("Nota isolada do snapshot");

    const summary = computeEvaluationSummary(state);
    expect(summary.bandinha.locCount).toBe(5);
    expect(summary.falaNoRuido.odFr).toBe(96);
    expect(summary.ssw.dc).toBe(90);
  });

  it("recalculates patient exam stats when evaluations are added or deleted", () => {
    const state = pacStore.getState();
    const newEval: EvaluationRecord = {
      id: "eval-extra",
      patientId: "pac-8",
      patientName: "Antônio Carlos Magalhães Neto",
      ageLabel: "64 anos",
      date: "17/11/2026",
      status: "finalizada",
      examiner: "Dra. Rachel Façanha",
      referral: "Dr. Henrique Bastos",
      skills: computeAuditorySkills(state),
    };

    const nextEvals = [newEval, ...state.evaluations];
    const updatedPatients = updatePatientExamStats(
      state.patients,
      nextEvals,
      "pac-8",
    );
    const pac8 = updatedPatients.find((p) => p.id === "pac-8");

    expect(pac8?.totalExams).toBe(2);
    expect(pac8?.lastEvaluationDate).toBe("17/11/2026");

    const afterDeleteEvals = nextEvals.filter((e) => e.id !== "eval-extra");
    const restoredPatients = updatePatientExamStats(
      updatedPatients,
      afterDeleteEvals,
      "pac-8",
    );
    expect(restoredPatients.find((p) => p.id === "pac-8")?.totalExams).toBe(1);
    expect(
      restoredPatients.find((p) => p.id === "pac-8")?.lastEvaluationDate,
    ).toBe("15/03/2025");
  });

  it("finalizes an active draft without duplication and rectifies finalized evaluations", () => {
    const base = pacStore.getState();
    const draftId = "eval-draft-cycle";
    const withDraft = {
      ...base,
      activePatientId: "pac-1",
      activeEvaluationId: draftId,
      evaluations: [
        {
          id: draftId,
          patientId: "pac-1",
          patientName: base.patient.name,
          ageLabel: base.patient.age,
          date: "17/11/2026",
          status: "rascunho" as const,
          examiner: base.clinician.shortName,
          referral: base.patient.referral,
          skills: computeAuditorySkills(base),
          snapshot: extractSnapshot(base),
        },
        ...base.evaluations,
      ],
    };

    const finalized = finalizeEvaluationState(
      withDraft,
      "Comportamento revisado na finalização.",
    );
    const finalizedEval = finalized.evaluations.find((e) => e.id === draftId);

    expect(finalized.evaluations).toHaveLength(withDraft.evaluations.length);
    expect(finalizedEval?.status).toBe("finalizada");
    expect(finalizedEval?.snapshot?.laudo.comportamento).toBe(
      "Comportamento revisado na finalização.",
    );

    const rectified = rectifyEvaluationState(
      finalized,
      "Retificando comportamento.",
    );
    const originalEval = rectified.evaluations.find((e) => e.id === draftId);
    const newDraft = rectified.evaluations.find(
      (e) => e.id === rectified.activeEvaluationId,
    );

    expect(originalEval?.rectified).toBe(true);
    expect(newDraft).toBeDefined();
    expect(newDraft?.id).not.toBe(draftId);
    expect(newDraft?.status).toBe("rascunho");
    expect(rectified.sidebarOpen).toBe(true);
  });
});
