import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AudioWaveform,
  Clock,
  Headphones,
  Mic,
  BarChart2,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore } from "@/lib/pac-store";

export const Route = createFileRoute("/protocolos/processamento-temporal")({
  component: Protocol4ProcessamentoTemporal,
});

const INTERVALOS_RGDT = [10, 40, 15, 5, 0, 25, 20, 2, 30];

function Protocol4ProcessamentoTemporal() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();

  // Frequencia Auditec
  const [freqView, setFreqView] = useState<"rapido" | "grade">("rapido");
  const [freqHumming, setFreqHumming] = useState(store.temporal.freqHumming);
  const [freqNomeacao, setFreqNomeacao] = useState(store.temporal.freqNomeacao);

  // Duracao Auditec
  const [durView, setDurView] = useState<"rapido" | "grade">("rapido");
  const [durHumming, setDurHumming] = useState(store.temporal.durHumming);
  const [durNomeacao, setDurNomeacao] = useState(store.temporal.durNomeacao);

  // RGDT Limiares
  const [rgdt500, setRgdt500] = useState(store.temporal.rgdt[500]);
  const [rgdt1000, setRgdt1000] = useState(store.temporal.rgdt[1000]);
  const [rgdt2000, setRgdt2000] = useState(store.temporal.rgdt[2000]);
  const [rgdt4000, setRgdt4000] = useState(store.temporal.rgdt[4000]);

  // Selected gap buttons in matrix (for visual match with screenshot)
  const [selectedGaps, setSelectedGaps] = useState<Record<string, number>>({
    "500": 5,
    "1000": 0,
    "2000": 0,
    "4000": 2,
  });

  // Calculations
  const freqHummingPct = Math.round((freqHumming / 10) * 100);
  const freqNomeacaoPct = Math.round((freqNomeacao / 10) * 100);
  const durHummingPct = Math.round((durHumming / 10) * 100);
  const durNomeacaoPct = Math.round((durNomeacao / 10) * 100);

  const freqHummingNormal = freqHummingPct >= 90;
  const freqNomeacaoNormal = freqNomeacaoPct >= 90;
  const durHummingNormal = durHummingPct >= 90;
  const durNomeacaoNormal = durNomeacaoPct >= 83;

  const rgdtMedia = (rgdt500 + rgdt1000 + rgdt2000 + rgdt4000) / 4;
  const rgdtNormal = rgdtMedia <= 10;

  function handleGapSelect(freq: string, val: number) {
    setSelectedGaps((prev) => ({ ...prev, [freq]: val }));
  }

  function handleNext() {
    setStore((prev) => ({
      ...prev,
      temporal: {
        freqHumming,
        freqNomeacao,
        durHumming,
        durNomeacao,
        rgdt: {
          500: rgdt500,
          1000: rgdt1000,
          2000: rgdt2000,
          4000: rgdt4000,
        },
      },
    }));
    void navigate({ to: "/protocolos/psi-ssi" });
  }

  return (
    <ClinicalLayout
      currentProtocol={4}
      protocolNumber={4}
      title="Processamento Temporal - Frequência, Duração e RGDT"
      subtitle="Avalie a habilidade de processamento temporal, registrando os acertos nos padrões de frequência, duração e no teste de resolução temporal (RGDT)."
      backHref="/protocolos/tdd"
    >
      <div className="space-y-6">
        {/* Top Row: 2 Auditec Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Padrão de Frequência */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <AudioWaveform className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Padrão de Frequência - Auditec
              </h2>
            </div>

            {/* View Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFreqView("rapido")}
                className={`py-1.5 rounded-lg transition cursor-pointer ${
                  freqView === "rapido"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Modo Rápido (% direto)
              </button>
              <button
                type="button"
                onClick={() => setFreqView("grade")}
                className={`py-1.5 rounded-lg transition cursor-pointer ${
                  freqView === "grade"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Grade de 30 Itens (AAG, AGG / CCL, CLL)
              </button>
            </div>

            {/* Subcard 1: Humming */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Headphones className="w-4 h-4 text-blue-600" />
                <span>Humming (Murmúrio) - Binaural</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Ref: ≥ 90%)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span>Acertos</span>
                  <input
                    type="number"
                    value={freqHumming}
                    onChange={(e) => setFreqHumming(Number(e.target.value))}
                    className="w-14 px-2 py-1 text-center font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
                  />
                  <span>/ 10</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold text-slate-900">
                    {freqHummingPct}%
                  </span>
                  <span
                    className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                      freqHummingNormal
                        ? "bg-emerald-600 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{freqHummingNormal ? "Normal" : "Alterado"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Subcard 2: Nomeação */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Mic className="w-4 h-4 text-blue-600" />
                <span>Nomeação - Binaural</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Ref: ≥ 90%)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span>Acertos</span>
                  <input
                    type="number"
                    value={freqNomeacao}
                    onChange={(e) => setFreqNomeacao(Number(e.target.value))}
                    className="w-14 px-2 py-1 text-center font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
                  />
                  <span>/ 10</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold text-slate-900">
                    {freqNomeacaoPct}%
                  </span>
                  <span
                    className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                      freqNomeacaoNormal
                        ? "bg-emerald-600 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {!freqNomeacaoNormal ? (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                    <span>{freqNomeacaoNormal ? "Normal" : "Alterado"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Padrão de Duração */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Padrão de Duração - Auditec
              </h2>
            </div>

            {/* View Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDurView("rapido")}
                className={`py-1.5 rounded-lg transition cursor-pointer ${
                  durView === "rapido"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Modo Rápido (% direto)
              </button>
              <button
                type="button"
                onClick={() => setDurView("grade")}
                className={`py-1.5 rounded-lg transition cursor-pointer ${
                  durView === "grade"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Grade de 30 Itens (AAG, AGG / CCL, CLL)
              </button>
            </div>

            {/* Subcard 1: Humming */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Headphones className="w-4 h-4 text-blue-600" />
                <span>Humming (Murmúrio) - Binaural</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Ref: ≥ 90%)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span>Acertos</span>
                  <input
                    type="number"
                    value={durHumming}
                    onChange={(e) => setDurHumming(Number(e.target.value))}
                    className="w-14 px-2 py-1 text-center font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
                  />
                  <span>/ 10</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold text-slate-900">
                    {durHummingPct}%
                  </span>
                  <span
                    className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                      durHummingNormal
                        ? "bg-emerald-600 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{durHummingNormal ? "Normal" : "Alterado"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Subcard 2: Nomeação */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Mic className="w-4 h-4 text-blue-600" />
                <span>Nomeação - Binaural</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Ref: ≥ 83%)
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span>Acertos</span>
                  <input
                    type="number"
                    value={durNomeacao}
                    onChange={(e) => setDurNomeacao(Number(e.target.value))}
                    className="w-14 px-2 py-1 text-center font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
                  />
                  <span>/ 10</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold text-slate-900">
                    {durNomeacaoPct}%
                  </span>
                  <span
                    className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                      durNomeacaoNormal
                        ? "bg-emerald-600 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {!durNomeacaoNormal ? (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                    <span>{durNomeacaoNormal ? "Normal" : "Alterado"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: RGDT Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <AudioWaveform className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Resolução Temporal - RGDT (Random Gap Detection)
              </h2>
              <p className="text-xs text-slate-500">
                Selecione o número de estímulos percebidos em cada intervalo (1
                ou 2) conforme o protocolo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
            {/* Table Area (9 cols) */}
            <div className="xl:col-span-9 overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="p-3 font-semibold w-24">Frequência</th>
                    <th
                      colSpan={9}
                      className="p-3 font-semibold text-center border-l border-r border-slate-200"
                    >
                      Intervalos (ms) - Ordem do Protocolo
                    </th>
                    <th className="p-3 font-semibold text-center w-28">
                      Limiar Detectado
                    </th>
                  </tr>
                  <tr className="bg-slate-50/50 text-slate-500 text-[10px] border-b border-slate-200 text-center">
                    <th></th>
                    {INTERVALOS_RGDT.map((_, i) => (
                      <th key={i} className="py-1 px-1.5 font-medium">
                        {i + 1}º
                      </th>
                    ))}
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    {
                      freq: "500 Hz",
                      key: "500",
                      val: rgdt500,
                      setVal: setRgdt500,
                    },
                    {
                      freq: "1000 Hz",
                      key: "1000",
                      val: rgdt1000,
                      setVal: setRgdt1000,
                    },
                    {
                      freq: "2000 Hz",
                      key: "2000",
                      val: rgdt2000,
                      setVal: setRgdt2000,
                    },
                    {
                      freq: "4000 Hz",
                      key: "4000",
                      val: rgdt4000,
                      setVal: setRgdt4000,
                    },
                  ].map((row) => (
                    <tr key={row.key} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">
                        {row.freq}
                      </td>
                      {INTERVALOS_RGDT.map((gap, i) => {
                        const isSelected = selectedGaps[row.key] === gap;
                        return (
                          <td key={i} className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                handleGapSelect(row.key, gap);
                                row.setVal(gap);
                              }}
                              className={`w-7 h-7 rounded text-[11px] font-bold transition border cursor-pointer ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {gap}
                            </button>
                          </td>
                        );
                      })}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <input
                            type="number"
                            value={row.val}
                            onChange={(e) => row.setVal(Number(e.target.value))}
                            className="w-14 px-1 py-1 text-center font-bold text-slate-800 border border-slate-200 rounded-lg bg-slate-50 text-xs"
                          />
                          <span className="text-[10px] text-slate-400">ms</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Result Block (3 cols) */}
            <div className="xl:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>Resultados</span>
              </div>

              <div>
                <div className="text-xs text-slate-500 font-medium">
                  Média Final
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  {rgdtMedia.toFixed(2).replace(".", ",")} ms
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  (Ref: ≤ 10 ms)
                </div>
              </div>

              <span
                className={`w-full max-w-[160px] py-2 rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs ${
                  rgdtNormal
                    ? "bg-emerald-600 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Normal</span>
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
            O RGDT avalia a resolução temporal auditiva. Quanto menor o limiar,
            melhor o desempenho.
          </span>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => void navigate({ to: "/protocolos/tdd" })}
            className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            ← Voltar
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <span>Próximo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ClinicalLayout>
  );
}
