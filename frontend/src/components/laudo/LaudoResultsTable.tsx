import { useTranslation } from "react-i18next";
import type { EvaluationSummary } from "@/lib/evaluation-summary";
import type { NormativeStatus } from "@/lib/normative-engine";

function statusClassName(status: NormativeStatus): string {
  if (status === "Normal") return "text-emerald-700 font-bold";
  if (status === "Alterado") return "text-red-600 font-bold";
  return "text-slate-500 font-semibold";
}

function NotAppliedRow({ label }: { label: string }) {
  const { t } = useTranslation();
  return (
    <tr>
      <td className="p-3 font-medium text-slate-900">{label}</td>
      <td colSpan={2} className="p-3 text-center text-slate-500 italic">
        {t("pac.protocols.notApplied")}
      </td>
      <td className="p-3 text-center">
        <span className={statusClassName("Não avaliado")}>Não avaliado</span>
      </td>
    </tr>
  );
}

export function LaudoResultsTable({ summary }: { summary: EvaluationSummary }) {
  const { t } = useTranslation();
  const binaural = t("pac.protocols.binaural");

  return (
    <div className="space-y-3 pt-3">
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
        Resultados da Bateria de Testes
      </h2>

      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
              <th className="p-3">Bloco / Protocolo Clínico</th>
              <th className="p-3 text-center w-36">OD / Resultado</th>
              <th className="p-3 text-center w-36">OE / Detalhe</th>
              <th className="p-3 text-center w-28">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* 1. Testes Dióticos */}
            <tr className="bg-slate-50/70">
              <td
                colSpan={4}
                className="px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-600"
              >
                1. Testes Dióticos
              </td>
            </tr>
            {summary.bandinha.applied ? (
              <tr>
                <td className="p-3 font-medium text-slate-900">
                  Bandinha (Localização / Memória S.V. e S.N.V.)
                </td>
                <td className="p-3 text-center font-semibold">
                  Loc: {summary.bandinha.locDisplay}
                </td>
                <td className="p-3 text-center font-semibold">
                  SV: {summary.bandinha.mvCount}/3 | SNV:{" "}
                  {summary.bandinha.mnvCount}/3
                </td>
                <td className="p-3 text-center">
                  <span
                    className={statusClassName(summary.bandinha.overallStatus)}
                  >
                    {summary.bandinha.overallStatus}
                  </span>
                </td>
              </tr>
            ) : (
              <NotAppliedRow label="Bandinha (Localização / Memória S.V. e S.N.V.)" />
            )}

            {/* 2. Tarefas Monoaurais de Baixa Redundância */}
            <tr className="bg-slate-50/70">
              <td
                colSpan={4}
                className="px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-600"
              >
                2. Tarefas Monoaurais de Baixa Redundância
              </td>
            </tr>
            {summary.falaNoRuido.applied ? (
              <>
                <tr>
                  <td className="p-3 font-medium text-slate-900">
                    IPRF com Gravação
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.falaNoRuido.odIprf}%
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.falaNoRuido.oeIprf}%
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={statusClassName(
                        summary.falaNoRuido.iprfStatus,
                      )}
                    >
                      {summary.falaNoRuido.iprfStatus}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">
                    Fala no Ruído (Fechamento Auditivo - S/R +5 dB)
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.falaNoRuido.odFr}% (Dif:{" "}
                    {summary.falaNoRuido.odDiff}%)
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.falaNoRuido.oeFr}% (Dif:{" "}
                    {summary.falaNoRuido.oeDiff}%)
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={statusClassName(
                        summary.falaNoRuido.overallStatus,
                      )}
                    >
                      {summary.falaNoRuido.overallStatus}
                    </span>
                  </td>
                </tr>
              </>
            ) : (
              <NotAppliedRow label="Fala no Ruído (Fechamento Auditivo)" />
            )}
            {summary.psi.applied ? (
              <tr>
                <td className="p-3 font-medium text-slate-900">
                  {summary.psi.modeLabel} / MCI (Mensagem Competitiva
                  Ipsilateral)
                </td>
                <td className="p-3 text-center font-semibold">
                  {summary.psi.odDetail}
                </td>
                <td className="p-3 text-center font-semibold">
                  {summary.psi.oeDetail}
                </td>
                <td className="p-3 text-center">
                  <span className={statusClassName(summary.psi.overallStatus)}>
                    {summary.psi.overallStatus}
                  </span>
                </td>
              </tr>
            ) : (
              <NotAppliedRow label={`${summary.psi.modeLabel} / MCI`} />
            )}

            {/* 3. Tarefas de Processamento Temporal */}
            <tr className="bg-slate-50/70">
              <td
                colSpan={4}
                className="px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-600"
              >
                3. Tarefas de Processamento Temporal
              </td>
            </tr>
            {summary.temporal.applied ? (
              <>
                <tr>
                  <td className="p-3 font-medium text-slate-900">
                    Padrão de Frequência (Auditec - {binaural})
                  </td>
                  <td colSpan={2} className="p-3 text-center font-semibold">
                    {summary.temporal.freqCombinedStatus === "Não aplicável"
                      ? "Não aplicável (< 7 anos)"
                      : `${binaural} — Humming: ${summary.temporal.freqHummingPct}% | Nomeação: ${summary.temporal.freqPct}%`}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={statusClassName(
                        summary.temporal.freqCombinedStatus,
                      )}
                    >
                      {summary.temporal.freqCombinedStatus}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">
                    Padrão de Duração (Auditec - {binaural})
                  </td>
                  <td colSpan={2} className="p-3 text-center font-semibold">
                    {summary.temporal.durCombinedStatus === "Não aplicável"
                      ? "Não aplicável (< 7 anos)"
                      : `${binaural} — Humming: ${summary.temporal.durHummingPct}% | Nomeação: ${summary.temporal.durPct}%`}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={statusClassName(
                        summary.temporal.durCombinedStatus,
                      )}
                    >
                      {summary.temporal.durCombinedStatus}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">
                    RGDT (Resolução Temporal - Média 500 a 4000 Hz)
                  </td>
                  <td colSpan={2} className="p-3 text-center font-semibold">
                    {summary.temporal.rgdtMedia.toFixed(2).replace(".", ",")} ms
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={statusClassName(summary.temporal.rgdtStatus)}
                    >
                      {summary.temporal.rgdtStatus}
                    </span>
                  </td>
                </tr>
              </>
            ) : (
              <NotAppliedRow label="Processamento Temporal (Frequência, Duração e RGDT)" />
            )}

            {/* 4. Tarefas Dicóticas */}
            <tr className="bg-slate-50/70">
              <td
                colSpan={4}
                className="px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-600"
              >
                4. Tarefas Dicóticas
              </td>
            </tr>
            {summary.tdd.applied ? (
              <>
                <tr>
                  <td className="p-3 font-medium text-slate-900">
                    TDD — Integração Binaural
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.tdd.integOdStatus === "Não aplicável"
                      ? "Não aplicável"
                      : `${summary.tdd.integOd}%`}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.tdd.integOeStatus === "Não aplicável"
                      ? "Não aplicável"
                      : `${summary.tdd.integOe}%`}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={statusClassName(
                        summary.skills.integracaoBinaural,
                      )}
                    >
                      {summary.skills.integracaoBinaural}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">
                    TDD — Separação Binaural
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.tdd.sepOdStatus === "Não aplicável"
                      ? "Não aplicável"
                      : `${summary.tdd.sepOd}%`}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.tdd.sepOeStatus === "Não aplicável"
                      ? "Não aplicável"
                      : `${summary.tdd.sepOe}%`}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={statusClassName(
                        summary.skills.separacaoBinaural,
                      )}
                    >
                      {summary.skills.separacaoBinaural}
                    </span>
                  </td>
                </tr>
              </>
            ) : (
              <NotAppliedRow label="TDD (Integração / Separação Binaural)" />
            )}
            {summary.ssw.applied ? (
              <>
                <tr>
                  <td className="p-3 font-medium text-slate-900">
                    SSW (Dissílabos Alternados - DC / EC)
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.ssw.dcStatus === "Não aplicável"
                      ? "Não aplicável"
                      : `${summary.ssw.dc.toFixed(1)}%`}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.ssw.ecStatus === "Não aplicável"
                      ? "Não aplicável"
                      : `${summary.ssw.ec.toFixed(1)}%`}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={statusClassName(summary.ssw.overallStatus)}
                    >
                      {summary.ssw.overallStatus}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">
                    SSW Qualitativo (Auditivo / Ordem / Tipo A /{" "}
                    {t("pac.protocols.sswInversoes")})
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.ssw.qualitativeStatus === "Não aplicável"
                      ? "Não aplicável"
                      : `Aud: ${summary.ssw.auditivoLabel} | Ord: ${summary.ssw.ordemLabel}`}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {summary.ssw.qualitativeStatus === "Não aplicável"
                      ? "Não aplicável"
                      : `Tipo A: ${summary.ssw.tipoALabel} | Inv: ${summary.ssw.inversoesLabel}`}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={statusClassName(summary.ssw.qualitativeStatus)}
                    >
                      {summary.ssw.qualitativeStatus}
                    </span>
                  </td>
                </tr>
              </>
            ) : (
              <NotAppliedRow label="SSW (Dissílabos Alternados)" />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
