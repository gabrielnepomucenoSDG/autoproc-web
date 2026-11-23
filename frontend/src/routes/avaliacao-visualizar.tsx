import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  User,
  Pencil,
  FileText,
  Trash2,
  Lock,
  Headphones,
  AudioWaveform,
  Target,
  Clock,
  Check,
  AlertCircle,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import {
  computeEvaluationSummary,
  deleteEvaluationState,
  extractSnapshot,
  restoreSnapshotFields,
  updatePatientExamStats,
  usePacStore,
  type EvaluationRecord,
} from "@/lib/pac-store";
import { getTodayBR, type NormativeStatus } from "@/lib/normative-engine";

export const Route = createFileRoute("/avaliacao-visualizar")({
  component: Tela07VisualizacaoAvaliacaoPassada,
});

function StatusPill({ status }: { status: NormativeStatus }) {
  if (status === "Normal") {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#B8ECC8] text-[#0F5132] shrink-0">
        <span className="w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
        <span>Normal</span>
      </span>
    );
  }
  if (status === "Alterado") {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F8C2C2] text-[#7F1D1D] shrink-0">
        <span className="w-4 h-4 rounded-full bg-[#DC2626] text-white flex items-center justify-center">
          <AlertCircle className="w-3 h-3 stroke-[2.5]" />
        </span>
        <span>Alterado</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 shrink-0">
      <span>{status}</span>
    </span>
  );
}

function Tela07VisualizacaoAvaliacaoPassada() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();
  // Modal inicia fechado por padrão
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fallbackEval: EvaluationRecord = {
    id: "eval-8",
    patientId: "pac-1",
    patientName: "Maria Fernanda Torres",
    ageLabel: "9 anos",
    date: "26/10/2026",
    status: "finalizada",
    rectified: false,
    examiner: "Dra. Rachel Façanha",
    referral: "Dra. Marcela Filgueiras Antunes",
    skills: {
      fechamentoAuditivo: "Normal",
      figuraFundo: "Normal",
      integracaoBinaural: "Alterado",
      separacaoBinaural: "Normal",
      ordenacaoTemporal: "Normal",
      resolucaoTemporal: "Normal",
      localizacaoSonora: "Normal",
    },
  };

  const activeEval: EvaluationRecord =
    store.evaluations.find((ev) => ev.id === store.activeEvaluationId) ??
    store.evaluations.find((ev) => ev.patientId === store.activePatientId) ??
    store.evaluations[0] ??
    fallbackEval;

  const isSaved = activeEval.status === "finalizada";
  const data = activeEval.snapshot ?? store;
  const activePatient = store.patients.find(
    (p) => p.id === activeEval.patientId,
  );
  const summary = computeEvaluationSummary({
    ...data,
    patient: {
      ...data.patient,
      age: activeEval.ageLabel,
      birthDate: activePatient?.birthDate || data.patient.birthDate,
      date: activeEval.date,
    },
  });
  const formatPct = (val: number) => `${String(val).replace(".", ",")}%`;

  function handleResumeDraft() {
    setStore((prev) => ({
      ...prev,
      ...restoreSnapshotFields(activeEval),
      sidebarOpen: true,
      activePatientId: activeEval.patientId,
      activeEvaluationId: activeEval.id,
      patient: {
        ...prev.patient,
        ...(activeEval.snapshot?.patient ?? {}),
        name: activeEval.patientName,
        age: activeEval.ageLabel,
        birthDate: activePatient?.birthDate || prev.patient.birthDate,
        date: activeEval.date,
        referral: activeEval.referral,
      },
    }));
    void navigate({ to: "/protocolos/fala-no-ruido" });
  }

  function handleEditAsNew() {
    const newDraftId = `eval-${Date.now()}`;
    setStore((prev) => {
      const restored = restoreSnapshotFields(activeEval);
      const nextPatient = {
        ...prev.patient,
        ...(activeEval.snapshot?.patient ?? {}),
        name: activeEval.patientName,
        age: activeEval.ageLabel,
        birthDate: activePatient?.birthDate || prev.patient.birthDate,
        date: getTodayBR(),
        referral: activeEval.referral,
      };
      const nextStateForSnapshot = {
        ...prev,
        ...restored,
        patient: nextPatient,
      };
      const newDraft: EvaluationRecord = {
        id: newDraftId,
        patientId: activeEval.patientId,
        patientName: activeEval.patientName,
        ageLabel: activeEval.ageLabel,
        date: nextPatient.date,
        status: "rascunho",
        examiner: prev.clinician.shortName,
        referral: activeEval.referral,
        skills: activeEval.skills,
        snapshot: extractSnapshot(nextStateForSnapshot),
      };
      const nextEvaluations = [
        newDraft,
        ...prev.evaluations.map((item) =>
          item.id === activeEval.id && item.status === "finalizada"
            ? { ...item, rectified: true }
            : item,
        ),
      ];
      return {
        ...nextStateForSnapshot,
        sidebarOpen: false,
        activePatientId: activeEval.patientId,
        activeEvaluationId: newDraftId,
        evaluations: nextEvaluations,
        patients: updatePatientExamStats(
          prev.patients,
          nextEvaluations,
          activeEval.patientId,
        ),
      };
    });
    void navigate({ to: "/nova-avaliacao" });
  }

  function handleOpenLaudo() {
    setStore((prev) => ({
      ...prev,
      ...restoreSnapshotFields(activeEval),
      activePatientId: activeEval.patientId,
      activeEvaluationId: activeEval.id,
      patient: {
        ...prev.patient,
        ...(activeEval.snapshot?.patient ?? {}),
        name: activeEval.patientName,
        age: activeEval.ageLabel,
        birthDate: activePatient?.birthDate || prev.patient.birthDate,
        date: activeEval.date,
        referral: activeEval.referral,
      },
    }));
    void navigate({ to: "/laudo" });
  }

  function handleConfirmDelete() {
    if (activeEval.status !== "rascunho") return;
    setStore((prev) => deleteEvaluationState(prev, activeEval.id));
    setShowDeleteModal(false);
    void navigate({ to: "/" });
  }

  return (
    <ClinicalLayout hidePageHeader={true}>
      <div className="relative space-y-4">
        {/* Top Patient & Action Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs px-5 py-3.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs sm:text-sm text-[#112338]">
            <User className="w-5 h-5 text-[#1A73E8] shrink-0" />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                <strong className="font-bold">Paciente:</strong>{" "}
                {activeEval.patientName}
              </span>
              <span className="text-slate-300">|</span>
              <span>
                <strong className="font-bold">Idade:</strong>{" "}
                {activeEval.ageLabel}
              </span>
              <span className="text-slate-300">|</span>
              <span>
                <strong className="font-bold">Data:</strong> {activeEval.date}
              </span>
              <span className="text-slate-300">|</span>
              <span>
                <strong className="font-bold">Fonoaudióloga:</strong>{" "}
                {activeEval.examiner}
              </span>
              {activeEval.rectified && (
                <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Substituído / Retificado
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!isSaved ? (
              <button
                type="button"
                onClick={handleResumeDraft}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Continuar Preenchimento</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEditAsNew}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Editar como Nova Avaliação</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenLaudo}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-[#1A73E8] text-[#1A73E8] hover:bg-blue-50 bg-white text-xs font-bold transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Baixar Laudo PDF/Docx</span>
            </button>

            {!isSaved && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 bg-white text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Rascunho</span>
              </button>
            )}
          </div>
        </div>

        {/* Amber Read-Only Warning Banner */}
        <div className="bg-[#FCE6B4] border border-amber-300/90 rounded-xl px-4 py-3 flex items-center space-x-3 text-xs sm:text-sm text-[#653800]">
          <Lock className="w-4 h-4 text-[#854D0E] shrink-0" />
          <p>
            <strong className="font-bold">Modo de Visualização:</strong>{" "}
            {isSaved
              ? t("pac.protocols.viewModeFinalized")
              : t("pac.protocols.viewModeDraft")}
          </p>
        </div>

        {/* Row 1: 3 Read-Only Protocol Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1: Testes Dióticos (Bandinha) */}
          <div className="bg-[#F8FAFE] rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <Headphones className="w-6 h-6 text-[#1A73E8] shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-[#112338]">
                1. Testes Dióticos (Bandinha)
              </h2>
            </div>

            <div className="space-y-3 pt-1 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#112338] font-medium mr-2">
                  Localização:
                </span>
                <span className="text-sm font-extrabold text-[#112338] text-right mr-2">
                  {summary.bandinha.locDisplay}
                </span>
                <StatusPill status={summary.bandinha.locStatus} />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#112338] font-medium ml-auto mr-3">
                  Memória (S.V.):
                </span>
                <span className="text-base font-extrabold text-[#112338] w-10 text-right mr-2">
                  {summary.bandinha.applied
                    ? `${summary.bandinha.mvCount}/3`
                    : "—"}
                </span>
                <StatusPill status={summary.bandinha.mvStatus} />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#112338] font-medium ml-auto mr-3">
                  Memória (S.N.V.):
                </span>
                <span className="text-base font-extrabold text-[#112338] w-10 text-right mr-2">
                  {summary.bandinha.applied
                    ? `${summary.bandinha.mnvCount}/3`
                    : "—"}
                </span>
                <StatusPill status={summary.bandinha.mnvStatus} />
              </div>
            </div>
          </div>

          {/* Card 2: 2. Fala no Ruído (OD/OE) */}
          <div className="bg-[#F8FAFE] rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <AudioWaveform className="w-6 h-6 text-[#1A73E8] shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-[#112338]">
                2. Fala no Ruído (OD/OE)
              </h2>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="h-8 flex-1 rounded-lg bg-[#E4ECF9] border border-blue-200/80" />
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[#112338] font-medium">OD:</span>
                  <span className="text-base font-extrabold text-[#112338]">
                    {summary.falaNoRuido.applied
                      ? formatPct(summary.falaNoRuido.odFr)
                      : "—"}
                  </span>
                  <StatusPill status={summary.falaNoRuido.odStatus} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="h-8 flex-1 rounded-lg bg-[#E4ECF9] border border-blue-200/80" />
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[#112338] font-medium">OE:</span>
                  <span className="text-base font-extrabold text-[#112338]">
                    {summary.falaNoRuido.applied
                      ? formatPct(summary.falaNoRuido.oeFr)
                      : "—"}
                  </span>
                  <StatusPill status={summary.falaNoRuido.oeStatus} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[#112338] font-medium">Diferença:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-extrabold text-[#112338]">
                    {summary.falaNoRuido.applied
                      ? formatPct(summary.falaNoRuido.diffMax)
                      : "—"}
                  </span>
                  <StatusPill status={summary.falaNoRuido.diffStatus} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 3. PSI ou SSI (OD/OE) — segue o modo escolhido (D6) */}
          <div className="bg-[#F8FAFE] rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <Target className="w-6 h-6 text-[#1A73E8] shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-[#112338]">
                3. {summary.psi.modeLabel} / MCI (OD/OE)
              </h2>
            </div>

            <div className="space-y-3 pt-1 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="h-8 flex-1 rounded-lg bg-[#E4ECF9] border border-blue-200/80 px-2.5 flex items-center text-[11px] font-semibold text-slate-600 truncate">
                  {summary.psi.odDetail}
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[#112338] font-medium">OD:</span>
                  <StatusPill status={summary.psi.odStatus} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="h-8 flex-1 rounded-lg bg-[#E4ECF9] border border-blue-200/80 px-2.5 flex items-center text-[11px] font-semibold text-slate-600 truncate">
                  {summary.psi.oeDetail}
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[#112338] font-medium">OE:</span>
                  <StatusPill status={summary.psi.oeStatus} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Processamento Temporal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 4: Resolução Temporal (RGDT) */}
          <div className="bg-[#F8FAFE] rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <Clock className="w-6 h-6 text-[#1A73E8] shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-[#112338]">
                4.1. Resolução Temporal (RGDT)
              </h2>
            </div>

            <div className="pt-1 flex items-center justify-between gap-4">
              <div className="h-10 flex-1 rounded-xl bg-[#E4ECF9] border border-blue-200/80 px-4 flex items-center justify-between text-sm font-semibold text-[#112338]">
                <span>RGDT</span>
                <span className="text-xs text-slate-600">
                  {summary.temporal.applied
                    ? `Média: ${summary.temporal.rgdtMedia.toFixed(2).replace(".", ",")} ms`
                    : t("pac.protocols.notApplied")}
                </span>
              </div>
              <StatusPill status={summary.temporal.rgdtStatus} />
            </div>
          </div>

          {/* Card 5: Ordenação Temporal (Freq / Duração - Binaural) */}
          <div className="bg-[#F8FAFE] rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <Clock className="w-6 h-6 text-[#1A73E8] shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-[#112338]">
                4.2. Ordenação Temporal (Frequência e Duração -{" "}
                {t("pac.protocols.binaural")})
              </h2>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center justify-between flex-1 space-x-3">
                  <span className="text-[#112338] font-medium">
                    Padrão de Freq. ({t("pac.protocols.binaural")}):
                  </span>
                  <span className="text-xs font-extrabold text-[#112338]">
                    {summary.temporal.applied &&
                    summary.temporal.freqCombinedStatus !== "Não aplicável"
                      ? `Hum ${formatPct(summary.temporal.freqHummingPct)} | Nom ${formatPct(summary.temporal.freqPct)}`
                      : "—"}
                  </span>
                  <StatusPill status={summary.temporal.freqCombinedStatus} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center justify-between flex-1 space-x-3">
                  <span className="text-[#112338] font-medium">
                    Padrão de Duração ({t("pac.protocols.binaural")}):
                  </span>
                  <span className="text-xs font-extrabold text-[#112338]">
                    {summary.temporal.applied &&
                    summary.temporal.durCombinedStatus !== "Não aplicável"
                      ? `Hum ${formatPct(summary.temporal.durHummingPct)} | Nom ${formatPct(summary.temporal.durPct)}`
                      : "—"}
                  </span>
                  <StatusPill status={summary.temporal.durCombinedStatus} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: 2 Independent Cards for TDD and SSW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Teste Dicótico de Dígitos (TDD) */}
          <div className="bg-[#F8FAFE] rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-[#1A73E8] text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#112338]">
                5. Teste Dicótico de Dígitos (TDD)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-sm">
              {/* Integração Binaural */}
              <div className="bg-white/80 rounded-xl border border-slate-200/80 p-3.5 space-y-2.5">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Integração Binaural
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#112338] font-medium">OD:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-[#112338]">
                      {summary.tdd.applied &&
                      summary.tdd.integOdStatus !== "Não aplicável"
                        ? formatPct(summary.tdd.integOd)
                        : "—"}
                    </span>
                    <StatusPill status={summary.tdd.integOdStatus} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#112338] font-medium">OE:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-[#112338]">
                      {summary.tdd.applied &&
                      summary.tdd.integOeStatus !== "Não aplicável"
                        ? formatPct(summary.tdd.integOe)
                        : "—"}
                    </span>
                    <StatusPill status={summary.tdd.integOeStatus} />
                  </div>
                </div>
              </div>

              {/* Separação Binaural */}
              <div className="bg-white/80 rounded-xl border border-slate-200/80 p-3.5 space-y-2.5">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Separação Binaural
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#112338] font-medium">OD:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-[#112338]">
                      {summary.tdd.applied &&
                      summary.tdd.sepOdStatus !== "Não aplicável"
                        ? formatPct(summary.tdd.sepOd)
                        : "—"}
                    </span>
                    <StatusPill status={summary.tdd.sepOdStatus} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#112338] font-medium">OE:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-[#112338]">
                      {summary.tdd.applied &&
                      summary.tdd.sepOeStatus !== "Não aplicável"
                        ? formatPct(summary.tdd.sepOe)
                        : "—"}
                    </span>
                    <StatusPill status={summary.tdd.sepOeStatus} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Teste Dicótico de Dissílabos Alternados - SSW */}
          <div className="bg-[#F8FAFE] rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-[#1A73E8] text-white flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#112338]">
                6. Teste Dicótico de Dissílabos Alternados - SSW
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-sm">
              {/* Quantitativo (DC e EC) */}
              <div className="bg-white/80 rounded-xl border border-slate-200/80 p-3.5 space-y-2.5">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Quantitativo
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#112338] font-medium">DC (OD):</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-[#112338]">
                      {summary.ssw.applied &&
                      summary.ssw.dcStatus !== "Não aplicável"
                        ? formatPct(summary.ssw.dc)
                        : "—"}
                    </span>
                    <StatusPill status={summary.ssw.dcStatus} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#112338] font-medium">EC (OE):</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-[#112338]">
                      {summary.ssw.applied &&
                      summary.ssw.ecStatus !== "Não aplicável"
                        ? formatPct(summary.ssw.ec)
                        : "—"}
                    </span>
                    <StatusPill status={summary.ssw.ecStatus} />
                  </div>
                </div>
              </div>

              {/* Qualitativo (Efeito de Ordem, Efeito Auditivo, Inversões, Tipo A) */}
              <div className="bg-white/80 rounded-xl border border-slate-200/80 p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Tendências Qualitativas
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-[#112338] font-medium">Ordem:</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCE7F9] text-[#112338] font-extrabold">
                      {summary.ssw.ordemLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-[#112338] font-medium">
                      Auditivo:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCE7F9] text-[#112338] font-extrabold">
                      {summary.ssw.auditivoLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-[#112338] font-medium">
                      {t("pac.protocols.sswInversoes")}:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCE7F9] text-[#112338] font-extrabold">
                      {summary.ssw.inversoesLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-[#112338] font-medium">Tipo A:</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCE7F9] text-[#112338] font-extrabold">
                      {summary.ssw.tipoALabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Centered Delete Confirmation Modal Overlay (Somente para Rascunhos) */}
        {!isSaved && showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-[1px] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-7 space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-7 h-7 text-red-600 shrink-0 fill-red-600/10" />
                <h3 className="text-lg font-extrabold text-[#112338]">
                  Excluir Rascunho Permanentemente?
                </h3>
              </div>

              <p className="text-sm text-[#112338] font-medium">
                Esta ação não pode ser desfeita.
              </p>

              <div className="flex items-center justify-end space-x-5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="text-sm font-bold text-[#1A73E8] hover:text-blue-800 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-[#D91C1C] hover:bg-red-700 text-white text-sm font-bold flex items-center space-x-2 shadow-md transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sim, Excluir</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClinicalLayout>
  );
}
