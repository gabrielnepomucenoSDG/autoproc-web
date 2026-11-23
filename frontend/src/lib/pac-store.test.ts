import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PAC_SCHEMA_VERSION,
  PAC_STORAGE_KEY,
  computeAuditorySkills,
  computeEvaluationSummary,
  createPacStore,
  deleteEvaluationState,
  extractSnapshot,
  finalizeEvaluationState,
  migratePacState,
  pacStore,
  rectifyEvaluationState,
  removeDemoPatientsState,
  restoreSnapshotFields,
  updatePatientExamStats,
  type EvaluationRecord,
} from "@/lib/pac-store";
import { DEMO_PATIENT_IDS } from "@/lib/mock-pac-default";

describe("pac-store persistence, migration, and clinical workflow (A5 & A7)", () => {
  beforeEach(() => {
    localStorage.clear();
    pacStore.resetState();
  });

  it("L1 & L2: persists patient and all 6 protocols and reloads intact in a fresh store", () => {
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
          lastEvaluationDate: "20/11/2026",
          totalExams: 1,
          clinicalNotes: "Queixa de desatenção em sala.",
        },
        ...prev.patients,
      ],
      activePatientId: "pac-novo",
      ssw: {
        errors: { a: 0, b: 4, c: 4, d: 0, e: 0, f: 3, g: 2, h: 1 },
        inversoes: 2,
        observacoes: "Pausa rápida solicitada.",
      },
      psi: {
        ...prev.psi,
        mode: "ssi",
        od: { ...prev.psi.od, enabledMinus10: false },
      },
    }));

    const storedRaw = localStorage.getItem(PAC_STORAGE_KEY);
    expect(storedRaw).not.toBeNull();
    expect(storedRaw).toContain("Pedro Henrique Alves");

    const freshStore = createPacStore();
    try {
      const reloaded = freshStore.getState();
      expect(reloaded.schemaVersion).toBe(PAC_SCHEMA_VERSION);
      expect(reloaded.activePatientId).toBe("pac-novo");
      expect(
        reloaded.patients.some((p) => p.name === "Pedro Henrique Alves"),
      ).toBe(true);
      expect(reloaded.ssw.inversoes).toBe(2);
      expect(reloaded.ssw.observacoes).toBe("Pausa rápida solicitada.");
      expect(reloaded.psi.mode).toBe("ssi");
      expect(reloaded.psi.od.enabledMinus10).toBe(false);
    } finally {
      freshStore.destroy();
    }
  });

  it("L4 (D10): synchronizes two stores across tabs via window storage event and notifies listener", () => {
    const tabA = createPacStore();
    const tabB = createPacStore();
    const syncSpy = vi.fn();
    tabB.subscribeExternalSync(syncSpy);

    try {
      tabA.setState((prev) => ({
        ...prev,
        patient: { ...prev.patient, name: "Paciente Sincronizado Aba A" },
      }));

      const rawValue = localStorage.getItem(PAC_STORAGE_KEY);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: PAC_STORAGE_KEY,
          newValue: rawValue,
        }),
      );

      expect(syncSpy).toHaveBeenCalledTimes(1);
      expect(tabB.getState().patient.name).toBe("Paciente Sincronizado Aba A");
    } finally {
      tabA.destroy();
      tabB.destroy();
    }
  });

  it("L9: migrates legacy v1 state (without schemaVersion or ssw.inversoes) and survives corrupted JSON", () => {
    const legacyV1 = {
      activePatientId: "pac-legacy",
      patients: [
        {
          id: "pac-legacy",
          name: "Paciente Legado v1",
          age: 9,
          ageLabel: "9 anos",
          birthDate: "01/02/2017",
          referral: "Pediatria",
          lastEvaluationDate: "10/10/2025",
          totalExams: 1,
          clinicalNotes: "Migrado da versão 1.",
        },
      ],
      evaluations: [
        {
          id: "eval-legacy",
          patientId: "pac-legacy",
          patientName: "Paciente Legado v1",
          ageLabel: "9 anos",
          date: "10/10/2025",
          status: "finalizada",
          examiner: "Dra. Rachel Façanha",
          referral: "Pediatria",
          skills: {
            fechamentoAuditivo: "Normal",
            figuraFundo: "Alterado",
            integracaoBinaural: "Normal",
            separacaoBinaural: "Normal",
            ordenacaoTemporal: "Normal",
            resolucaoTemporal: "Normal",
            localizacaoSonora: "Normal",
          },
          snapshot: {
            patient: {
              name: "Paciente Legado v1",
              age: "9 anos",
              birthDate: "01/02/2017",
              date: "10/10/2025",
              examiner: "Dra. Rachel Façanha",
              referral: "Pediatria",
            },
            ssw: {
              errors: { a: 0, b: 1, c: 1, d: 0, e: 0, f: 1, g: 1, h: 0 },
              observacoes: "",
            },
          },
        },
      ],
      ssw: {
        errors: { a: 0, b: 2, c: 1, d: 0, e: 0, f: 1, g: 2, h: 0 },
        observacoes: "Sem campo inversoes",
      },
    };

    const migrated = migratePacState(legacyV1);
    expect(migrated.schemaVersion).toBe(PAC_SCHEMA_VERSION);
    expect(migrated.patients[0]?.name).toBe("Paciente Legado v1");
    expect(migrated.ssw.inversoes).toBe(0);
    expect(migrated.evaluations[0]?.snapshot?.ssw.inversoes).toBe(0);
    expect(
      migrated.evaluations[0]?.snapshot?.patient.selectedTests,
    ).toHaveLength(6);

    // Corrupted JSON in localStorage must not crash store initialization
    localStorage.setItem(PAC_STORAGE_KEY, "{corrupted-json:::[[[");
    const recoveredStore = createPacStore();
    try {
      expect(recoveredStore.getState().schemaVersion).toBe(PAC_SCHEMA_VERSION);
      expect(recoveredStore.getState().patients.length).toBeGreaterThan(0);
    } finally {
      recoveredStore.destroy();
    }
  });

  it("D11: removes only seeded demo patients and preserves real user-created patients", () => {
    const base = pacStore.getState();
    const withReal = {
      ...base,
      patients: [
        {
          id: "pac-real-1",
          name: "Paciente Real Preservado",
          age: 10,
          ageLabel: "10 anos",
          birthDate: "15/05/2016",
          referral: "Otorrino",
          lastEvaluationDate: "20/11/2026",
          totalExams: 1,
          clinicalNotes: "Caso real.",
        },
        ...base.patients,
      ],
      evaluations: [
        {
          id: "eval-real-1",
          patientId: "pac-real-1",
          patientName: "Paciente Real Preservado",
          ageLabel: "10 anos",
          date: "20/11/2026",
          status: "finalizada" as const,
          examiner: "Dra. Rachel Façanha",
          referral: "Otorrino",
          skills: computeAuditorySkills(base),
        },
        ...base.evaluations,
      ],
    };

    const cleaned = removeDemoPatientsState(withReal);
    expect(cleaned.patients).toHaveLength(1);
    expect(cleaned.patients[0]?.id).toBe("pac-real-1");
    expect(cleaned.patients.some((p) => DEMO_PATIENT_IDS.includes(p.id))).toBe(
      false,
    );
    expect(cleaned.evaluations).toHaveLength(1);
    expect(cleaned.evaluations[0]?.id).toBe("eval-real-1");
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

  it("A7: finalized evaluation cannot be deleted, rectification preserves original intact, and drafts can be deleted", () => {
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

    // Draft CAN be deleted
    const afterDraftDelete = deleteEvaluationState(withDraft, draftId);
    expect(afterDraftDelete.evaluations.some((ev) => ev.id === draftId)).toBe(
      false,
    );

    // Finalize the draft
    const finalized = finalizeEvaluationState(
      withDraft,
      "Comportamento revisado na finalização.",
    );
    const finalizedEval = finalized.evaluations.find((e) => e.id === draftId);
    expect(finalized.evaluations).toHaveLength(withDraft.evaluations.length);
    expect(finalizedEval?.status).toBe("finalizada");

    // Finalized CANNOT be deleted via store guard
    const afterBlockedDelete = deleteEvaluationState(finalized, draftId);
    expect(afterBlockedDelete.evaluations).toHaveLength(
      finalized.evaluations.length,
    );
    expect(afterBlockedDelete.evaluations.some((ev) => ev.id === draftId)).toBe(
      true,
    );

    // Rectify: creates new draft, marks original rectified, original snapshot stays intact
    const rectified = rectifyEvaluationState(
      finalized,
      "Retificando comportamento.",
    );
    const originalEval = rectified.evaluations.find((e) => e.id === draftId);
    const newDraft = rectified.evaluations.find(
      (e) => e.id === rectified.activeEvaluationId,
    );

    expect(originalEval?.rectified).toBe(true);
    expect(originalEval?.snapshot?.laudo.comportamento).toBe(
      "Comportamento revisado na finalização.",
    );
    expect(newDraft).toBeDefined();
    expect(newDraft?.id).not.toBe(draftId);
    expect(newDraft?.status).toBe("rascunho");
    expect(rectified.sidebarOpen).toBe(true);

    // Mutating the new draft does NOT alter the original finalized record
    pacStore.setState(rectified);
    pacStore.setState((prev) => ({
      ...prev,
      ssw: { ...prev.ssw, inversoes: 5 },
    }));
    const persistedOriginal = pacStore
      .getState()
      .evaluations.find((e) => e.id === draftId);
    expect(persistedOriginal?.snapshot?.ssw.inversoes).toBe(0);
    expect(persistedOriginal?.rectified).toBe(true);
  });
});
