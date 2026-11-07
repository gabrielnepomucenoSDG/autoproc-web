import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  ChevronRight,
  ChevronLeft,
  Clock,
  Search,
  ChevronsUpDown,
  Lock,
  Eye,
  Copy,
  Trash2,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore, type EvaluationRecord } from "@/lib/pac-store";
import { getTodayBR } from "@/lib/normative-engine";

export const Route = createFileRoute("/_authenticated/")({
  component: Tela03DashboardAvaliacoes,
});

function Tela03DashboardAvaliacoes() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "finalizada" | "rascunho"
  >("all");
  const [deleteTarget, setDeleteTarget] = useState<EvaluationRecord | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEvaluations = store.evaluations.filter((ev) => {
    const matchesStatus = statusFilter === "all" || ev.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;
    const statusText =
      ev.status === "finalizada" ? "salva finalizada" : "rascunho";
    return (
      matchesStatus &&
      (ev.patientName.toLowerCase().includes(q) ||
        ev.date.toLowerCase().includes(q) ||
        statusText.includes(q))
    );
  });

  const displayedEvaluations = filteredEvaluations.slice(0, 6);

  function handleViewEvaluation(ev: EvaluationRecord) {
    const foundPatient = store.patients.find((p) => p.id === ev.patientId);
    setStore((prev) => ({
      ...prev,
      activeEvaluationId: ev.id,
      activePatientId: ev.patientId,
      patient: {
        ...prev.patient,
        name: ev.patientName,
        age: ev.ageLabel,
        birthDate: foundPatient?.birthDate || prev.patient.birthDate,
        date: ev.date,
        referral: ev.referral,
      },
    }));
    void navigate({ to: "/avaliacao-visualizar" });
  }

  function handleResumeDraft(ev: EvaluationRecord) {
    const foundPatient = store.patients.find((p) => p.id === ev.patientId);
    setStore((prev) => ({
      ...prev,
      sidebarOpen: true,
      activeEvaluationId: ev.id,
      activePatientId: ev.patientId,
      patient: {
        ...prev.patient,
        name: ev.patientName,
        age: ev.ageLabel,
        birthDate: foundPatient?.birthDate || prev.patient.birthDate,
        date: ev.date,
        referral: ev.referral,
      },
    }));
    void navigate({ to: "/protocolos/fala-no-ruido" });
  }

  function handleCloneEvaluation(ev: EvaluationRecord) {
    const foundPatient = store.patients.find((p) => p.id === ev.patientId);
    setStore((prev) => ({
      ...prev,
      sidebarOpen: false,
      activePatientId: ev.patientId,
      evaluations: prev.evaluations.map((item) =>
        item.id === ev.id && item.status === "finalizada"
          ? { ...item, rectified: true }
          : item,
      ),
      patient: {
        ...prev.patient,
        name: ev.patientName,
        age: ev.ageLabel,
        birthDate: foundPatient?.birthDate || prev.patient.birthDate,
        date: getTodayBR(),
        referral: ev.referral,
      },
    }));
    void navigate({ to: "/nova-avaliacao" });
  }

  function handleConfirmDelete() {
    if (!deleteTarget || deleteTarget.status !== "rascunho") return;
    setStore((prev) => ({
      ...prev,
      evaluations: prev.evaluations.filter((e) => e.id !== deleteTarget.id),
    }));
    setDeleteTarget(null);
  }

  return (
    <ClinicalLayout hidePageHeader={true}>
      <div className="space-y-6">
        {/* Top 3 Operational Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Avaliações Concluídas (Imutáveis) */}
          <div
            onClick={() =>
              setStatusFilter(
                statusFilter === "finalizada" ? "all" : "finalizada",
              )
            }
            className={`bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-[#1A73E8] shadow-xs p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition ${
              statusFilter === "finalizada" ? "ring-2 ring-blue-500/20" : ""
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-blue-100/80 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8 text-[#1A73E8]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#112338] leading-snug">
                  Avaliações Concluídas
                  <br />
                  (Imutáveis)
                </div>
                <div className="text-4xl font-extrabold text-[#112338] mt-1 tracking-tight">
                  48
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 self-end mb-1" />
          </div>

          {/* Card 2: Rascunhos em Andamento */}
          <div
            onClick={() =>
              setStatusFilter(statusFilter === "rascunho" ? "all" : "rascunho")
            }
            className={`bg-[#FFFDF7] rounded-2xl border border-amber-200/80 border-l-4 border-l-amber-500 shadow-xs p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition ${
              statusFilter === "rascunho" ? "ring-2 ring-amber-500/20" : ""
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-amber-100/80 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#112338] leading-snug">
                  Rascunhos em Andamento
                </div>
                <div className="text-4xl font-extrabold text-[#112338] mt-3 tracking-tight">
                  3
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 self-end mb-1" />
          </div>

          {/* Card 3: Total de Pacientes */}
          <div
            onClick={() => void navigate({ to: "/pacientes" })}
            className="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-teal-500 shadow-xs p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-teal-100/80 flex items-center justify-center shrink-0">
                <Users className="w-8 h-8 text-[#112338]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#112338] leading-snug">
                  Total de Pacientes
                </div>
                <div className="text-4xl font-extrabold text-[#112338] mt-3 tracking-tight">
                  51
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 self-end mb-1" />
          </div>
        </div>

        {/* Main Table Container: Histórico Recente de Avaliações */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Card Header with Title & Search Input */}
          <div className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-[#1A73E8]" />
              <h2 className="text-lg font-bold text-[#112338]">
                Histórico Recente de Avaliações
              </h2>
              {statusFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  (Limpar filtro)
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por paciente, data ou status..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Dense Evaluation History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EBF1F8] text-[#112338] text-xs sm:text-sm font-bold border-b border-slate-200">
                  <th className="py-3.5 px-6 border-r border-slate-200/70">
                    <div className="inline-flex items-center space-x-1.5 cursor-pointer">
                      <span>Paciente</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 border-r border-slate-200/70 w-28">
                    <div className="inline-flex items-center space-x-1.5 cursor-pointer">
                      <span>Idade</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </th>
                  <th className="py-3.5 px-5 border-r border-slate-200/70 w-44">
                    <div className="inline-flex items-center space-x-1.5 cursor-pointer">
                      <span>Data da Avaliação</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </th>
                  <th className="py-3.5 px-5 border-r border-slate-200/70 w-52">
                    <div className="inline-flex items-center space-x-1.5 cursor-pointer">
                      <span>Status</span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                  </th>
                  <th className="py-3.5 px-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {displayedEvaluations.map((ev) => {
                  const isSaved = ev.status === "finalizada";
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition">
                      {/* Primary Key in Bold */}
                      <td className="py-3.5 px-6 font-bold text-[#112338] border-r border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setStore((prev) => ({
                              ...prev,
                              activePatientId: ev.patientId,
                            }));
                            void navigate({ to: "/prontuario" });
                          }}
                          className="hover:text-blue-600 hover:underline text-left cursor-pointer"
                        >
                          {ev.patientName}
                        </button>
                      </td>

                      {/* Regular Data Columns */}
                      <td className="py-3.5 px-4 font-normal text-slate-800 border-r border-slate-100">
                        {ev.ageLabel}
                      </td>
                      <td className="py-3.5 px-5 font-normal text-slate-800 border-r border-slate-100">
                        {ev.date}
                      </td>

                      {/* Semantic Status Badge */}
                      <td className="py-3.5 px-5 border-r border-slate-100">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isSaved ? (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C8F0D4] text-[#0F5132]">
                              <Lock className="w-3.5 h-3.5 text-[#15803D]" />
                              <span>Salva / Finalizada</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDE8B8] text-[#7C4A03]">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                              <span>Rascunho</span>
                            </span>
                          )}
                          {ev.rectified && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Substituído / Retificado
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {!isSaved && (
                            <button
                              type="button"
                              onClick={() => handleResumeDraft(ev)}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                            >
                              <span>Continuar Preenchimento</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleViewEvaluation(ev)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-[#1A73E8] text-[#1A73E8] hover:bg-blue-50 text-xs font-semibold transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visualizar</span>
                          </button>

                          {isSaved && (
                            <button
                              type="button"
                              onClick={() => handleCloneEvaluation(ev)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-[#1A73E8] text-[#1A73E8] hover:bg-blue-50 text-xs font-semibold transition cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Editar como Nova Avaliação</span>
                            </button>
                          )}

                          {!isSaved && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(ev)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-red-400 text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Excluir Rascunho</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs sm:text-sm text-slate-700">
            <div>
              Mostrando <strong>{displayedEvaluations.length} de 54</strong>{" "}
              avaliações
            </div>

            <div className="flex items-center space-x-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                    currentPage === page
                      ? "bg-[#1A73E8] text-white shadow-2xs"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <span className="px-1 text-slate-400">...</span>
              <button
                type="button"
                onClick={() => setCurrentPage(9)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                  currentPage === 9
                    ? "bg-[#1A73E8] text-white shadow-2xs"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                9
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(9, currentPage + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
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
              Esta ação não pode ser desfeita. O registro de avaliação de{" "}
              <strong>{deleteTarget.patientName}</strong> ({deleteTarget.date})
              será removido.
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
