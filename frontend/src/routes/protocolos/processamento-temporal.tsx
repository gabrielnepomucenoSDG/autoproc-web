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
import { ProtocolObservations } from "@/components/layout/ProtocolObservations";
import { usePacStore } from "@/lib/pac-store";
import {
  evaluateTemporalAuditec,
  evaluateRgdt,
  type NormativeResult,
} from "@/lib/normative-engine";

export const Route = createFileRoute("/protocolos/processamento-temporal")({
  component: Protocol4ProcessamentoTemporal,
});

const INTERVALOS_RGDT = [10, 40, 15, 5, 0, 25, 20, 2, 30];

const PADROES_FREQUENCIA_30 = [
  "AAG", "AGG", "GAA", "GGA", "AGA", "GAG",
  "AGG", "GAA", "AAG", "GAG", "GGA", "AGA",
  "AAG", "GGA", "GAA", "AGA", "AGG", "GAG",
  "GAA", "AAG", "GGA", "AGG", "AGA", "GAG",
  "GAA", "AAG", "AGA", "GGA", "AGG", "GAG",
];

const PADROES_DURACAO_30 = [
  "CCL", "CLL", "LCC", "LLC", "CLC", "LCL",
  "CLL", "LCC", "CCL", "LCL", "LLC", "CLC",
  "CCL", "LLC", "LCC", "CLC", "CLL", "LCL",
  "LCC", "CCL", "LLC", "CLL", "CLC", "LCL",
  "LCC", "CCL", "CLC", "LLC", "CLL", "LCL",
];

function AuditecSubcard({
  title,
  icon: IconComp,
  viewMode,
  quickScore,
  onQuickScoreChange,
  pct,
  norm,
  patterns,
  gridItems,
  onToggleGridItem,
  onResetGrid,
}: {
  title: string;
  icon: typeof Headphones;
  viewMode: "rapido" | "grade";
  quickScore: number;
  onQuickScoreChange: (val: number) => void;
  pct: number;
  norm: NormativeResult;
  patterns: string[];
  gridItems: boolean[];
  onToggleGridItem: (idx: number) => void;
  onResetGrid: (val: boolean) => void;
}) {
  const correctCount = gridItems.filter(Boolean).length;

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
        <IconComp className="w-4 h-4 text-blue-600" />
        <span>{title}</span>
      </div>
      <div className="flex items-center justify-between pt-1">
        {viewMode === "rapido" ? (
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span>Acertos</span>
            <input
              type="number"
              min={0}
              max={10}
              value={quickScore}
              onChange={(e) => onQuickScoreChange(Number(e.target.value))}
              className="w-14 px-2 py-1 text-center font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
            />
            <span>/ 10</span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-slate-600">
            Acertos na grade: <strong>{correctCount}</strong> / 30
          </span>
        )}
        <div className="flex items-center space-x-3">
          <span className="text-base font-bold text-slate-900">{pct}%</span>
          <span
            className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
              norm.status === "Normal"
                ? "bg-emerald-600 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {norm.status === "Normal" ? (
              <Check className="w-3 h-3 stroke-[3]" />
            ) : (
              <AlertCircle className="w-3 h-3 stroke-[3]" />
            )}
            <span>{norm.status}</span>
          </span>
        </div>
      </div>

      {viewMode === "grade" && (
        <div className="space-y-2 pt-2 border-t border-slate-200/70">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Clique nos itens com <strong className="text-red-600">erro</strong>{" "}
              ({correctCount}/30 acertos)
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onResetGrid(true)}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Todos Acertos
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onResetGrid(false)}
                className="text-slate-500 hover:underline cursor-pointer"
              >
                Zerar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
            {patterns.map((pat, idx) => {
              const isCorrect = gridItems[idx] ?? true;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onToggleGridItem(idx)}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition flex items-center justify-center space-x-1 cursor-pointer ${
                    isCorrect
                      ? "bg-white border-slate-200 text-slate-700 hover:bg-blue-50/50"
                      : "bg-red-50 border-red-300 text-red-600 shadow-2xs"
                  }`}
                >
                  <span className="text-[9px] text-slate-400 font-normal">
                    {idx + 1}.
                  </span>
                  <span>{pat}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Protocol4ProcessamentoTemporal() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();

  const [freqView, setFreqView] = useState<"rapido" | "grade">("rapido");
  const [freqHumming, setFreqHumming] = useState(store.temporal.freqHumming);
  const [freqNomeacao, setFreqNomeacao] = useState(store.temporal.freqNomeacao);
  const [freqHummingGrid, setFreqHummingGrid] = useState<boolean[]>(
    store.temporal.freqHummingGrid?.length === 30
      ? store.temporal.freqHummingGrid
      : Array.from({ length: 30 }, () => true),
  );
  const [freqNomeacaoGrid, setFreqNomeacaoGrid] = useState<boolean[]>(
    store.temporal.freqNomeacaoGrid?.length === 30
      ? store.temporal.freqNomeacaoGrid
      : Array.from({ length: 30 }, (_, i) => i < 27),
  );

  const [durView, setDurView] = useState<"rapido" | "grade">("rapido");
  const [durHumming, setDurHumming] = useState(store.temporal.durHumming);
  const [durNomeacao, setDurNomeacao] = useState(store.temporal.durNomeacao);
  const [durHummingGrid, setDurHummingGrid] = useState<boolean[]>(
    store.temporal.durHummingGrid?.length === 30
      ? store.temporal.durHummingGrid
      : Array.from({ length: 30 }, () => true),
  );
  const [durNomeacaoGrid, setDurNomeacaoGrid] = useState<boolean[]>(
    store.temporal.durNomeacaoGrid?.length === 30
      ? store.temporal.durNomeacaoGrid
      : Array.from({ length: 30 }, (_, i) => i < 27),
  );

  const [rgdt500, setRgdt500] = useState(store.temporal.rgdt[500]);
  const [rgdt1000, setRgdt1000] = useState(store.temporal.rgdt[1000]);
  const [rgdt2000, setRgdt2000] = useState(store.temporal.rgdt[2000]);
  const [rgdt4000, setRgdt4000] = useState(store.temporal.rgdt[4000]);
  const [observacoes, setObservacoes] = useState(
    store.temporal.observacoes || "",
  );

  const [selectedGaps, setSelectedGaps] = useState<Record<string, number>>({
    "500": store.temporal.rgdt[500],
    "1000": store.temporal.rgdt[1000],
    "2000": store.temporal.rgdt[2000],
    "4000": store.temporal.rgdt[4000],
  });

  const freqHummingPct =
    freqView === "grade"
      ? Math.round((freqHummingGrid.filter(Boolean).length / 30) * 100)
      : Math.round((freqHumming / 10) * 100);
  const freqNomeacaoPct =
    freqView === "grade"
      ? Math.round((freqNomeacaoGrid.filter(Boolean).length / 30) * 100)
      : Math.round((freqNomeacao / 10) * 100);
  const durHummingPct =
    durView === "grade"
      ? Math.round((durHummingGrid.filter(Boolean).length / 30) * 100)
      : Math.round((durHumming / 10) * 100);
  const durNomeacaoPct =
    durView === "grade"
      ? Math.round((durNomeacaoGrid.filter(Boolean).length / 30) * 100)
      : Math.round((durNomeacao / 10) * 100);

  const freqHummingNorm = evaluateTemporalAuditec("freqHumming", freqHummingPct);
  const freqNomeacaoNorm = evaluateTemporalAuditec(
    "freqNomeacao",
    freqNomeacaoPct,
  );
  const durHummingNorm = evaluateTemporalAuditec("durHumming", durHummingPct);
  const durNomeacaoNorm = evaluateTemporalAuditec(
    "durNomeacao",
    durNomeacaoPct,
  );

  const rgdtEval = evaluateRgdt({
    500: rgdt500,
    1000: rgdt1000,
    2000: rgdt2000,
    4000: rgdt4000,
  });

  function toggleGridItem(
    grid: boolean[],
    setGrid: React.Dispatch<React.SetStateAction<boolean[]>>,
    setQuickScore: React.Dispatch<React.SetStateAction<number>>,
    idx: number,
  ) {
    const next = [...grid];
    next[idx] = !next[idx];
    setGrid(next);
    setQuickScore(Math.round((next.filter(Boolean).length / 30) * 10));
  }

  function resetGrid(
    setGrid: React.Dispatch<React.SetStateAction<boolean[]>>,
    setQuickScore: React.Dispatch<React.SetStateAction<number>>,
    val: boolean,
  ) {
    const next = Array.from({ length: 30 }, () => val);
    setGrid(next);
    setQuickScore(val ? 10 : 0);
  }

  function handleNext() {
    setStore((prev) => ({
      ...prev,
      temporal: {
        freqHumming,
        freqNomeacao,
        durHumming,
        durNomeacao,
        freqHummingGrid,
        freqNomeacaoGrid,
        durHummingGrid,
        durNomeacaoGrid,
        rgdt: {
          500: rgdt500,
          1000: rgdt1000,
          2000: rgdt2000,
          4000: rgdt4000,
        },
        observacoes,
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
      backHref="/protocolos/ssw"
      showProtocolStepper={true}
    >
      <div className="space-y-6">
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
                Grade de 30 Itens (AAG, AGG)
              </button>
            </div>

            <AuditecSubcard
              title="Humming (Murmúrio) - Binaural"
              icon={Headphones}
              viewMode={freqView}
              quickScore={freqHumming}
              onQuickScoreChange={setFreqHumming}
              pct={freqHummingPct}
              norm={freqHummingNorm}
              patterns={PADROES_FREQUENCIA_30}
              gridItems={freqHummingGrid}
              onToggleGridItem={(idx) =>
                toggleGridItem(
                  freqHummingGrid,
                  setFreqHummingGrid,
                  setFreqHumming,
                  idx,
                )
              }
              onResetGrid={(val) =>
                resetGrid(setFreqHummingGrid, setFreqHumming, val)
              }
            />

            <AuditecSubcard
              title="Nomeação - Binaural"
              icon={Mic}
              viewMode={freqView}
              quickScore={freqNomeacao}
              onQuickScoreChange={setFreqNomeacao}
              pct={freqNomeacaoPct}
              norm={freqNomeacaoNorm}
              patterns={PADROES_FREQUENCIA_30}
              gridItems={freqNomeacaoGrid}
              onToggleGridItem={(idx) =>
                toggleGridItem(
                  freqNomeacaoGrid,
                  setFreqNomeacaoGrid,
                  setFreqNomeacao,
                  idx,
                )
              }
              onResetGrid={(val) =>
                resetGrid(setFreqNomeacaoGrid, setFreqNomeacao, val)
              }
            />
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
                Grade de 30 Itens (CCL, CLL)
              </button>
            </div>

            <AuditecSubcard
              title="Humming (Murmúrio) - Binaural"
              icon={Headphones}
              viewMode={durView}
              quickScore={durHumming}
              onQuickScoreChange={setDurHumming}
              pct={durHummingPct}
              norm={durHummingNorm}
              patterns={PADROES_DURACAO_30}
              gridItems={durHummingGrid}
              onToggleGridItem={(idx) =>
                toggleGridItem(
                  durHummingGrid,
                  setDurHummingGrid,
                  setDurHumming,
                  idx,
                )
              }
              onResetGrid={(val) =>
                resetGrid(setDurHummingGrid, setDurHumming, val)
              }
            />

            <AuditecSubcard
              title="Nomeação - Binaural"
              icon={Mic}
              viewMode={durView}
              quickScore={durNomeacao}
              onQuickScoreChange={setDurNomeacao}
              pct={durNomeacaoPct}
              norm={durNomeacaoNorm}
              patterns={PADROES_DURACAO_30}
              gridItems={durNomeacaoGrid}
              onToggleGridItem={(idx) =>
                toggleGridItem(
                  durNomeacaoGrid,
                  setDurNomeacaoGrid,
                  setDurNomeacao,
                  idx,
                )
              }
              onResetGrid={(val) =>
                resetGrid(setDurNomeacaoGrid, setDurNomeacao, val)
              }
            />
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
                Selecione o menor intervalo (ms) em que o paciente percebeu 2
                estímulos consistentemente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
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
                                setSelectedGaps((prev) => ({
                                  ...prev,
                                  [row.key]: gap,
                                }));
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
                  {rgdtEval.media.toFixed(2).replace(".", ",")} ms
                </div>
              </div>

              <span
                className={`w-full max-w-[160px] py-2 rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs ${
                  rgdtEval.status === "Normal"
                    ? "bg-emerald-600 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {rgdtEval.status === "Normal" ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <AlertCircle className="w-4 h-4 stroke-[3]" />
                )}
                <span>{rgdtEval.status}</span>
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
          onClick={() => void navigate({ to: "/protocolos/ssw" })}
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
    </ClinicalLayout>
  );
}
