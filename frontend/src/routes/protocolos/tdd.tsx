import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Brain, Target, Check, AlertCircle, ArrowRight } from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { ProtocolObservations } from "@/components/layout/ProtocolObservations";
import { usePacStore } from "@/lib/pac-store";
import {
  evaluateTddIntegracao,
  evaluateTddSeparacao,
  parsePatientAge,
} from "@/lib/normative-engine";

export const Route = createFileRoute("/protocolos/tdd")({
  component: Protocol5TDD,
});

const DIGITS = [4, 5, 7, 8, 9];

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
      <div className="flex-1 overflow-x-auto">
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

  const patientAge = parsePatientAge(
    store.patient.age,
    store.patient.birthDate,
    store.patient.date,
  );

  // Integracao
  const [integOdIntensidade, setIntegOdIntensidade] = useState(
    store.tdd.integracao.odIntensidade,
  );
  const [integOeIntensidade, setIntegOeIntensidade] = useState(
    store.tdd.integracao.oeIntensidade,
  );
  const [integOdErrors, setIntegOdErrors] = useState<Record<string, boolean>>(
    store.tdd.integracao.odErrors > 0 ? { "1-4": true } : {},
  );
  const [integOeErrors, setIntegOeErrors] = useState<Record<string, boolean>>(
    store.tdd.integracao.oeErrors > 0 ? { "1-5": true } : {},
  );

  // Separacao
  const [sepOdIntensidade, setSepOdIntensidade] = useState(
    store.tdd.separacao.odIntensidade,
  );
  const [sepOeIntensidade, setSepOeIntensidade] = useState(
    store.tdd.separacao.oeIntensidade,
  );
  const [sepOdErrors, setSepOdErrors] = useState<Record<string, boolean>>(
    store.tdd.separacao.odErrors > 0 ? { "1-4": true } : {},
  );
  const [sepOeErrors, setSepOeErrors] = useState<Record<string, boolean>>({});
  const [observacoes, setObservacoes] = useState(store.tdd.observacoes || "");

  const integOdCount = Object.values(integOdErrors).filter(Boolean).length;
  const integOeCount = Object.values(integOeErrors).filter(Boolean).length;
  const sepOdCount = Object.values(sepOdErrors).filter(Boolean).length;
  const sepOeCount = Object.values(sepOeErrors).filter(Boolean).length;

  // Integracao Binaural: 40 dígitos avaliados por orelha
  const integOdPercent = Math.max(0, 100 - integOdCount * 2.5);
  const integOePercent = Math.max(0, 100 - integOeCount * 2.5);

  // Separação Binaural: 20 dígitos avaliados por orelha
  const sepOdPercent = Math.max(0, 100 - sepOdCount * 5);
  const sepOePercent = Math.max(0, 100 - sepOeCount * 5);

  const integOdNorm = evaluateTddIntegracao(patientAge, "OD", integOdPercent);
  const integOeNorm = evaluateTddIntegracao(patientAge, "OE", integOePercent);
  const sepOdNorm = evaluateTddSeparacao(patientAge, "OD", sepOdPercent);
  const sepOeNorm = evaluateTddSeparacao(patientAge, "OE", sepOePercent);

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
                    value={integOdIntensidade}
                    onChange={(e) =>
                      setIntegOdIntensidade(Number(e.target.value))
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
                onAdjustError={(delta) => {
                  if (delta > 0) toggleIntegOd(`manual-${Date.now()}`);
                  else {
                    const first = Object.keys(integOdErrors).find(
                      (k) => integOdErrors[k],
                    );
                    if (first) toggleIntegOd(first);
                  }
                }}
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
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {integOdNorm.status === "Normal" ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    )}
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
                    value={integOeIntensidade}
                    onChange={(e) =>
                      setIntegOeIntensidade(Number(e.target.value))
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
                onAdjustError={(delta) => {
                  if (delta > 0) toggleIntegOe(`manual-${Date.now()}`);
                  else {
                    const first = Object.keys(integOeErrors).find(
                      (k) => integOeErrors[k],
                    );
                    if (first) toggleIntegOe(first);
                  }
                }}
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
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {integOeNorm.status === "Normal" ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    )}
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
                    value={sepOdIntensidade}
                    onChange={(e) =>
                      setSepOdIntensidade(Number(e.target.value))
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
                onAdjustError={(delta) => {
                  if (delta > 0) toggleSepOd(`manual-${Date.now()}`);
                  else {
                    const first = Object.keys(sepOdErrors).find(
                      (k) => sepOdErrors[k],
                    );
                    if (first) toggleSepOd(first);
                  }
                }}
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
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {sepOdNorm.status === "Normal" ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    )}
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
                    value={sepOeIntensidade}
                    onChange={(e) =>
                      setSepOeIntensidade(Number(e.target.value))
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
                onAdjustError={(delta) => {
                  if (delta > 0) toggleSepOe(`manual-${Date.now()}`);
                  else {
                    const first = Object.keys(sepOeErrors).find(
                      (k) => sepOeErrors[k],
                    );
                    if (first) toggleSepOe(first);
                  }
                }}
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
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {sepOeNorm.status === "Normal" ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <AlertCircle className="w-3 h-3 stroke-[3]" />
                    )}
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
