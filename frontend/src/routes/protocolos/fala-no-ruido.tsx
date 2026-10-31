import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Headphones,
  Check,
  AlertCircle,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore } from "@/lib/pac-store";

export const Route = createFileRoute("/protocolos/fala-no-ruido")({
  component: Protocol2FalaNoRuido,
});

const MONOSSILABOS = [
  "TIL", "JAZ", "ROL", "PUS", "FAZ",
  "BOL", "VAS", "DEG", "TOS", "LUZ",
  "MAR", "JEM", "CAZ", "DOR", "GIL",
  "PED", "TUC", "FEN", "RON", "SIX",
  "ZIN", "VEL", "BAI", "LAT", "NUF",
];

function Protocol2FalaNoRuido() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();

  const [odIntensidade, setOdIntensidade] = useState(store.falaNoRuido.od.intensidade);
  const [odIprf, setOdIprf] = useState(store.falaNoRuido.od.iprfGravacao);
  const [odErrors, setOdErrors] = useState<number[]>(store.falaNoRuido.od.erros);

  const [oeIntensidade, setOeIntensidade] = useState(store.falaNoRuido.oe.intensidade);
  const [oeIprf, setOeIprf] = useState(store.falaNoRuido.oe.iprfGravacao);
  const [oeErrors, setOeErrors] = useState<number[]>(store.falaNoRuido.oe.erros);

  // Calculations:
  // Fala com ruído = 100 - (errors * 4)
  const odFalaRuido = Math.max(0, 100 - odErrors.length * 4);
  const oeFalaRuido = Math.max(0, 100 - oeErrors.length * 4);

  // Diferença IPRF vs FR
  const odDiff = Math.abs(odIprf - odFalaRuido);
  const oeDiff = Math.abs(oeIprf - oeFalaRuido);

  // Normal if diff < 20%
  const odDiffNormal = odDiff < 20;
  const oeDiffNormal = oeDiff < 20;

  function toggleErrorOd(index: number) {
    setOdErrors((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  function toggleErrorOe(index: number) {
    setOeErrors((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  function handleNext() {
    setStore((prev) => ({
      ...prev,
      falaNoRuido: {
        od: { intensidade: odIntensidade, iprfGravacao: odIprf, erros: odErrors },
        oe: { intensidade: oeIntensidade, iprfGravacao: oeIprf, erros: oeErrors },
      },
    }));
    void navigate({ to: "/protocolos/tdd" });
  }

  return (
    <ClinicalLayout
      currentProtocol={2}
      protocolNumber={2}
      title="Fala no Ruído (IPRF / FR) - Revisado"
      subtitle="Registre os percentuais de acertos no IPRF e na fala com ruído. Cada erro apontado equivale a -4%."
      backHref="/protocolos/bandinha"
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Card 1: OD */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          {/* Card Header */}
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Orelha Direita (OD) - Lista D1
              </h2>
            </div>
          </div>

          {/* Top Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Intensidade (dB)
              </label>
              <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50/50">
                <input
                  type="number"
                  value={odIntensidade}
                  onChange={(e) => setOdIntensidade(Number(e.target.value))}
                  className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  % IPRF com Gravação
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  (Ref: ≥ 88%)
                </span>
              </div>
              <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50/50">
                <input
                  type="number"
                  value={odIprf}
                  onChange={(e) => setOdIprf(Number(e.target.value))}
                  className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grid + Error Counter */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* 5x5 Grid */}
            <div className="grid grid-cols-5 gap-1.5 flex-1 w-full">
              {MONOSSILABOS.map((word, idx) => {
                const isError = odErrors.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleErrorOd(idx)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition border cursor-pointer ${
                      isError
                        ? "bg-red-50 border-red-300 text-red-600 shadow-2xs"
                        : "bg-blue-50/40 border-blue-200/80 text-blue-900 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-normal mr-0.5">
                      {idx + 1}.
                    </span>{" "}
                    {word}
                  </button>
                );
              })}
            </div>

            {/* Erros Counter Box */}
            <div className="sm:w-20 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center shrink-0 self-stretch sm:self-auto">
              <span className="text-xs font-semibold text-slate-600">Erros</span>
              <div className="flex items-center space-x-2 my-2">
                <button
                  type="button"
                  onClick={() => {
                    if (odErrors.length > 0) {
                      setOdErrors((prev) => prev.slice(0, -1));
                    }
                  }}
                  className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-base font-bold text-slate-900">
                  {odErrors.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (odErrors.length < 25) {
                      const nextUnselected = MONOSSILABOS.findIndex(
                        (_, i) => !odErrors.includes(i)
                      );
                      if (nextUnselected !== -1) {
                        setOdErrors((prev) => [...prev, nextUnselected]);
                      }
                    }
                  }}
                  className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                / 25 ({Math.round((odErrors.length / 25) * 100)}%)
              </span>
            </div>
          </div>

          {/* Resultados - OD */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Resultados - OD</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* IPRF Gravação */}
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">IPRF Gravação</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-slate-900">
                    {odIprf}%
                  </span>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Normal</span>
                  </span>
                </div>
              </div>

              {/* Fala com Ruído */}
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Fala com Ruído</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-slate-900">
                    {odFalaRuido}%
                  </span>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Normal</span>
                  </span>
                </div>
              </div>

              {/* Diferença IPRF vs FR */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-600">Diferença IPRF vs FR</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {odDiff}%
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      (Ref: &lt; 20%)
                    </span>
                  </div>
                  <span
                    className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                      odDiffNormal
                        ? "bg-emerald-600 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {!odDiffNormal ? (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                    <span>{odDiffNormal ? "Normal" : "Alterado"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: OE */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          {/* Card Header */}
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Orelha Esquerda (OE) - Lista D2
              </h2>
            </div>
          </div>

          {/* Top Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Intensidade (dB)
              </label>
              <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50/50">
                <input
                  type="number"
                  value={oeIntensidade}
                  onChange={(e) => setOeIntensidade(Number(e.target.value))}
                  className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  % IPRF com Gravação
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  (Ref: ≥ 88%)
                </span>
              </div>
              <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50/50">
                <input
                  type="number"
                  value={oeIprf}
                  onChange={(e) => setOeIprf(Number(e.target.value))}
                  className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grid + Error Counter */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* 5x5 Grid */}
            <div className="grid grid-cols-5 gap-1.5 flex-1 w-full">
              {MONOSSILABOS.map((word, idx) => {
                const isError = oeErrors.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleErrorOe(idx)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition border cursor-pointer ${
                      isError
                        ? "bg-red-50 border-red-300 text-red-600 shadow-2xs"
                        : "bg-blue-50/40 border-blue-200/80 text-blue-900 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-normal mr-0.5">
                      {idx + 1}.
                    </span>{" "}
                    {word}
                  </button>
                );
              })}
            </div>

            {/* Erros Counter Box */}
            <div className="sm:w-20 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center shrink-0 self-stretch sm:self-auto">
              <span className="text-xs font-semibold text-slate-600">Erros</span>
              <div className="flex items-center space-x-2 my-2">
                <button
                  type="button"
                  onClick={() => {
                    if (oeErrors.length > 0) {
                      setOeErrors((prev) => prev.slice(0, -1));
                    }
                  }}
                  className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-base font-bold text-slate-900">
                  {oeErrors.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (oeErrors.length < 25) {
                      const nextUnselected = MONOSSILABOS.findIndex(
                        (_, i) => !oeErrors.includes(i)
                      );
                      if (nextUnselected !== -1) {
                        setOeErrors((prev) => [...prev, nextUnselected]);
                      }
                    }
                  }}
                  className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                / 25 ({Math.round((oeErrors.length / 25) * 100)}%)
              </span>
            </div>
          </div>

          {/* Resultados - OE */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Resultados - OE</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* IPRF Gravação */}
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">IPRF Gravação</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-slate-900">
                    {oeIprf}%
                  </span>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Normal</span>
                  </span>
                </div>
              </div>

              {/* Fala com Ruído */}
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Fala com Ruído</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-slate-900">
                    {oeFalaRuido}%
                  </span>
                  <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Normal</span>
                  </span>
                </div>
              </div>

              {/* Diferença IPRF vs FR */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-600">Diferença IPRF vs FR</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {oeDiff}%
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      (Ref: &lt; 20%)
                    </span>
                  </div>
                  <span
                    className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                      oeDiffNormal
                        ? "bg-emerald-600 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {!oeDiffNormal ? (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                    <span>{oeDiffNormal ? "Normal" : "Alterado"}</span>
                  </span>
                </div>
              </div>
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
            Cada erro na lista de monossílabos equivale a -4% no cálculo da fala com ruído.
          </span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm cursor-pointer self-end sm:self-auto"
        >
          <span>Salvar e Avançar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </ClinicalLayout>
  );
}
