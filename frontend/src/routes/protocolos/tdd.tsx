import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Brain, Target, Check, AlertCircle, ArrowRight } from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { ProtocolObservations } from "@/components/layout/ProtocolObservations";
import { computeEvaluationSummary, usePacStore } from "@/lib/pac-store";

export const Route = createFileRoute("/protocolos/tdd")({
  component: Protocol5TDD,
});

const DIGITS = [4, 5, 7, 8, 9];

function seedErrorMap(
  count: number,
  maxItems: number,
): Record<string, boolean> {
  const safeCount = Math.max(0, Math.min(maxItems, Math.round(count)));
  const map: Record<string, boolean> = {};
  for (let i = 0; i < safeCount; i += 1) {
    const row = Math.floor(i / DIGITS.length) + 1;
    const digit = DIGITS[i % DIGITS.length];
    const key = row <= 10 ? `${row}-${digit}` : `manual-${i}`;
    map[key] = true;
  }
  return map;
}

function clampIntensity(val: number): number {
  return Number.isFinite(val) ? Math.max(0, Math.min(120, Math.round(val))) : 0;
}

function adjustErrorMap(
  prev: Record<string, boolean>,
  delta: number,
  maxItems: number,
): Record<string, boolean> {
  const activeKeys = Object.keys(prev).filter((k) => prev[k]);
  if (delta > 0) {
    if (activeKeys.length >= maxItems) return prev;
    let idx = 0;
    while (prev[`manual-${idx}`]) idx += 1;
    return { ...prev, [`manual-${idx}`]: true };
  }
  const lastKey = activeKeys[activeKeys.length - 1];
  if (!lastKey) return prev;
  return { ...prev, [lastKey]: false };
}

function DigitTable({
  errors,
  onErrorToggle,
  errorCount,
  onAdjustError,
  totalItems,
}: {
  errors: Record<string, boolean>;
  onErrorToggle: (key: string) => void;
  errorCount: number;
  onAdjustError: (delta: number) => void;
  totalItems: 40 | 20;
}) {
  return (
    <div className="flex items-start gap-2 border border-slate-200 rounded-xl p-2.5 bg-slate-50/40">
      <div className="flex-1 min-w-0 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="pb-1 font-semibold text-[10px]">Dígito</th>
              <th className="pb-1 font-semibold text-[10px]">
                Marcar erro (clique)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((row) => (
              <tr key={row}>
                <td className="py-1 font-bold text-slate-700 w-8">{row}</td>
                <td className="py-1">
                  <div className="flex items-center space-x-1">
                    {DIGITS.map((d) => {
                      const key = `${row}-${d}`;
                      const isMarked = !!errors[key];
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => onErrorToggle(key)}
                          className={`w-5 h-5 rounded text-[10px] font-bold transition border cursor-pointer ${
                            isMarked
                              ? "bg-red-500 text-white border-red-500"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Erros counter box */}
      <div className="w-16 bg-white border border-slate-200 rounded-lg p-2 flex flex-col items-center justify-center shrink-0">
        <span className="text-[10px] font-semibold text-slate-500">Erros</span>
        <div className="flex items-center space-x-1 my-1.5">
          <button
            type="button"
            onClick={() => onAdjustError(-1)}
            className="w-4 h-4 rounded bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
          >
            -
          </button>
          <span className="text-xs font-bold text-slate-800">{errorCount}</span>
          <button
            type="button"
            onClick={() => onAdjustError(1)}
            className="w-4 h-4 rounded bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
          >
            +
          </button>
        </div>
        <span className="text-[9px] text-slate-400 font-medium">
          / {totalItems}
        </span>
      </div>
    </div>
  );
}

function Protocol5TDD() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();

  // Integracao
  const [integOdIntensidade, setIntegOdIntensidade] = useState(
    store.tdd.integracao.odIntensidade,
  );
  const [integOeIntensidade, setIntegOeIntensidade] = useState(
    store.tdd.integracao.oeIntensidade,
  );
  const [integOdErrors, setIntegOdErrors] = useState<Record<string, boolean>>(
    () => seedErrorMap(store.tdd.integracao.odErrors, 40),
  );
  const [integOeErrors, setIntegOeErrors] = useState<Record<string, boolean>>(
    () => seedErrorMap(store.tdd.integracao.oeErrors, 40),
  );

  // Separacao
  const [sepOdIntensidade, setSepOdIntensidade] = useState(
    store.tdd.separacao.odIntensidade,
  );
  const [sepOeIntensidade, setSepOeIntensidade] = useState(
    store.tdd.separacao.oeIntensidade,
  );
  const [sepOdErrors, setSepOdErrors] = useState<Record<string, boolean>>(() =>
    seedErrorMap(store.tdd.separacao.odErrors, 20),
  );
  const [sepOeErrors, setSepOeErrors] = useState<Record<string, boolean>>(() =>
    seedErrorMap(store.tdd.separacao.oeErrors, 20),
  );
  const [observacoes, setObservacoes] = useState(store.tdd.observacoes || "");

  const integOdCount = Object.values(integOdErrors).filter(Boolean).length;
  const integOeCount = Object.values(integOeErrors).filter(Boolean).length;
  const sepOdCount = Object.values(sepOdErrors).filter(Boolean).length;
  const sepOeCount = Object.values(sepOeErrors).filter(Boolean).length;

  const summary = computeEvaluationSummary({
    ...store,
    tdd: {
      integracao: {
        odIntensidade: integOdIntensidade,
        odErrors: integOdCount,
        oeIntensidade: integOeIntensidade,
        oeErrors: integOeCount,
      },
      separacao: {
        odIntensidade: sepOdIntensidade,
        odErrors: sepOdCount,
        oeIntensidade: sepOeIntensidade,
        oeErrors: sepOeCount,
      },
      observacoes,
    },
  });

  const integOdPercent = summary.tdd.integOd;
  const integOePercent = summary.tdd.integOe;
  const sepOdPercent = summary.tdd.sepOd;
  const sepOePercent = summary.tdd.sepOe;

  const integOdNorm = { status: summary.tdd.integOdStatus };
  const integOeNorm = { status: summary.tdd.integOeStatus };
  const sepOdNorm = { status: summary.tdd.sepOdStatus };
  const sepOeNorm = { status: summary.tdd.sepOeStatus };

  function toggleIntegOd(key: string) {
    setIntegOdErrors((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  function toggleIntegOe(key: string) {
    setIntegOeErrors((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  function toggleSepOd(key: string) {
    setSepOdErrors((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  function toggleSepOe(key: string) {
    setSepOeErrors((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    setStore((prev) => ({
      ...prev,
      tdd: {
        integracao: {
          odIntensidade: integOdIntensidade,
          odErrors: integOdCount,
          oeIntensidade: integOeIntensidade,
          oeErrors: integOeCount,
        },
        separacao: {
          odIntensidade: sepOdIntensidade,
          odErrors: sepOdCount,
          oeIntensidade: sepOeIntensidade,
          oeErrors: sepOeCount,
        },
        observacoes,
      },
    }));
  }, [
    integOdIntensidade,
    integOdCount,
    integOeIntensidade,
    integOeCount,
    sepOdIntensidade,
    sepOdCount,
    sepOeIntensidade,
    sepOeCount,
    observacoes,
    setStore,
  ]);

  function handleNext() {
    setStore((prev) => ({
      ...prev,
      tdd: {
        integracao: {
          odIntensidade: integOdIntensidade,
          odErrors: integOdCount,
          oeIntensidade: integOeIntensidade,
          oeErrors: integOeCount,
        },
        separacao: {
          odIntensidade: sepOdIntensidade,
          odErrors: sepOdCount,
          oeIntensidade: sepOeIntensidade,
          oeErrors: sepOeCount,
        },
        observacoes,
      },
    }));
    void navigate({ to: "/protocolos/ssw" });
  }

  return (
    <ClinicalLayout
      currentProtocol={2}
      protocolNumber={2}
      title="Teste Dicótico de Dígitos (TDD)"
      subtitle="Registre os erros na matriz de dígitos nas etapas de integração e separação binaural."
      backHref="/protocolos/fala-no-ruido"
      showProtocolStepper={true}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Section 1: Integracao Binaural */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                4.1.1 Tarefa de Atenção Livre - Integração Binaural
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Orelha Direita (OD)
                </span>
                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-[10px] text-slate-400">
                    Intensidade:
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={integOdIntensidade}
                    onChange={(e) =>
                      setIntegOdIntensidade(
                        clampIntensity(Number(e.target.value)),
                      )
                    }
                    className="w-12 px-1 text-center font-bold text-slate-800 border border-slate-200 rounded bg-slate-50 text-xs"
                  />
                  <span className="text-[10px] text-slate-400">dB</span>
                </div>
              </div>

              <DigitTable
                errors={integOdErrors}
                onErrorToggle={toggleIntegOd}
                errorCount={integOdCount}
                onAdjustError={(delta) =>
                  setIntegOdErrors((prev) => adjustErrorMap(prev, delta, 40))
                }
                totalItems={40}
              />

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Resultado - OD
                  </div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">
                    {integOdPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">de acertos</div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      integOdNorm.status === "Normal"
                        ? "bg-emerald-600 text-white"
                        : integOdNorm.status === "Alterado"
                          ? "bg-red-500 text-white"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {integOdNorm.status === "Normal" ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : integOdNorm.status === "Alterado" ? (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    ) : null}
                    <span>{integOdNorm.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* OE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Orelha Esquerda (OE)
                </span>
                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-[10px] text-slate-400">
                    Intensidade:
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={integOeIntensidade}
                    onChange={(e) =>
                      setIntegOeIntensidade(
                        clampIntensity(Number(e.target.value)),
                      )
                    }
                    className="w-12 px-1 text-center font-bold text-slate-800 border border-slate-200 rounded bg-slate-50 text-xs"
                  />
                  <span className="text-[10px] text-slate-400">dB</span>
                </div>
              </div>

              <DigitTable
                errors={integOeErrors}
                onErrorToggle={toggleIntegOe}
                errorCount={integOeCount}
                onAdjustError={(delta) =>
                  setIntegOeErrors((prev) => adjustErrorMap(prev, delta, 40))
                }
                totalItems={40}
              />

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Resultado - OE
                  </div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">
                    {integOePercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">de acertos</div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      integOeNorm.status === "Normal"
                        ? "bg-emerald-600 text-white"
                        : integOeNorm.status === "Alterado"
                          ? "bg-red-500 text-white"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {integOeNorm.status === "Normal" ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : integOeNorm.status === "Alterado" ? (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    ) : null}
                    <span>{integOeNorm.status}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Separacao Binaural */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                4.1.2 Tarefa de Atenção Direcionada - Separação Binaural
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Orelha Direita (OD)
                </span>
                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-[10px] text-slate-400">
                    Intensidade:
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={sepOdIntensidade}
                    onChange={(e) =>
                      setSepOdIntensidade(
                        clampIntensity(Number(e.target.value)),
                      )
                    }
                    className="w-12 px-1 text-center font-bold text-slate-800 border border-slate-200 rounded bg-slate-50 text-xs"
                  />
                  <span className="text-[10px] text-slate-400">dB</span>
                </div>
              </div>

              <DigitTable
                errors={sepOdErrors}
                onErrorToggle={toggleSepOd}
                errorCount={sepOdCount}
                onAdjustError={(delta) =>
                  setSepOdErrors((prev) => adjustErrorMap(prev, delta, 20))
                }
                totalItems={20}
              />

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Resultado - OD
                  </div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">
                    {sepOdPercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">de acertos</div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sepOdNorm.status === "Normal"
                        ? "bg-emerald-600 text-white"
                        : sepOdNorm.status === "Alterado"
                          ? "bg-red-500 text-white"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {sepOdNorm.status === "Normal" ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : sepOdNorm.status === "Alterado" ? (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    ) : null}
                    <span>{sepOdNorm.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* OE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Orelha Esquerda (OE)
                </span>
                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-[10px] text-slate-400">
                    Intensidade:
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={sepOeIntensidade}
                    onChange={(e) =>
                      setSepOeIntensidade(
                        clampIntensity(Number(e.target.value)),
                      )
                    }
                    className="w-12 px-1 text-center font-bold text-slate-800 border border-slate-200 rounded bg-slate-50 text-xs"
                  />
                  <span className="text-[10px] text-slate-400">dB</span>
                </div>
              </div>

              <DigitTable
                errors={sepOeErrors}
                onErrorToggle={toggleSepOe}
                errorCount={sepOeCount}
                onAdjustError={(delta) =>
                  setSepOeErrors((prev) => adjustErrorMap(prev, delta, 20))
                }
                totalItems={20}
              />

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Resultado - OE
                  </div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">
                    {sepOePercent}%
                  </div>
                  <div className="text-[10px] text-slate-500">de acertos</div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sepOeNorm.status === "Normal"
                        ? "bg-emerald-600 text-white"
                        : sepOeNorm.status === "Alterado"
                          ? "bg-red-500 text-white"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {sepOeNorm.status === "Normal" ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : sepOeNorm.status === "Alterado" ? (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    ) : null}
                    <span>{sepOeNorm.status}</span>
                  </span>
                </div>
              </div>
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
          onClick={() => void navigate({ to: "/protocolos/fala-no-ruido" })}
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
