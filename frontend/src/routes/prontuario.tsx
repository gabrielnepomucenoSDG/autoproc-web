import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Plus,
  User,
  Calendar,
  Stethoscope,
  FileText,
  Edit3,
  Lock,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Copy,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore, type EvaluationRecord } from "@/lib/pac-store";
import { getTodayBR } from "@/lib/normative-engine";

export const Route = createFileRoute("/prontuario")({
  component: Tela05ProntuarioPaciente,
});

function Tela05ProntuarioPaciente() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EvaluationRecord | null>(
    null,
  );

  const activePatient =
    store.patients.find((p) => p.id === store.activePatientId) ??
    store.patients[0];

  const [editForm, setEditForm] = useState({
    name: activePatient.name,
    ageLabel: activePatient.ageLabel,
    referral: activePatient.referral,
    clinicalNotes: activePatient.clinicalNotes,
  });

  const patientEvaluations = store.evaluations.filter(
    (ev) => ev.patientId === activePatient.id,
  );

  const evaluationsToDisplay =
    patientEvaluations.length > 0
      ? patientEvaluations
      : store.evaluations.slice(0, 2);

  function handleSavePatientEdit() {
    setStore((prev) => ({
      ...prev,
      patients: prev.patients.map((p) =>
        p.id === activePatient.id
          ? {
              ...p,
              name: editForm.name,
              ageLabel: editForm.ageLabel,
              referral: editForm.referral,
              clinicalNotes: editForm.clinicalNotes,
            }
          : p,
      ),
    }));
    setIsEditingPatient(false);
  }

  function handleOpenEvaluation(ev: EvaluationRecord) {
    setStore((prev) => ({
      ...prev,
      activeEvaluationId: ev.id,
      patient: {
        ...prev.patient,
        name: activePatient.name,
        age: ev.ageLabel,
        date: ev.date,
        referral: activePatient.referral,
      },
    }));
    void navigate({ to: "/avaliacao-visualizar" });
  }

  function handleCreateFromPast(ev: EvaluationRecord) {
    setStore((prev) => ({
      ...prev,
      sidebarOpen: false,
      patient: {
        ...prev.patient,
        name: activePatient.name,
        age: ev.ageLabel,
        birthDate: activePatient.birthDate,
        date: getTodayBR(),
        referral: activePatient.referral,
      },
    }));
    void navigate({ to: "/nova-avaliacao" });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    setStore((prev) => ({
      ...prev,
      evaluations: prev.evaluations.filter((e) => e.id !== deleteTarget.id),
    }));
    setDeleteTarget(null);
  }

  return (
    <ClinicalLayout hidePageHeader={true}>
      <div className="space-y-6">
        {/* Top Bar: Breadcrumb Navigation "Pacientes > Maria Fernanda Torres" + Solid Blue Button "+ Nova Avaliação do Zero" */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <nav className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-slate-500">
              <Link
                to="/pacientes"
                className="hover:text-[#1A73E8] hover:underline transition"
              >
                Pacientes
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-[#112338]">
                {activePatient.name}
              </span>
            </nav>
            <h1 className="text-xl font-bold text-[#112338] tracking-tight">
              Prontuário Eletrônico e Linha do Tempo de Avaliações
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setStore((prev) => ({
                ...prev,
                sidebarOpen: false,
                patient: {
                  ...prev.patient,
                  name: activePatient.name,
                  age: activePatient.ageLabel,
                  birthDate: activePatient.birthDate,
                  date: getTodayBR(),
                  referral: activePatient.referral,
                },
              }));
              void navigate({ to: "/nova-avaliacao" });
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-sm font-bold flex items-center space-x-2 shadow-sm transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nova Avaliação do Zero</span>
          </button>
        </div>

        {/* Main Split Area: 30% Left Column (Dados Cadastrais) & 70% Right Column (Histórico de Avaliações Salvas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (30% -> 4 of 12 cols): Dados Cadastrais */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-[#112338]">
                  Dados Cadastrais
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                Ativo
              </span>
            </div>

            {isEditingPatient ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nome do Paciente
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Idade Atual
                  </label>
                  <input
                    type="text"
                    value={editForm.ageLabel}
                    onChange={(e) =>
                      setEditForm({ ...editForm, ageLabel: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Encaminhado por
                  </label>
                  <input
                    type="text"
                    value={editForm.referral}
                    onChange={(e) =>
                      setEditForm({ ...editForm, referral: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Notas Clínicas
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.clinicalNotes}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        clinicalNotes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSavePatientEdit}
                    className="flex-1 py-2 rounded-xl bg-[#1A73E8] text-white font-bold cursor-pointer"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPatient(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Paciente
                    </div>
                    <div className="text-lg font-extrabold text-[#112338] mt-0.5">
                      {activePatient.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200/70">
                    <div className="flex items-start space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Idade Atual
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          {activePatient.ageLabel}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          Total de Exames
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          {evaluationsToDisplay.length} avaliações
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span>Encaminhado por: {activePatient.referral}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-700">
                      Anamnese / Notas Clínicas
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                      {activePatient.clinicalNotes}
                    </p>
                  </div>
                </div>

                {/* Subtle Outlined Button: Editar Cadastro */}
                <button
                  type="button"
                  onClick={() => {
                    setEditForm({
                      name: activePatient.name,
                      ageLabel: activePatient.ageLabel,
                      referral: activePatient.referral,
                      clinicalNotes: activePatient.clinicalNotes,
                    });
                    setIsEditingPatient(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-700 hover:bg-blue-50/40 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Cadastro</span>
                </button>
              </>
            )}
          </div>

          {/* Right Column (70% -> 8 of 12 cols): Histórico de Avaliações Salvas */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#112338]">
                  Histórico de Avaliações Salvas
                </h2>
                <p className="text-xs text-slate-500">
                  Linha do tempo cronológica de baterias PAC concluídas e
                  registros imutáveis do paciente.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {evaluationsToDisplay.length} registros encontrados
              </span>
            </div>

            {/* Chronological Vertical List of Exam Cards */}
            <div className="space-y-4">
              {evaluationsToDisplay.map((ev) => {
                const skillItems = [
                  {
                    label: "Fechamento Auditivo",
                    status: ev.skills.fechamentoAuditivo,
                  },
                  {
                    label: "Figura-Fundo",
                    status: ev.skills.figuraFundo,
                  },
                  {
                    label: "Integração Binaural",
                    status: ev.skills.integracaoBinaural,
                  },
                  {
                    label: "Resolução Temporal",
                    status: ev.skills.resolucaoTemporal,
                  },
                ];

                return (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-slate-200/90 bg-slate-50/30 hover:bg-white p-5 space-y-4 shadow-2xs transition"
                  >
                    {/* Card Top Header: Bold Date + Neutral Gray Pill Badge with Lock Icon */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-[#112338]">
                          Avaliação em {ev.date}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Avaliadora: {ev.examiner} • Idade na época:{" "}
                          {ev.ageLabel}
                        </p>
                      </div>

                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200/80 text-slate-700 border border-slate-300/80 self-start sm:self-auto">
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                        <span>Registro Salvo (Imutável)</span>
                      </span>
                    </div>

                    {/* Compact Grid of Auditory Skill Status Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {skillItems.map((sk) => {
                        const isNormal = sk.status === "Normal";
                        return (
                          <div
                            key={sk.label}
                            className={`px-3.5 py-2 rounded-xl border flex items-center justify-between text-xs font-bold ${
                              isNormal
                                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                                : "bg-red-50/90 border-red-200 text-red-800"
                            }`}
                          >
                            <span className="flex items-center space-x-1.5">
                              {isNormal ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                              )}
                              <span>
                                {sk.label}: {sk.status}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Solid Blue Button: Abrir Avaliação */}
                        <button
                          type="button"
                          onClick={() => handleOpenEvaluation(ev)}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Abrir Avaliação</span>
                        </button>

                        {/* Outlined Button: Alterar (Gerar Nova) */}
                        <button
                          type="button"
                          onClick={() => handleCreateFromPast(ev)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-blue-600 bg-white text-slate-700 hover:text-blue-700 text-xs font-semibold transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Alterar (Gerar Nova)</span>
                        </button>

                        {/* Outlined Button: Baixar PDF/Docx */}
                        <button
                          type="button"
                          onClick={() => void navigate({ to: "/laudo" })}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-blue-600 bg-white text-slate-700 hover:text-blue-700 text-xs font-semibold transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Baixar PDF/Docx</span>
                        </button>
                      </div>

                      {/* Semantic Red Text Button: Excluir */}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(ev)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-7 h-7 text-red-600 shrink-0" />
              <h3 className="text-lg font-bold text-[#112338]">
                Excluir Avaliação Permanentemente?
              </h3>
            </div>
            <p className="text-sm text-slate-600">
              Esta ação não pode ser desfeita. O exame de{" "}
              <strong>{deleteTarget.date}</strong> será excluído do prontuário.
            </p>
            <div className="flex items-center justify-end space-x-4 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-2 text-sm font-semibold text-[#1A73E8] hover:underline cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex items-center space-x-2 shadow-sm transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ClinicalLayout>
  );
}
