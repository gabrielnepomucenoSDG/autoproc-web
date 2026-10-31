import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  User,
  Calendar,
  Check,
  ChevronRight,
} from "lucide-react";
import { usePacStore } from "@/lib/pac-store";

export const Route = createFileRoute("/_authenticated/")({
  component: Screen1PatientIdentification,
});

function Screen1PatientIdentification() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();

  const [formData, setFormData] = useState({
    name: store.patient.name,
    age: store.patient.age,
    date: store.patient.date,
    examiner: store.patient.examiner,
    referral: store.patient.referral,
    selectedTests: [...store.patient.selectedTests],
  });

  const availableTests = [
    { id: "1. Bandinha", label: "1. Bandinha", route: "/protocolos/bandinha" },
    {
      id: "2. Fala no Ruído",
      label: "2. Fala no Ruído",
      route: "/protocolos/fala-no-ruido",
    },
    { id: "3. PSI/SSI", label: "3. PSI/SSI", route: "/protocolos/psi-ssi" },
    {
      id: "4. Processamento Temporal/RGDT",
      label: "4. Processamento Temporal/RGDT",
      route: "/protocolos/processamento-temporal",
    },
    { id: "5. TDD", label: "5. TDD", route: "/protocolos/tdd" },
    { id: "6. SSW", label: "6. SSW", route: "/protocolos/ssw" },
  ];

  function toggleTest(id: string) {
    setFormData((prev) => {
      const exists = prev.selectedTests.includes(id);
      return {
        ...prev,
        selectedTests: exists
          ? prev.selectedTests.filter((t) => t !== id)
          : [...prev.selectedTests, id],
      };
    });
  }

  function handleStartEvaluation() {
    setStore((prev) => ({
      ...prev,
      patient: {
        ...prev.patient,
        ...formData,
      },
    }));
    void navigate({ to: "/protocolos/bandinha" });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-blue-600">
            <span className="w-1 h-3.5 bg-blue-600 rounded-full inline-block"></span>
            <span className="w-1 h-5 bg-blue-600 rounded-full inline-block"></span>
            <span className="w-1 h-2.5 bg-blue-600 rounded-full inline-block"></span>
            <span className="w-1 h-6 bg-blue-600 rounded-full inline-block"></span>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            PAC Digital
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Stepper */}
        <div className="w-full flex items-center justify-center pt-2">
          <div className="flex items-center w-full max-w-2xl justify-between relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center z-10">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-blue-600 mt-2">
                1. Identificação
              </span>
            </div>

            {/* Connecting line 1-2 */}
            <div className="absolute top-3.5 left-12 right-3/4 h-0.5 bg-blue-600 -z-0"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center z-10">
              <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-semibold">
                2.
              </div>
              <span className="text-xs text-slate-500 font-medium mt-2">
                2. Protocolos
              </span>
            </div>

            {/* Connecting line 2-3 */}
            <div className="absolute top-3.5 left-1/3 right-1/2 h-0.5 bg-slate-200 -z-0"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center z-10">
              <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-semibold">
                3.
              </div>
              <span className="text-xs text-slate-500 font-medium mt-2">
                3. SSW
              </span>
            </div>

            {/* Connecting line 3-4 */}
            <div className="absolute top-3.5 left-2/3 right-12 h-0.5 bg-slate-200 -z-0"></div>

            {/* Step 4 */}
            <div className="flex flex-col items-center z-10">
              <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-semibold">
                4.
              </div>
              <span className="text-xs text-slate-500 font-medium mt-2">
                4. Laudo
              </span>
            </div>
          </div>
        </div>

        {/* Identification Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 w-full space-y-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Identificação do Paciente e Nova Avaliação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nome do Paciente */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nome do Paciente
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Idade (anos) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Idade (anos)
              </label>
              <input
                type="text"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50/50 border border-blue-500 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            {/* Data da Avaliação */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Data da Avaliação
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Fonoaudióloga Avaliadora */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Fonoaudióloga Avaliadora (Nome e CRFa)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.examiner}
                  onChange={(e) =>
                    setFormData({ ...formData, examiner: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Encaminhado por */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">
                Encaminhado por (Médico/Profissional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.referral}
                  onChange={(e) =>
                    setFormData({ ...formData, referral: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Bateria de Testes */}
          <div className="space-y-3 pt-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bateria de Testes
              </h3>
              <p className="text-xs text-slate-500">
                Selecione os testes que serão aplicados:
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {availableTests.map((t) => {
                const isSelected = formData.selectedTests.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTest(t.id)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px] ${
                        isSelected
                          ? "bg-white text-blue-600"
                          : "border border-slate-300"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="w-full flex items-center justify-end space-x-3 pt-2 pb-6">
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleStartEvaluation}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <span>Iniciar Avaliação</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
