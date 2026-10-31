import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore } from "@/lib/pac-store";

export const Route = createFileRoute("/protocolos/ssw")({
  component: Protocol6SSW,
});

const PAIRS_SAMPLE = [
  "bota fora", "pega fogo", "lata velha", "casa nova", "mesa preta",
  "porta aberta", "sopa quente", "chuva forte", "noite escura", "terra molhada",
  "bola branca", "fita azul", "vento frio", "folha seca", "livro novo",
  "ferro quente", "copo cheio", "bala doce", "tempo bom", "sol claro",
  "pato verde", "cano alto", "roda torta", "olho vivo", "bicho manso",
  "linha reta", "pano mole", "vila rica", "ouro fino", "pau seco",
  "dia claro", "pote cheio", "pé descalço", "rio fundo", "rede solta",
  "mala cheia", "fogo vivo", "vela acesa", "lua cheia", "passo largo",
];

function Protocol6SSW() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();

  const [view, setView] = useState<"matrix" | "table">("matrix");

  const [errors, setErrors] = useState(store.ssw.errors);

  // Totais combinados
  const totDnc = errors.a + errors.h;
  const totDc = errors.b + errors.g;
  const totEc = errors.c + errors.f;
  const totEnc = errors.d + errors.e;

  // Calculos quantitativos (100 - errors * 2.5)
  const pctDc = Math.max(0, 100 - totDc * 2.5);
  const pctEc = Math.max(0, 100 - totEc * 2.5);
  const pctDnc = Math.max(0, 100 - totDnc * 2.5);
  const pctEnc = Math.max(0, 100 - totEnc * 2.5);

  const dcNormal = pctDc >= 90;
  const ecNormal = pctEc >= 90;

  function adjustError(col: keyof typeof errors, delta: number) {
    setErrors((prev) => ({
      ...prev,
      [col]: Math.max(0, prev[col] + delta),
    }));
  }

  function handleSaveDraft() {
    setStore((prev) => ({
      ...prev,
      ssw: { errors },
    }));
    alert("Dados do SSW salvos com sucesso!");
  }

  function handleNext() {
    setStore((prev) => ({
      ...prev,
      ssw: { errors },
    }));
    void navigate({ to: "/laudo" });
  }

  return (
    <ClinicalLayout
      currentProtocol={6}
      protocolNumber={6}
      title="Protocolo SSW (Dissílabos Alternados)"
      subtitle="Registro, tabulação da matriz A a H e cálculo quantitativo e qualitativo automatizado."
      backHref="/protocolos/psi-ssi"
    >
      <div className="space-y-6">
        {/* Stepper Component (as in Tela 4 HTML) */}
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center space-x-2 md:space-x-8 w-full max-w-3xl justify-center text-xs md:text-sm font-medium">
            {/* Step 1 */}
            <div className="flex items-center space-x-2 text-slate-400">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <span className="hidden sm:inline">1. Identificação</span>
            </div>
            <div className="w-8 md:w-16 h-0.5 bg-emerald-600"></div>

            {/* Step 2 */}
            <div className="flex items-center space-x-2 text-slate-400">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <span className="hidden sm:inline">2. Protocolos</span>
            </div>
            <div className="w-8 md:w-16 h-0.5 bg-blue-600"></div>

            {/* Step 3 */}
            <div className="flex items-center space-x-2 text-blue-600 font-bold">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                3
              </div>
              <span>3. SSW (Core)</span>
            </div>
            <div className="w-8 md:w-16 h-0.5 bg-slate-200"></div>

            {/* Step 4 */}
            <div className="flex items-center space-x-2 text-slate-400">
              <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-semibold">
                4
              </div>
              <span className="hidden sm:inline">4. Laudo</span>
            </div>
          </div>

          {/* Patient Mini Summary Banner */}
          <div className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-600">
            <div>
              <strong>Paciente:</strong> {store.patient.name}
            </div>
            <div>
              <strong>Idade:</strong> {store.patient.age}
            </div>
            <div>
              <strong>Data:</strong> {store.patient.date}
            </div>
            <div>
              <strong>Fonoaudióloga:</strong> {store.patient.examiner}
            </div>
          </div>
        </div>

        {/* High-Density Two Column Workspace (65% left, 35% right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: 65% (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            {/* Main SSW Matrix & View Switcher Card */}
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 p-5 flex flex-col space-y-4">
              {/* Header & View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-3">
                <div>
                  <h2 className="font-bold text-slate-900 text-base">
                    Matriz de Dissílabos Alternados (SSW)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Registro e tabulação de erros por colunas A a H
                  </p>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setView("matrix")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      view === "matrix"
                        ? "bg-white text-blue-600 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Matriz Resumida
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("table")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      view === "table"
                        ? "bg-white text-blue-600 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Tabela de 40 Itens
                  </button>
                </div>
              </div>

              {/* Column Summary Bar (A to H) */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                <div className="text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Distribuição de Erros por Coluna (A a H)</span>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">
                    Mult. Erro: x 2.5
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
                  {(
                    [
                      { id: "a", label: "A (DNC)", val: errors.a },
                      { id: "b", label: "B (DC)", val: errors.b },
                      { id: "c", label: "C (ED)", val: errors.c },
                      { id: "d", label: "D (ENC)", val: errors.d },
                      { id: "e", label: "E (ENC)", val: errors.e },
                      { id: "f", label: "F (EC)", val: errors.f },
                      { id: "g", label: "G (DC)", val: errors.g },
                      { id: "h", label: "H (DNC)", val: errors.h },
                    ] as const
                  ).map((col) => (
                    <div
                      key={col.id}
                      className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs"
                    >
                      <div className="text-[10px] font-bold text-slate-500">
                        {col.label}
                      </div>
                      <div className="text-sm font-bold text-slate-800 my-1">
                        {col.val}
                      </div>
                      <div className="flex justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => adjustError(col.id, -1)}
                          className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustError(col.id, 1)}
                          className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Combined Totals Bar */}
                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-around gap-2 text-xs font-semibold text-slate-700">
                  <div className="text-slate-500">Totais Combinados:</div>
                  <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    DNC: <span className="font-bold text-slate-900">{totDnc}</span>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    DC: <span className="font-bold text-slate-900">{totDc}</span>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    EC: <span className="font-bold text-slate-900">{totEc}</span>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    ENC: <span className="font-bold text-slate-900">{totEnc}</span>
                  </div>
                </div>
              </div>

              {/* View 1: Matriz de Resumo Quantitativo & Qualitativo */}
              {view === "matrix" && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Matriz de Resumo Quantitativo & Qualitativo
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                          <th className="p-2.5 font-semibold">
                            Condição / Categoria
                          </th>
                          <th className="p-2.5 font-semibold text-center">
                            Erros Registrados
                          </th>
                          <th className="p-2.5 font-semibold text-center">
                            Fator Multiplicador
                          </th>
                          <th className="p-2.5 font-semibold text-right">
                            % Acerto Calculado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2.5 font-medium text-slate-900">
                            Direita Competitiva (DC - Col B + G)
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-700">
                            {totDc} {totDc === 1 ? "erro" : "erros"}
                          </td>
                          <td className="p-2.5 text-center text-slate-500">
                            x 2.5% = {(totDc * 2.5).toFixed(1)}%
                          </td>
                          <td className="p-2.5 text-right font-bold text-emerald-600">
                            {pctDc.toFixed(1)}%
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-900">
                            Esquerda Competitiva (EC - Col C + F)
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-700">
                            {totEc} {totEc === 1 ? "erro" : "erros"}
                          </td>
                          <td className="p-2.5 text-center text-slate-500">
                            x 2.5% = {(totEc * 2.5).toFixed(1)}%
                          </td>
                          <td className="p-2.5 text-right font-bold text-emerald-600">
                            {pctEc.toFixed(1)}%
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-900">
                            Direita Não Competitiva (DNC - Col A + H)
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-700">
                            {totDnc} {totDnc === 1 ? "erro" : "erros"}
                          </td>
                          <td className="p-2.5 text-center text-slate-500">
                            x 2.5% = {(totDnc * 2.5).toFixed(1)}%
                          </td>
                          <td className="p-2.5 text-right font-bold text-emerald-600">
                            {pctDnc.toFixed(1)}%
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-slate-900">
                            Esquerda Não Competitiva (ENC - Col D + E)
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-700">
                            {totEnc} {totEnc === 1 ? "erro" : "erros"}
                          </td>
                          <td className="p-2.5 text-center text-slate-500">
                            x 2.5% = {(totEnc * 2.5).toFixed(1)}%
                          </td>
                          <td className="p-2.5 text-right font-bold text-emerald-600">
                            {pctEnc.toFixed(1)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 2: Tabela de 40 Itens */}
              {view === "table" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tabela de 40 Itens SSW (Bota Fora / Pega Fogo...)
                    </div>
                    <span className="text-xs text-slate-500">
                      Clique para marcar erro na orelha/posição correspondente
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-slate-100 text-slate-700 border-b border-slate-200">
                        <tr>
                          <th className="p-2 font-semibold">Item</th>
                          <th className="p-2 font-semibold">
                            Par de Palavras (Exemplo)
                          </th>
                          <th className="p-2 font-semibold text-center">
                            A (DNC)
                          </th>
                          <th className="p-2 font-semibold text-center">
                            B (DC)
                          </th>
                          <th className="p-2 font-semibold text-center">
                            C (ED)
                          </th>
                          <th className="p-2 font-semibold text-center">
                            D (ENC)
                          </th>
                          <th className="p-2 font-semibold text-center">
                            E (ENC)
                          </th>
                          <th className="p-2 font-semibold text-center">
                            F (EC)
                          </th>
                          <th className="p-2 font-semibold text-center">
                            G (DC)
                          </th>
                          <th className="p-2 font-semibold text-center">
                            H (DNC)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {PAIRS_SAMPLE.slice(0, 15).map((pair, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-600">
                              #{idx + 1}
                            </td>
                            <td className="p-2 text-slate-800">{pair}</td>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                className="rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: 35% (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            {/* Card 1: Análise Quantitativa */}
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 p-5 flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Análise Quantitativa
                </h3>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                  Ref: ≥ 90%
                </span>
              </div>

              <div className="space-y-3">
                {/* OD */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      % Acertos OD (DC)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Direita Competitiva
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-slate-900">
                      {pctDc.toFixed(1)}%
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dcNormal
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {dcNormal ? "Normal" : "Alterado"}
                    </span>
                  </div>
                </div>

                {/* OE */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      % Acertos OE (EC)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Esquerda Competitiva
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-slate-900">
                      {pctEc.toFixed(1)}%
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ecNormal
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ecNormal ? "Normal" : "Alterado"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Análise Qualitativa e Tendências */}
            <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 p-5 flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Análise Qualitativa e Tendências
                </h3>
                <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-semibold">
                  Algoritmo Automático
                </span>
              </div>

              {/* Qualitative Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="p-2 font-semibold">Indicador</th>
                      <th className="p-2 font-semibold text-center">Valor</th>
                      <th className="p-2 font-semibold text-right">
                        Classificação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="p-2 font-medium text-slate-900">
                        Tipo A (≤ 3)
                      </td>
                      <td className="p-2 text-center font-bold">1</td>
                      <td className="p-2 text-right">
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          NS
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-900">
                        Efeito de Ordem (-3 a +3)
                      </td>
                      <td className="p-2 text-center font-bold">+1</td>
                      <td className="p-2 text-right">
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          NS
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-900">
                        Efeito Auditivo (-4 a +4)
                      </td>
                      <td className="p-2 text-center font-bold">+2</td>
                      <td className="p-2 text-right">
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          NS
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium text-slate-900">
                        Inversões (≤ 1)
                      </td>
                      <td className="p-2 text-center font-bold">0</td>
                      <td className="p-2 text-right">
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          NS
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Clinical Interpretation Checkboxes */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-700">
                  Interpretação Clínica Associada:
                </div>
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Memória Auditiva Operacional</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Capacidade de Análise e Síntese</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Associação Som-Símbolo</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => void navigate({ to: "/protocolos/psi-ssi" })}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            Voltar
          </button>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Salvar Rascunho
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition flex items-center space-x-2 cursor-pointer"
            >
              <span>Gerar Laudo Final (PDF)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </ClinicalLayout>
  );
}
