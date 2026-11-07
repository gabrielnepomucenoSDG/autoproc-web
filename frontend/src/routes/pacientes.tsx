import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Search,
  FileText,
  Play,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore, type PatientRecord } from "@/lib/pac-store";
import { getTodayBR } from "@/lib/normative-engine";

export const Route = createFileRoute("/pacientes")({
  component: Tela04ListaPacientes,
});

type AgeGroupFilter = "all" | "criancas" | "adultos" | "idosos";

function Tela04ListaPacientes() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroupFilter>("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "9",
    referral: "",
    clinicalNotes: "",
  });

  const filteredPatients = store.patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.referral.toLowerCase().includes(q);

    let matchesAge = true;
    if (ageGroup === "criancas") {
      matchesAge = p.age >= 5 && p.age <= 8;
    } else if (ageGroup === "adultos") {
      matchesAge = p.age >= 9 && p.age < 60;
    } else if (ageGroup === "idosos") {
      matchesAge = p.age >= 60;
    }

    return matchesSearch && matchesAge;
  });

  function handleOpenProntuario(p: PatientRecord) {
    setStore((prev) => ({
      ...prev,
      activePatientId: p.id,
      patient: {
        ...prev.patient,
        name: p.name,
        age: p.ageLabel,
        referral: p.referral,
      },
    }));
    void navigate({ to: "/prontuario" });
  }

  function handleStartNewExam(p: PatientRecord) {
    setStore((prev) => ({
      ...prev,
      sidebarOpen: false,
      activePatientId: p.id,
      patient: {
        ...prev.patient,
        name: p.name,
        age: p.ageLabel,
        birthDate: p.birthDate,
        date: getTodayBR(),
        referral: p.referral,
      },
    }));
    void navigate({ to: "/nova-avaliacao" });
  }

  function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    if (!newPatient.name.trim()) return;
    const numericAge = Number.parseInt(newPatient.age, 10) || 9;
    const created: PatientRecord = {
      id: `pac-${Date.now()}`,
      name: newPatient.name.trim(),
      age: numericAge,
      ageLabel: `${numericAge} anos`,
      birthDate: "10/05/2017",
      referral: newPatient.referral.trim() || "Demanda Espontânea",
      lastEvaluationDate: "—",
      totalExams: 0,
      clinicalNotes:
        newPatient.clinicalNotes.trim() ||
        "Paciente recém-cadastrado para avaliação do Processamento Auditivo Central.",
    };
    setStore((prev) => ({
      ...prev,
      patients: [created, ...prev.patients],
      activePatientId: created.id,
    }));
    setNewPatient({ name: "", age: "9", referral: "", clinicalNotes: "" });
    setShowNewModal(false);
  }

  return (
    <ClinicalLayout hidePageHeader={true}>
      <div className="space-y-6">
        {/* Top Header: Bold Title "Meus Pacientes" + Solid Royal Blue Button "+ Cadastrar Paciente" */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#112338] tracking-tight">
              Meus Pacientes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Gerencie o cadastro clínico, histórico longitudinal e prontuários
              de Processamento Auditivo Central.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-sm font-bold flex items-center space-x-2 shadow-sm transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Cadastrar Paciente</span>
          </button>
        </div>

        {/* Filter Card: Search Input + Selectable Age Group Filter Chips */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome do paciente ou médico..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Selectable Filter Chips for Age Groups */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">
              Faixa Etária:
            </span>
            {[
              { id: "all" as const, label: "Todos" },
              { id: "criancas" as const, label: "Crianças (5-8 anos)" },
              { id: "adultos" as const, label: "9+ anos / Adultos" },
              { id: "idosos" as const, label: "Idosos (60+)" },
            ].map((chip) => {
              const active = ageGroup === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setAgeGroup(chip.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    active
                      ? "bg-[#1A73E8] text-white border-[#1A73E8] shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main White Card with High-Contrast Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EBF1F8] text-[#112338] text-xs sm:text-sm font-bold border-b border-slate-200">
                  <th className="py-4 px-6">Nome do Paciente</th>
                  <th className="py-4 px-4 w-32">Idade Atual</th>
                  <th className="py-4 px-5">Encaminhado por</th>
                  <th className="py-4 px-5 w-40">Última Avaliação</th>
                  <th className="py-4 px-4 text-center w-36">
                    Total de Exames
                  </th>
                  <th className="py-4 px-6 text-right w-64">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    {/* Nome do Paciente in Bold Font */}
                    <td className="py-4 px-6 font-bold text-[#112338]">
                      <button
                        type="button"
                        onClick={() => handleOpenProntuario(patient)}
                        className="hover:text-blue-600 hover:underline text-left cursor-pointer"
                      >
                        {patient.name}
                      </button>
                    </td>

                    {/* Idade Atual */}
                    <td className="py-4 px-4 text-slate-700">
                      {patient.ageLabel}
                    </td>

                    {/* Encaminhado por */}
                    <td className="py-4 px-5 text-slate-700">
                      {patient.referral}
                    </td>

                    {/* Última Avaliação */}
                    <td className="py-4 px-5 text-slate-700 font-medium">
                      {patient.lastEvaluationDate}
                    </td>

                    {/* Total de Exames */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {patient.totalExams}{" "}
                        {patient.totalExams === 1 ? "exame" : "exames"}
                      </span>
                    </td>

                    {/* Right-most Action Column */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenProntuario(patient)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-[#1A73E8] text-[#1A73E8] hover:bg-blue-50 text-xs font-semibold transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver Prontuário</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartNewExam(patient)}
                          title="Iniciar Novo Exame"
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-[#1A73E8] text-[#1A73E8] hover:text-white border border-blue-200 text-xs font-semibold transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span className="hidden xl:inline">
                            Iniciar Novo Exame
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clean Pagination Controls at Bottom Right */}
          <div className="px-6 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs sm:text-sm text-slate-600">
            <div>
              Exibindo <strong>{filteredPatients.length}</strong> de{" "}
              <strong>51</strong> pacientes cadastrados
            </div>

            <div className="flex items-center space-x-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3, 4].map((page) => (
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
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(4, currentPage + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Cadastrar Novo Paciente */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Cadastrar Novo Paciente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Nome Completo do Paciente
                  </label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, name: e.target.value })
                    }
                    placeholder="Ex: Maria Fernanda Torres"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Idade (anos)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={100}
                    value={newPatient.age}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, age: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Encaminhado por (Médico / Especialista)
                </label>
                <input
                  type="text"
                  value={newPatient.referral}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, referral: e.target.value })
                  }
                  placeholder="Ex: Dra. Marcela Filgueiras Antunes"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Anamnese / Observações Clínicas
                </label>
                <textarea
                  rows={3}
                  value={newPatient.clinicalNotes}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      clinicalNotes: e.target.value,
                    })
                  }
                  placeholder="Queixa auditiva principal, histórico escolar ou audiológico..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ClinicalLayout>
  );
}
