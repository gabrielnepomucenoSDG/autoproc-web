import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Printer, FileText, CheckCircle2 } from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore } from "@/lib/pac-store";
import {
  evaluateBandinhaLocalizacao,
  evaluateBandinhaMemoria,
  evaluateFalaNoRuido,
  evaluatePsiSsi,
  evaluateRgdt,
  evaluateSswQuantitativo,
  evaluateTddIntegracao,
  evaluateTddSeparacao,
  evaluateTemporalAuditec,
  parsePatientAge,
} from "@/lib/normative-engine";

export const Route = createFileRoute("/laudo")({
  component: Screen8LaudoReviewAndExport,
});

function Screen8LaudoReviewAndExport() {
  const navigate = useNavigate();
  const [store, setStore] = usePacStore();

  const [comportamento, setComportamento] = useState(store.laudo.comportamento);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const patientAge = parsePatientAge(
    store.patient.age,
    store.patient.birthDate,
    store.patient.date,
  );

  // 1. Bandinha
  const locCount = Object.values(store.bandinha.localizacao).filter(
    Boolean,
  ).length;
  const mnvCount = store.bandinha.memoriaNaoVerbal.filter(Boolean).length;
  const mvCount = store.bandinha.memoriaVerbal.filter(Boolean).length;
  const locNorm = evaluateBandinhaLocalizacao(
    locCount,
    store.bandinha.localizacao.direita,
    store.bandinha.localizacao.esquerda,
  );
  const mnvNorm = evaluateBandinhaMemoria(mnvCount);
  const mvNorm = evaluateBandinhaMemoria(mvCount);
  const bandinhaStatus =
    locNorm.status === "Normal" &&
    mnvNorm.status === "Normal" &&
    mvNorm.status === "Normal"
      ? "Normal"
      : "Alterado";

  // 2. Fala no Ruído & PSI/SSI
  const odFr = Math.max(0, 100 - store.falaNoRuido.od.erros.length * 4);
  const oeFr = Math.max(0, 100 - store.falaNoRuido.oe.erros.length * 4);
  const odFrEval = evaluateFalaNoRuido(
    store.falaNoRuido.od.iprfGravacao,
    odFr,
  );
  const oeFrEval = evaluateFalaNoRuido(
    store.falaNoRuido.oe.iprfGravacao,
    oeFr,
  );
  const frStatus =
    odFrEval.fr.status === "Normal" &&
    oeFrEval.fr.status === "Normal" &&
    odFrEval.diff.status === "Normal" &&
    oeFrEval.diff.status === "Normal"
      ? "Normal"
      : "Alterado";

  const psiOd15 = evaluatePsiSsi(-15, store.psi.od.dbMinus15);
  const psiOe15 = evaluatePsiSsi(-15, store.psi.oe.dbMinus15);
  const psiStatus =
    psiOd15.status === "Normal" && psiOe15.status === "Normal"
      ? "Normal"
      : "Alterado";

  // 3. Processamento Temporal
  const freqNomeacaoPct = Math.round((store.temporal.freqNomeacao / 10) * 100);
  const durNomeacaoPct = Math.round((store.temporal.durNomeacao / 10) * 100);
  const freqNorm = evaluateTemporalAuditec("freqNomeacao", freqNomeacaoPct);
  const durNorm = evaluateTemporalAuditec("durNomeacao", durNomeacaoPct);
  const rgdtEval = evaluateRgdt(store.temporal.rgdt);

  // 4. Tarefas Dicóticas (TDD e SSW)
  const tddIntegOd = Math.max(0, 100 - store.tdd.integracao.odErrors * 2.5);
  const tddIntegOe = Math.max(0, 100 - store.tdd.integracao.oeErrors * 2.5);
  const tddSepOd = Math.max(0, 100 - store.tdd.separacao.odErrors * 5);
  const tddSepOe = Math.max(0, 100 - store.tdd.separacao.oeErrors * 5);
  const tddStatus =
    evaluateTddIntegracao(patientAge, "OD", tddIntegOd).status === "Normal" &&
    evaluateTddIntegracao(patientAge, "OE", tddIntegOe).status === "Normal" &&
    evaluateTddSeparacao(patientAge, "OD", tddSepOd).status === "Normal" &&
    evaluateTddSeparacao(patientAge, "OE", tddSepOe).status === "Normal"
      ? "Normal"
      : "Alterado";

  const sswDc = Math.max(
    0,
    100 - (store.ssw.errors.b + store.ssw.errors.g) * 2.5,
  );
  const sswEc = Math.max(
    0,
    100 - (store.ssw.errors.c + store.ssw.errors.f) * 2.5,
  );
  const sswStatus =
    evaluateSswQuantitativo(patientAge, "DC", sswDc).status === "Normal" &&
    evaluateSswQuantitativo(patientAge, "EC", sswEc).status === "Normal"
      ? "Normal"
      : "Alterado";

  const protocolNotes = [
    { label: "Bandinha", text: store.bandinha.observacoes },
    { label: "Fala no Ruído", text: store.falaNoRuido.observacoes },
    { label: "PSI / SSI", text: store.psi.observacoes },
    { label: "Processamento Temporal", text: store.temporal.observacoes },
    { label: "TDD", text: store.tdd.observacoes },
    { label: "SSW", text: store.ssw.observacoes },
  ].filter((n) => n.text && n.text.trim().length > 0);

  function handleFinalizeLaudo() {
    const computedSkills = {
      fechamentoAuditivo: frStatus as "Normal" | "Alterado",
      figuraFundo: (psiStatus === "Normal" && sswStatus === "Normal"
        ? "Normal"
        : "Alterado") as "Normal" | "Alterado",
      integracaoBinaural: (evaluateTddIntegracao(patientAge, "OD", tddIntegOd)
        .status === "Normal" &&
      evaluateTddIntegracao(patientAge, "OE", tddIntegOe).status === "Normal"
        ? "Normal"
        : "Alterado") as "Normal" | "Alterado",
      separacaoBinaural: (evaluateTddSeparacao(patientAge, "OD", tddSepOd)
        .status === "Normal" &&
      evaluateTddSeparacao(patientAge, "OE", tddSepOe).status === "Normal"
        ? "Normal"
        : "Alterado") as "Normal" | "Alterado",
      ordenacaoTemporal: (mnvNorm.status === "Normal" &&
      mvNorm.status === "Normal" &&
      freqNorm.status === "Normal" &&
      durNorm.status === "Normal"
        ? "Normal"
        : "Alterado") as "Normal" | "Alterado",
      resolucaoTemporal: rgdtEval.status,
      localizacaoSonora: locNorm.status,
    };

    const newEvalId = `eval-${Date.now()}`;
    setStore((prev) => ({
      ...prev,
      activeEvaluationId: newEvalId,
      evaluations: [
        {
          id: newEvalId,
          patientId: prev.activePatientId,
          patientName: prev.patient.name,
          ageLabel: prev.patient.age,
          date: prev.patient.date,
          status: "finalizada",
          examiner: prev.clinician.shortName,
          referral: prev.patient.referral,
          skills: computedSkills,
        },
        ...prev.evaluations,
      ],
    }));
    setSavedSuccess(true);
  }

  function handlePrint() {
    window.print();
  }

  function handleExportDocx() {
    alert("Exportação para DOCX (.docx) acionada.");
  }

  return (
    <ClinicalLayout
      title="Revisão e Exportação do Laudo Clínico"
      subtitle="Verifique o laudo gerado automaticamente pelo motor normativo antes da assinatura e exportação."
      backHref="/protocolos/bandinha"
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Action Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700">
              {savedSuccess
                ? "Laudo Finalizado e Salvo no Prontuário (Imutável)"
                : "Laudo Gerado com Sucesso (Pronto para Emissão)"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleFinalizeLaudo}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {savedSuccess ? "Salvo no Prontuário ✓" : "Finalizar Laudo"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              {isEditing ? "Concluir Edição" : "Editar Observações"}
            </button>
            <button
              type="button"
              onClick={handleExportDocx}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Exportar DOCX</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Medical Document Sheet (Paper Style) */}
        <div className="bg-white border border-slate-300 shadow-md rounded-xl p-8 sm:p-14 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 print:m-0 space-y-8">
          {/* Document Header (Dinâmico conforme configurado em Meu Perfil [MELHORIA 12]) */}
          {store.clinician.hasClinicLogo ? (
            <div className="border-b-2 border-slate-800 pb-5 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#112338] text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                  PAC
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
                    {store.clinician.clinicName ||
                      "Centro de Audiologia Clínica & PAC"}
                  </h1>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">
                    {store.clinician.name} — {store.clinician.title} —{" "}
                    {store.clinician.crfa}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-b border-slate-300 pb-3">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 uppercase">
                Avaliação do Processamento Auditivo Central
              </h1>
            </div>
          )}

          {/* Patient Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs text-slate-700 pt-1">
            <div>
              <span className="font-bold text-slate-900">
                Data da Avaliação:
              </span>{" "}
              {store.patient.date}
            </div>
            <div>
              <span className="font-bold text-slate-900">Ref. Protocolo:</span>{" "}
              PAC-2026-891
            </div>
            <div>
              <span className="font-bold text-slate-900">Paciente:</span>{" "}
              {store.patient.name}
            </div>
            <div>
              <span className="font-bold text-slate-900">
                Data de Nascimento / Idade:
              </span>{" "}
              {store.patient.birthDate
                ? `${store.patient.birthDate} (${store.patient.age})`
                : store.patient.age}
            </div>
            <div>
              <span className="font-bold text-slate-900">Avaliação:</span>{" "}
              Processamento Auditivo Central
            </div>
            <div>
              <span className="font-bold text-slate-900">Encaminhamento:</span>{" "}
              {store.patient.referral}
            </div>
          </div>

          {/* Results Table organized in the 4 Taxonomic Clinical Blocks ([MELHORIA 06]) */}
          <div className="space-y-3 pt-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Resultados da Bateria de Testes
            </h2>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
                    <th className="p-3">Bloco / Protocolo Clínico</th>
                    <th className="p-3 text-center w-28">OD / Resultado</th>
                    <th className="p-3 text-center w-28">OE / Detalhe</th>
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
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      Bandinha (Localização / Memória S.V. e S.N.V.)
                    </td>
                    <td className="p-3 text-center font-semibold">
                      Loc: {locCount}/5
                    </td>
                    <td className="p-3 text-center font-semibold">
                      SV: {mvCount}/3 | SNV: {mnvCount}/3
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          bandinhaStatus === "Normal"
                            ? "text-emerald-700 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {bandinhaStatus}
                      </span>
                    </td>
                  </tr>

                  {/* 2. Tarefas Monoaurais de Baixa Redundância */}
                  <tr className="bg-slate-50/70">
                    <td
                      colSpan={4}
                      className="px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-600"
                    >
                      2. Tarefas Monoaurais de Baixa Redundância
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      Fala no Ruído (Fechamento Auditivo)
                    </td>
                    <td className="p-3 text-center font-semibold">{odFr}%</td>
                    <td className="p-3 text-center font-semibold">{oeFr}%</td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          frStatus === "Normal"
                            ? "text-emerald-700 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {frStatus}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      PSI / SSI (Mensagem Competitiva Ipsilateral -15 dB)
                    </td>
                    <td className="p-3 text-center font-semibold">
                      {store.psi.od.dbMinus15 * 10}%
                    </td>
                    <td className="p-3 text-center font-semibold">
                      {store.psi.oe.dbMinus15 * 10}%
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          psiStatus === "Normal"
                            ? "text-emerald-700 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {psiStatus}
                      </span>
                    </td>
                  </tr>

                  {/* 3. Tarefas de Processamento Temporal */}
                  <tr className="bg-slate-50/70">
                    <td
                      colSpan={4}
                      className="px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-600"
                    >
                      3. Tarefas de Processamento Temporal
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      Padrão de Frequência e Duração (Auditec)
                    </td>
                    <td className="p-3 text-center font-semibold">
                      Freq: {freqNomeacaoPct}%
                    </td>
                    <td className="p-3 text-center font-semibold">
                      Dur: {durNomeacaoPct}%
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          freqNorm.status === "Normal" &&
                          durNorm.status === "Normal"
                            ? "text-emerald-700 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {freqNorm.status === "Normal" &&
                        durNorm.status === "Normal"
                          ? "Normal"
                          : "Alterado"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      RGDT (Resolução Temporal - Média 500 a 4000 Hz)
                    </td>
                    <td
                      colSpan={2}
                      className="p-3 text-center font-semibold"
                    >
                      {rgdtEval.media.toFixed(2).replace(".", ",")} ms
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          rgdtEval.status === "Normal"
                            ? "text-emerald-700 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {rgdtEval.status}
                      </span>
                    </td>
                  </tr>

                  {/* 4. Tarefas Dicóticas */}
                  <tr className="bg-slate-50/70">
                    <td
                      colSpan={4}
                      className="px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-600"
                    >
                      4. Tarefas Dicóticas
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      TDD (Integração / Separação Binaural)
                    </td>
                    <td className="p-3 text-center font-semibold">
                      Int: {tddIntegOd}% | Sep: {tddSepOd}%
                    </td>
                    <td className="p-3 text-center font-semibold">
                      Int: {tddIntegOe}% | Sep: {tddSepOe}%
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          tddStatus === "Normal"
                            ? "text-emerald-700 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {tddStatus}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      SSW (Dissílabos Alternados - DC / EC)
                    </td>
                    <td className="p-3 text-center font-semibold">
                      {sswDc.toFixed(1)}%
                    </td>
                    <td className="p-3 text-center font-semibold">
                      {sswEc.toFixed(1)}%
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={
                          sswStatus === "Normal"
                            ? "text-emerald-700 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {sswStatus}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Observações por Protocolo (se preenchidas) */}
          {protocolNotes.length > 0 && (
            <div className="space-y-2 pt-2">
              <h2 className="text-sm font-bold text-slate-900">
                Observações Específicas por Protocolo:
              </h2>
              <ul className="list-disc list-inside text-xs text-slate-800 space-y-1">
                {protocolNotes.map((n) => (
                  <li key={n.label}>
                    <strong>{n.label}:</strong> {n.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comportamento na Sessão */}
          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-slate-900">
              Comportamento na Sessão:
            </h2>
            {isEditing ? (
              <textarea
                value={comportamento}
                onChange={(e) => setComportamento(e.target.value)}
                rows={3}
                className="w-full text-xs text-slate-800 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            ) : (
              <p className="text-xs text-slate-800 leading-relaxed text-justify">
                {comportamento}
              </p>
            )}
          </div>

          {/* Conclusão */}
          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-slate-900">Conclusão:</h2>
            <ul className="list-disc list-inside text-xs text-slate-800 space-y-1 leading-relaxed">
              {store.laudo.conclusao.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Conduta / Recomendações */}
          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-slate-900">
              Conduta / Recomendações:
            </h2>
            <ol className="list-decimal list-inside text-xs text-slate-800 space-y-1 leading-relaxed">
              {store.laudo.recomendacoes.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </div>

          {/* Signature Block */}
          <div className="pt-10 border-t border-slate-200 flex flex-col items-center text-center space-y-1">
            {store.clinician.hasSignature && (
              <svg
                viewBox="0 0 280 65"
                className="w-52 h-12 text-[#1E40AF] mb-1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 48 C 32 16, 48 14, 42 42 C 38 56, 62 24, 78 32 C 92 38, 102 20, 116 36 C 128 48, 146 14, 162 26 C 174 36, 154 50, 184 34 C 204 24, 218 40, 236 28 C 248 20, 256 34, 266 24"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <div className="w-64 border-b border-slate-400 mb-2"></div>
            <div className="text-sm font-bold text-slate-900">
              {store.clinician.name} - {store.clinician.title} -{" "}
              {store.clinician.crfa}
            </div>
            <div className="text-[11px] text-slate-600">
              Assinado digitalmente por PAC Digital Engine —{" "}
              {store.clinician.crfa}
            </div>
            <div className="text-[10px] text-slate-400 italic">
              Documento gerado em conformidade com as normas do Conselho Federal
              de Fonoaudiologia.
            </div>
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="flex justify-between items-center pt-2 pb-6 print:hidden">
          <button
            type="button"
            onClick={() => void navigate({ to: "/protocolos/bandinha" })}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            ← Voltar ao Protocolo Bandinha
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: "/nova-avaliacao" })}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-xs"
          >
            Nova Avaliação (Início)
          </button>
        </div>
      </div>
    </ClinicalLayout>
  );
}
