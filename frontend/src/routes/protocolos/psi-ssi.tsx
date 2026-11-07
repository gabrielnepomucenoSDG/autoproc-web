import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Headphones,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { ProtocolObservations } from "@/components/layout/ProtocolObservations";
import { usePacStore } from "@/lib/pac-store";
import { evaluatePsiSsi } from "@/lib/normative-engine";

export const Route = createFileRoute("/protocolos/psi-ssi")({
  component: Protocol3PsiSsi,
});

function PsiRow({
  title,
  relacao,
  enabled,
  onToggleEnabled,
  score,
  onScoreChange,
}: {
  title: string;
  relacao: 0 | -10 | -15;
  enabled: boolean;
  onToggleEnabled: () => void;
  score: number;
  onScoreChange: (score: number) => void;
}) {
  const percent = score * 10;
  const norm = evaluatePsiSsi(relacao, score);
  const isNormal = norm.status === "Normal";

  return (
    <div
      className={`p-3.5 rounded-xl border transition ${
        enabled
          ? "bg-white border-slate-200/90 shadow-2xs"
          : "bg-slate-50/60 border-slate-200/40 opacity-60"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Checkbox and title */}
        <div className="flex items-center space-x-2.5">
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggleEnabled}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <div>
            <span className="text-xs font-bold text-slate-800">{title}</span>
          </div>
        </div>

        {/* Number buttons 1..10 */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const isSelected = num <= score;
            return (
              <button
                key={num}
                type="button"
                disabled={!enabled}
                onClick={() => onScoreChange(num === score ? num - 1 : num)}
                className={`w-6 h-6 rounded text-xs font-bold transition border cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Total block */}
        <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-right">
            <div className="text-[9px] text-slate-400 font-medium">
              Total de acertos
            </div>
            <div className="flex items-center space-x-1.5 justify-end">
              <input
                type="number"
                value={score}
                disabled={!enabled}
                onChange={(e) =>
                  onScoreChange(
                    Math.max(0, Math.min(10, Number(e.target.value))),
                  )
                }
                className="w-10 px-1 py-0.5 text-center font-bold text-xs text-slate-800 border border-slate-200 rounded bg-slate-50"
              />
              <span className="text-xs font-bold text-slate-900">
                {percent}%
              </span>
            </div>
          </div>

          <span
            className={`font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center space-x-1 ${
              isNormal ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
            }`}
          >
            {!isNormal ? (
              <AlertCircle className="w-3 h-3 stroke-[3]" />
            ) : (
              <Check className="w-3 h-3 stroke-[3]" />
            )}
            <span>{norm.status}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Protocol3PsiSsi() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();

  const [mode, setMode] = useState<"psi" | "ssi">(store.psi.mode);

  // OD
  const [odDb0, setOdDb0] = useState(store.psi.od.db0);
  const [odDb10, setOdDb10] = useState(store.psi.od.dbMinus10);
  const [odDb15, setOdDb15] = useState(store.psi.od.dbMinus15);
  const [odEn0, setOdEn0] = useState(store.psi.od.enabled0);
  const [odEn10, setOdEn10] = useState(store.psi.od.enabledMinus10);
  const [odEn15, setOdEn15] = useState(store.psi.od.enabledMinus15);

  // OE
  const [oeDb0, setOeDb0] = useState(store.psi.oe.db0);
  const [oeDb10, setOeDb10] = useState(store.psi.oe.dbMinus10);
  const [oeDb15, setOeDb15] = useState(store.psi.oe.dbMinus15);
  const [oeEn0, setOeEn0] = useState(store.psi.oe.enabled0);
  const [oeEn10, setOeEn10] = useState(store.psi.oe.enabledMinus10);
  const [oeEn15, setOeEn15] = useState(store.psi.oe.enabledMinus15);

  const [observacoes, setObservacoes] = useState(store.psi.observacoes || "");

  function handleNext() {
    setStore((prev) => ({
      ...prev,
      psi: {
        mode,
        od: {
          db0: odDb0,
          dbMinus10: odDb10,
          dbMinus15: odDb15,
          enabled0: odEn0,
          enabledMinus10: odEn10,
          enabledMinus15: odEn15,
        },
        oe: {
          db0: oeDb0,
          dbMinus10: oeDb10,
          dbMinus15: oeDb15,
          enabled0: oeEn0,
          enabledMinus10: oeEn10,
          enabledMinus15: oeEn15,
        },
        observacoes,
      },
    }));
    void navigate({ to: "/protocolos/bandinha" });
  }

  return (
    <ClinicalLayout
      currentProtocol={5}
      protocolNumber={5}
      title="PSI / SSI (Mensagem Competitiva Ipsilateral - MCI)"
      subtitle="Avalia a habilidade de figura-fundo com mensagens competitivas apresentadas ipsilateralmente."
      backHref="/protocolos/processamento-temporal"
      showProtocolStepper={true}
    >
      <div className="space-y-6">
        {/* Switcher Mode */}
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("psi")}
              className={`px-6 py-2 rounded-lg transition cursor-pointer ${
                mode === "psi"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              PSI - Figuras (Pediátrico)
            </button>
            <button
              type="button"
              onClick={() => setMode("ssi")}
              className={`px-6 py-2 rounded-lg transition cursor-pointer ${
                mode === "ssi"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              SSI - Frases Escritas (Adulto)
            </button>
          </div>
        </div>

        {/* 2 Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OD Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Orelha Direita (OD)
              </h2>
            </div>

            <div className="space-y-3">
              <PsiRow
                title="Relação 0 dB / MCI"
                relacao={0}
                enabled={odEn0}
                onToggleEnabled={() => setOdEn0(!odEn0)}
                score={odDb0}
                onScoreChange={setOdDb0}
              />
              <PsiRow
                title="Relação -10 dB / MCI"
                relacao={-10}
                enabled={odEn10}
                onToggleEnabled={() => setOdEn10(!odEn10)}
                score={odDb10}
                onScoreChange={setOdDb10}
              />
              <PsiRow
                title="Relação -15 dB / MCI"
                relacao={-15}
                enabled={odEn15}
                onToggleEnabled={() => setOdEn15(!odEn15)}
                score={odDb15}
                onScoreChange={setOdDb15}
              />
            </div>
          </div>

          {/* OE Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Orelha Esquerda (OE)
              </h2>
            </div>

            <div className="space-y-3">
              <PsiRow
                title="Relação 0 dB / MCI"
                relacao={0}
                enabled={oeEn0}
                onToggleEnabled={() => setOeEn0(!oeEn0)}
                score={oeDb0}
                onScoreChange={setOeDb0}
              />
              <PsiRow
                title="Relação -10 dB / MCI"
                relacao={-10}
                enabled={oeEn10}
                onToggleEnabled={() => setOeEn10(!oeEn10)}
                score={oeDb10}
                onScoreChange={setOeDb10}
              />
              <PsiRow
                title="Relação -15 dB / MCI"
                relacao={-15}
                enabled={oeEn15}
                onToggleEnabled={() => setOeEn15(!oeEn15)}
                score={oeDb15}
                onScoreChange={setOeDb15}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Observações do Fonoaudiólogo */}
      <ProtocolObservations value={observacoes} onChange={setObservacoes} />

      {/* Bottom Footer Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
            i
          </div>
          <span>Desmarque a linha caso a relação não tenha sido aplicada.</span>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() =>
              void navigate({ to: "/protocolos/processamento-temporal" })
            }
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
