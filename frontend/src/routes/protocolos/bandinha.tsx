import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Target,
  Brain,
  AudioWaveform,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  User,
  AlertCircle,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { ProtocolObservations } from "@/components/layout/ProtocolObservations";
import { usePacStore } from "@/lib/pac-store";
import {
  evaluateBandinhaLocalizacao,
  evaluateBandinhaMemoria,
} from "@/lib/normative-engine";

export const Route = createFileRoute("/protocolos/bandinha")({
  component: Protocol1Bandinha,
});

function Protocol1Bandinha() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();

  const [localizacao, setLocalizacao] = useState(store.bandinha.localizacao);
  const [memNaoVerbal, setMemNaoVerbal] = useState<[boolean, boolean, boolean]>(
    store.bandinha.memoriaNaoVerbal,
  );
  const [memVerbal, setMemVerbal] = useState<[boolean, boolean, boolean]>(
    store.bandinha.memoriaVerbal,
  );
  const [observacoes, setObservacoes] = useState(
    store.bandinha.observacoes || "",
  );

  const locCount = Object.values(localizacao).filter(Boolean).length;
  const locNorm = evaluateBandinhaLocalizacao(
    locCount,
    localizacao.direita,
    localizacao.esquerda,
  );
  const locNormal = locNorm.status === "Normal";

  const mnvCount = memNaoVerbal.filter(Boolean).length;
  const mnvNorm = evaluateBandinhaMemoria(mnvCount);
  const mnvNormal = mnvNorm.status === "Normal";

  const mvCount = memVerbal.filter(Boolean).length;
  const mvNorm = evaluateBandinhaMemoria(mvCount);
  const mvNormal = mvNorm.status === "Normal";

  function toggleLoc(key: keyof typeof localizacao) {
    setLocalizacao((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleNext() {
    setStore((prev) => ({
      ...prev,
      bandinha: {
        localizacao,
        memoriaNaoVerbal: memNaoVerbal,
        memoriaVerbal: memVerbal,
        observacoes,
      },
    }));
    void navigate({ to: "/laudo" });
  }

  return (
    <ClinicalLayout
      currentProtocol={6}
      protocolNumber={6}
      title="Testes Dióticos - Bandinha"
      subtitle="Avalie as habilidades de localização sonora e memória sequencial (não verbal e verbal) através dos testes dióticos com a bandinha."
      backHref="/protocolos/psi-ssi"
      showProtocolStepper={true}
    >
      {/* 3 Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Localização Sonora */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                1. Localização Sonora - Olhos Fechados
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Identifique de onde vem o som. Selecione as direções corretas.
            </p>

            {/* 5 Direction Buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-2">
              <button
                type="button"
                onClick={() => toggleLoc("direita")}
                className={`relative py-3 px-1 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition border cursor-pointer ${
                  localizacao.direita
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {localizacao.direita && (
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white text-blue-600 flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </span>
                )}
                <ArrowRight className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Direita</span>
              </button>

              <button
                type="button"
                onClick={() => toggleLoc("esquerda")}
                className={`relative py-3 px-1 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition border cursor-pointer ${
                  localizacao.esquerda
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {localizacao.esquerda && (
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white text-blue-600 flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </span>
                )}
                <ArrowLeft className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Esquerda</span>
              </button>

              <button
                type="button"
                onClick={() => toggleLoc("acima")}
                className={`relative py-3 px-1 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition border cursor-pointer ${
                  localizacao.acima
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {localizacao.acima && (
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white text-blue-600 flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </span>
                )}
                <ArrowUp className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Acima</span>
              </button>

              <button
                type="button"
                onClick={() => toggleLoc("frente")}
                className={`relative py-3 px-1 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition border cursor-pointer ${
                  localizacao.frente
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {localizacao.frente && (
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white text-blue-600 flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </span>
                )}
                <User className="w-4 h-4 mb-1" />
                <span className="text-[11px] whitespace-nowrap">À Frente</span>
              </button>

              <button
                type="button"
                onClick={() => toggleLoc("atras")}
                className={`relative py-3 px-1 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition border cursor-pointer ${
                  localizacao.atras
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {localizacao.atras && (
                  <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white text-blue-600 flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </span>
                )}
                <ArrowDown className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Atrás</span>
              </button>
            </div>
          </div>

          {/* Result Subcard */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </span>
                <span>Acertos</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {locCount}/5
              </div>
            </div>
            <div>
              <span
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                  locNormal
                    ? "bg-emerald-600 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {locNormal ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 stroke-[3]" />
                )}
                <span>{locNorm.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Memória Não Verbal */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                2. Memória Sequencial Não Verbal - 4 Instrumentos
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Registre se o paciente acertou ou errou cada tentativa da
              sequência instrumental.
            </p>

            {/* 3 Sequences */}
            <div className="space-y-2 pt-2">
              {[
                "1. Guizo - Coco - Sino - Agogô",
                "2. Coco - Guizo - Sino - Agogô",
                "3. Sino - Guizo - Agogô - Coco",
              ].map((item, idx) => {
                const isCorrect = memNaoVerbal[idx];
                return (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50/60 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      {item}
                    </span>
                    <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...memNaoVerbal] as [
                            boolean,
                            boolean,
                            boolean,
                          ];
                          updated[idx] = true;
                          setMemNaoVerbal(updated);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center space-x-1 cursor-pointer ${
                          isCorrect
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Acerto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...memNaoVerbal] as [
                            boolean,
                            boolean,
                            boolean,
                          ];
                          updated[idx] = false;
                          setMemNaoVerbal(updated);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center space-x-1 cursor-pointer ${
                          !isCorrect
                            ? "bg-red-50 text-red-600 border-red-300"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <X className="w-3 h-3" />
                        <span>Erro</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result Subcard */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </span>
                <span>Total de acertos</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {mnvCount}/3
              </div>
            </div>
            <div>
              <span
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                  mnvNormal
                    ? "bg-emerald-600 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {mnvNormal ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 stroke-[3]" />
                )}
                <span>{mnvNorm.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Memória Verbal */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <AudioWaveform className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                3. Memória Sequencial Verbal - 4 Sons
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Registre se o paciente acertou ou errou cada sequência silábica.
            </p>

            {/* 3 Sequences */}
            <div className="space-y-2 pt-2">
              {[
                "1. PA - TA - CA - FA",
                "2. TA - PA - CA - FA",
                "3. CA - TA - PA - TA",
              ].map((item, idx) => {
                const isCorrect = memVerbal[idx];
                return (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-700">
                      {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...memVerbal] as [
                          boolean,
                          boolean,
                          boolean,
                        ];
                        updated[idx] = !isCorrect;
                        setMemVerbal(updated);
                      }}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                        isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full bg-white transition ${
                          isCorrect ? "ml-auto" : "mr-auto"
                        }`}
                      ></span>
                      <span>{isCorrect ? "Acerto" : "Erro"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result Subcard */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </span>
                <span>Total de acertos</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {mvCount}/3
              </div>
            </div>
            <div>
              <span
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                  mvNormal
                    ? "bg-emerald-600 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {mvNormal ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 stroke-[3]" />
                )}
                <span>{mvNorm.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Observações do Fonoaudiólogo */}
      <ProtocolObservations value={observacoes} onChange={setObservacoes} />

      {/* Bottom Footer Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => void navigate({ to: "/protocolos/psi-ssi" })}
          className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
        >
          ← Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <span>Gerar Laudo Final (PDF)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </ClinicalLayout>
  );
}
