import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { usePacStore } from "@/lib/pac-store";
import { getTodayBR } from "@/lib/normative-engine";

export const Route = createFileRoute("/avaliacao-visualizar")({
  component: Tela07VisualizacaoAvaliacaoPassada,
});

function StatusPill({ status }: { status: "Normal" | "Alterado" }) {
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
  return (
    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F8C2C2] text-[#7F1D1D] shrink-0">
      <span className="w-4 h-4 rounded-full bg-[#DC2626] text-white flex items-center justify-center">
        <AlertCircle className="w-3 h-3 stroke-[2.5]" />
      </span>
      <span>Alterado</span>
    </span>
  );
}

function Tela07VisualizacaoAvaliacaoPassada() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();
  // Modal inicia fechado por padrão
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const activeEval = store.evaluations.find(
    (ev) => ev.id === store.activeEvaluationId,
  ) ?? {
    id: "eval-8",
    patientId: "pac-1",
    patientName: "Maria Fernanda Torres",
    ageLabel: "9 anos",
    date: "26/10/2026",
    examiner: "Dra. Rachel Façanha",
    referral: "Dra. Marcela Filgueiras Antunes",
  };

  function handleEditAsNew() {
    setStore((prev) => ({
      ...prev,
      sidebarOpen: false,
      patient: {
        ...prev.patient,
        name: activeEval.patientName,
        age: activeEval.ageLabel,
        date: getTodayBR(),
        referral: activeEval.referral,
      },
    }));
    void navigate({ to: "/nova-avaliacao" });
  }

  function handleConfirmDelete() {
    setStore((prev) => ({
      ...prev,
      evaluations: prev.evaluations.filter((e) => e.id !== activeEval.id),
    }));
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
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleEditAsNew}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar como Nova Avaliação</span>
            </button>

            <button
              type="button"
              onClick={() => void navigate({ to: "/laudo" })}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-[#1A73E8] text-[#1A73E8] hover:bg-blue-50 bg-white text-xs font-bold transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Baixar Laudo PDF/Docx</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 bg-white text-xs font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Avaliação</span>
            </button>
          </div>
        </div>

        {/* Amber Read-Only Warning Banner */}
        <div className="bg-[#FCE6B4] border border-amber-300/90 rounded-xl px-4 py-3 flex items-center space-x-3 text-xs sm:text-sm text-[#653800]">
          <Lock className="w-4 h-4 text-[#854D0E] shrink-0" />
          <p>
            <strong className="font-bold">Modo de Visualização:</strong>{" "}
            Avaliações salvas não podem ser alteradas. Para modificar valores,
            clique em &quot;Editar como Nova Avaliação&quot; (o registro
            original será mantido).
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
                <span className="text-[#112338] font-medium ml-auto mr-3">
                  Localização:
                </span>
                <span className="text-base font-extrabold text-[#112338] w-10 text-right mr-2">
                  5/5
                </span>
                <StatusPill status="Normal" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#112338] font-medium ml-auto mr-3">
                  Memória (S.V.):
                </span>
                <span className="text-base font-extrabold text-[#112338] w-10 text-right mr-2">
                  3/3
                </span>
                <StatusPill status="Normal" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#112338] font-medium ml-auto mr-3">
                  Memória (S.N.V.):
                </span>
                <span className="text-base font-extrabold text-[#112338] w-10 text-right mr-2">
                  3/3
                </span>
                <StatusPill status="Normal" />
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
                    96%
                  </span>
                  <StatusPill status="Normal" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="h-8 flex-1 rounded-lg bg-[#E4ECF9] border border-blue-200/80" />
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[#112338] font-medium">OE:</span>
                  <span className="text-base font-extrabold text-[#112338]">
                    92%
                  </span>
                  <StatusPill status="Normal" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[#112338] font-medium">Diferença:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-extrabold text-[#112338]">
                    4%
                  </span>
                  <StatusPill status="Normal" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 3. PSI/SSI (OD/OE) */}
          <div className="bg-[#F8FAFE] rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <Target className="w-6 h-6 text-[#1A73E8] shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-[#112338]">
                3. PSI/SSI (OD/OE)
              </h2>
            </div>

            <div className="space-y-3 pt-1 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="h-8 flex-1 rounded-lg bg-[#E4ECF9] border border-blue-200/80" />
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[#112338] font-medium">OD:</span>
                  <span className="text-base font-extrabold text-[#112338]">
                    90%
                  </span>
                  <StatusPill status="Normal" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="h-8 flex-1 rounded-lg bg-[#E4ECF9] border border-blue-200/80" />
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[#112338] font-medium">OE:</span>
                  <span className="text-base font-extrabold text-[#112338]">
                    85%
                  </span>
                  <StatusPill status="Normal" />
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
                <span className="text-xs text-slate-600">Média: 1,75 ms</span>
              </div>
              <StatusPill status="Normal" />
            </div>
          </div>

          {/* Card 5: Ordenação Temporal (Freq / Duração) */}
          <div className="bg-[#F8FAFE] rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <Clock className="w-6 h-6 text-[#1A73E8] shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-[#112338]">
                4.2. Ordenação Temporal (Frequência e Duração)
              </h2>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="h-8 w-28 rounded-lg bg-[#E4ECF9] border border-blue-200/80 hidden sm:block" />
                <div className="flex items-center justify-between flex-1 sm:justify-end space-x-3">
                  <span className="text-[#112338] font-medium">
                    Padrão de Freq.:
                  </span>
                  <span className="text-base font-extrabold text-[#112338]">
                    95%
                  </span>
                  <StatusPill status="Normal" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="h-8 w-28 rounded-lg bg-[#E4ECF9] border border-blue-200/80 hidden sm:block" />
                <div className="flex items-center justify-between flex-1 sm:justify-end space-x-3">
                  <span className="text-[#112338] font-medium">
                    Padrão de Duração:
                  </span>
                  <span className="text-base font-extrabold text-[#112338]">
                    95%
                  </span>
                  <StatusPill status="Normal" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: 2 Independent Cards for TDD and SSW ([BUG 04]) */}
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
                      97,5%
                    </span>
                    <StatusPill status="Normal" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#112338] font-medium">OE:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-[#112338]">
                      97,5%
                    </span>
                    <StatusPill status="Normal" />
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
                      95%
                    </span>
                    <StatusPill status="Normal" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#112338] font-medium">OE:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-[#112338]">
                      100%
                    </span>
                    <StatusPill status="Normal" />
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
                      90%
                    </span>
                    <StatusPill status="Normal" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#112338] font-medium">EC (OE):</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-[#112338]">
                      97,5%
                    </span>
                    <StatusPill status="Normal" />
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
                      NS
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-[#112338] font-medium">
                      Auditivo:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCE7F9] text-[#112338] font-extrabold">
                      NS
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-[#112338] font-medium">
                      Inversões:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCE7F9] text-[#112338] font-extrabold">
                      0 (NS)
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="text-[#112338] font-medium">Tipo A:</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#DCE7F9] text-[#112338] font-extrabold">
                      1 (NS)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Centered Delete Confirmation Modal Overlay */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-[1px] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-7 space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-7 h-7 text-red-600 shrink-0 fill-red-600/10" />
                <h3 className="text-lg font-extrabold text-[#112338]">
                  Excluir Avaliação Permanentemente?
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
