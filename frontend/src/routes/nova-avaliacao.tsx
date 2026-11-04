import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  User,
  Calendar,
  Check,
  ArrowRight,
  RotateCcw,
  Sliders,
  Volume2,
  Headphones,
  Brain,
  Activity,
  Sparkles,
  Stethoscope,
  Building2,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore } from "@/lib/pac-store";

export const Route = createFileRoute("/nova-avaliacao")({
  component: ScreenNovaAvaliacao,
});

function ScreenNovaAvaliacao() {
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
    {
      id: "1. Bandinha",
      num: 1,
      name: "Testes Dióticos (Bandinha)",
      subtitle: "Localização Sonora e Memória Sequencial",
      description:
        "Localização em 5 direções e memória auditiva sequencial não verbal e verbal.",
      route: "/protocolos/bandinha",
      icon: Volume2,
    },
    {
      id: "2. Fala no Ruído",
      num: 2,
      name: "Fala no Ruído (IPRF / FR)",
      subtitle: "Fechamento Auditivo",
      description:
        "Comparação percentual entre lista de monossílabos em silêncio vs. ruído.",
      route: "/protocolos/fala-no-ruido",
      icon: Headphones,
    },
    {
      id: "3. TDD",
      num: 3,
      name: "Teste Dicótico de Dígitos (TDD)",
      subtitle: "Integração e Separação Binaural",
      description:
        "Escuta dicótica simultânea de pares de dígitos para OD e OE.",
      route: "/protocolos/tdd",
      icon: Brain,
    },
    {
      id: "4. Processamento Temporal/RGDT",
      num: 4,
      name: "Processamento Temporal (RGDT)",
      subtitle: "Ordenação e Resolução Temporal",
      description:
        "Padrão de frequência, duração e limiar de detecção de intervalos (gap).",
      route: "/protocolos/processamento-temporal",
      icon: Activity,
    },
    {
      id: "5. PSI/SSI",
      num: 5,
      name: "PSI / SSI",
      subtitle: "Figura-Fundo (Mensagem Competitiva)",
      description:
        "Identificação de frases sob mensagem ipsilateral competitiva (0, -10 e -15 dB).",
      route: "/protocolos/psi-ssi",
      icon: Sparkles,
    },
    {
      id: "6. SSW",
      num: 6,
      name: "Protocolo SSW",
      subtitle: "Dissílabos Alternados",
      description:
        "Matriz completa (A a H) com análises quantitativas e tendências qualitativas.",
      route: "/protocolos/ssw",
      icon: Sliders,
    },
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

  function selectAllTests() {
    setFormData((prev) => ({
      ...prev,
      selectedTests: availableTests.map((t) => t.id),
    }));
  }

  function clearAllTests() {
    setFormData((prev) => ({
      ...prev,
      selectedTests: [],
    }));
  }

  function handleResetToDefaults() {
    setFormData({
      name: "Maria Fernanda Torres",
      age: "9 anos",
      date: "26/10/2026",
      examiner: "Rachel Costa Façanha - CRFa 8R - 7353",
      referral: "Dra. Marcela Filgueiras Antunes",
      selectedTests: availableTests.map((t) => t.id),
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

    const firstSelected = availableTests.find((t) =>
      formData.selectedTests.includes(t.id),
    );
    void navigate({
      to: firstSelected ? firstSelected.route : "/protocolos/bandinha",
    });
  }

  return (
    <ClinicalLayout
      title="Identificação do Paciente e Nova Avaliação"
      subtitle="Preencha os dados cadastrais e selecione os protocolos que compõem a bateria clínica desta sessão."
      showPatientSummary={false}
      headerAction={
        <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs flex items-center space-x-2 text-xs text-slate-600 self-start lg:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">
              Sessão Clínica
            </div>
            <div className="font-semibold text-slate-800">Nova Avaliação</div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Card 1: Identificação do Paciente e Profissionais */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Dados Cadastrais do Paciente
              </h2>
              <p className="text-xs text-slate-500">
                Informações essenciais para identificação do laudo e definição
                dos padrões normativos de idade.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
            {/* Nome do Paciente */}
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-semibold text-slate-700">
                Nome Completo do Paciente
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
                  placeholder="Nome do paciente"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Idade (anos) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Idade (anos)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Activity className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="Ex: 9 anos"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
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
                  placeholder="DD/MM/AAAA"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Fonoaudióloga Avaliadora */}
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-semibold text-slate-700">
                Fonoaudióloga Avaliadora (Nome e CRFa)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.examiner}
                  onChange={(e) =>
                    setFormData({ ...formData, examiner: e.target.value })
                  }
                  placeholder="Dra. Nome - CRFa 0-00000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Encaminhado por */}
            <div className="space-y-1.5 lg:col-span-3">
              <label className="text-xs font-semibold text-slate-700">
                Encaminhado por (Médico / Profissional Solicitante)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.referral}
                  onChange={(e) =>
                    setFormData({ ...formData, referral: e.target.value })
                  }
                  placeholder="Dr. Nome - Especialidade"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Bateria de Protocolos */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Bateria de Protocolos Clínicos
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    {formData.selectedTests.length} de {availableTests.length}{" "}
                    ativos
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Selecione os testes que serão aplicados durante o atendimento
                  para inclusão automática no laudo.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto text-xs font-medium">
              <button
                type="button"
                onClick={selectAllTests}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              >
                Selecionar Todos
              </button>
              <button
                type="button"
                onClick={clearAllTests}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Desmarcar Todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {availableTests.map((t) => {
              const isSelected = formData.selectedTests.includes(t.id);
              const IconComp = t.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => toggleTest(t.id)}
                  className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-blue-50/40 border-blue-500 shadow-2xs ring-1 ring-blue-500/20"
                      : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {t.num}
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                          Protocolo {t.num}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">
                          {t.name}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "border border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-blue-600">
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{t.subtitle}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {t.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
              i
            </div>
            <span>
              Ao iniciar a avaliação, os dados cadastrais serão consolidados na
              sessão e você será direcionada para o primeiro protocolo
              selecionado.
            </span>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
            <button
              type="button"
              onClick={handleStartEvaluation}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <span>Iniciar Avaliação</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </ClinicalLayout>
  );
}
