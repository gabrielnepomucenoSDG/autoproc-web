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
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore } from "@/lib/pac-store";

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

  const locCount = Object.values(localizacao).filter(Boolean).length;
  // Rule: >= 4/5 AND right & left correct
  const locNormal =
    locCount >= 4 && localizacao.direita && localizacao.esquerda;

  const mnvCount = memNaoVerbal.filter(Boolean).length;
  const mnvNormal = mnvCount >= 2;

  const mvCount = memVerbal.filter(Boolean).length;
  const mvNormal = mvCount >= 2;

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
      },
    }));
    void navigate({ to: "/protocolos/fala-no-ruido" });
  }

  return (
    <ClinicalLayout
      currentProtocol={1}
      protocolNumber={1}
      title="Testes Dióticos - Bandinha"
      subtitle="Avalie as habilidades de localização sonora e memória sequencial (não verbal e verbal) através dos testes dióticos com a bandinha."
      backHref="/"
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
              Identifique de onde vem o som. Selecione a direção correta.
            </p>

            {/* 5 Direction Buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-2">
              {/* Direita */}
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

              {/* Esquerda */}
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

              {/* Acima */}
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

              {/* À Frente */}
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

              {/* Atrás */}
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

            {/* Info callout */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-slate-600">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                i
              </div>
              <p className="leading-snug">
                <strong>Critério:</strong> ≥ 4/5 acertos (obrigatório acertar
                Direita e Esquerda).
              </p>
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
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{locNormal ? "Normal" : "Alterado"}</span>
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
              Memorize a sequência de sons e selecione se acertou ou errou em
              cada tentativa.
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
              <div className="text-[10px] text-slate-500">
                (Referência ≥ 2/3)
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
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{mnvNormal ? "Normal" : "Alterado"}</span>
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
              Memorize a sequência de sons e selecione se acertou ou errou em
              cada tentativa.
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
              <div className="text-[10px] text-slate-500">
                (Referência ≥ 2/3)
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
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{mvNormal ? "Normal" : "Alterado"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
            i
          </div>
          <span>
            Cada tentativa correta vale 1 ponto. O teste só é considerado válido
            se o critério de acertos for atingido em cada etapa.
          </span>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => void navigate({ to: "/" })}
            className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            ← Voltar
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <span>Próximo Protocolo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ClinicalLayout>
  );
}
