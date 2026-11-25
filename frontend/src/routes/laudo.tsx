import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Printer, FileText, CheckCircle2, Pencil } from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { LaudoResultsTable } from "@/components/laudo/LaudoResultsTable";
import { exportLaudoToDocx } from "@/lib/docx-exporter";
import {
  computeEvaluationSummary,
  finalizeEvaluationState,
  rectifyEvaluationState,
  usePacStore,
} from "@/lib/pac-store";

export const Route = createFileRoute("/laudo")({
  component: Screen8LaudoReviewAndExport,
});

function Screen8LaudoReviewAndExport() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [liveStore, setStore] = usePacStore();

  const activeEval = liveStore.evaluations.find(
    (ev) =>
      ev.id === liveStore.activeEvaluationId &&
      ev.patientId === liveStore.activePatientId,
  );
  // A finalized evaluation is immutable: its report is built from the snapshot
  // saved at finalization, never from protocol edits made afterwards.
  const frozen = activeEval?.status === "finalizada" && activeEval.snapshot;
  const store = frozen ? { ...liveStore, ...frozen } : liveStore;

  const [comportamento, setComportamento] = useState(store.laudo.comportamento);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const summary = computeEvaluationSummary(store);
  const protocolRef = store.activeEvaluationId || "PAC-AVALIACAO";

  const protocolNotes = [
    {
      label: "Bandinha",
      applied: summary.bandinha.applied,
      text: store.bandinha.observacoes,
    },
    {
      label: "Fala no Ruído",
      applied: summary.falaNoRuido.applied,
      text: store.falaNoRuido.observacoes,
    },
    {
      label: `${summary.psi.modeLabel} / MCI`,
      applied: summary.psi.applied,
      text: store.psi.observacoes,
    },
    {
      label: "Processamento Temporal",
      applied: summary.temporal.applied,
      text: store.temporal.observacoes,
    },
    {
      label: "TDD",
      applied: summary.tdd.applied,
      text: store.tdd.observacoes,
    },
    {
      label: "SSW",
      applied: summary.ssw.applied,
      text: store.ssw.observacoes,
    },
  ].filter((n) => n.applied && n.text && n.text.trim().length > 0);

  const isFinalized = savedSuccess || activeEval?.status === "finalizada";

  function handleFinalizeLaudo() {
    setStore((prev) => finalizeEvaluationState(prev, comportamento));
    setSavedSuccess(true);
  }

  function handleRectifyEvaluation() {
    setStore((prev) => rectifyEvaluationState(prev, comportamento));
    setSavedSuccess(false);
    void navigate({ to: "/protocolos/fala-no-ruido" });
  }

  function handleToggleEdit() {
    if (isEditing) {
      setStore((prev) => ({
        ...prev,
        laudo: {
          ...prev.laudo,
          comportamento,
        },
      }));
    }
    setIsEditing(!isEditing);
  }

  function handlePrint() {
    window.print();
  }

  function handleExportDocx() {
    if (isExportingDocx) return;
    setIsExportingDocx(true);
    setStore((prev) => ({
      ...prev,
      laudo: {
        ...prev.laudo,
        comportamento,
      },
    }));
    exportLaudoToDocx(store, { comportamento })
      .catch((error: unknown) => {
        console.error("DOCX export failed", error);
        window.alert(t("pac.laudo.exportFailed"));
      })
      .finally(() => {
        setIsExportingDocx(false);
      });
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
              {isFinalized
                ? "Laudo Finalizado e Salvo no Prontuário (Imutável)"
                : "Laudo Gerado com Sucesso (Pronto para Emissão)"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isFinalized ? (
              <>
                <span className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvo no Prontuário ✓</span>
                </span>
                <button
                  type="button"
                  onClick={handleRectifyEvaluation}
                  className="px-3.5 py-2 rounded-lg border border-blue-600 text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar / Retificar Avaliação</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleFinalizeLaudo}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalizar Laudo</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleEdit}
              disabled={isFinalized}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {isEditing ? "Concluir Edição" : "Editar Observações"}
            </button>
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>
                {isExportingDocx ? "Gerando DOCX..." : "Exportar DOCX"}
              </span>
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
                {store.clinician.clinicLogo ? (
                  <img
                    src={store.clinician.clinicLogo.dataUrl}
                    alt={store.clinician.clinicName}
                    className="max-h-14 max-w-52 object-contain shrink-0"
                  />
                ) : null}
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
              {protocolRef}
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

          {/* Results Table organized in the 4 Taxonomic Clinical Blocks */}
          <LaudoResultsTable summary={summary} />

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

          {/* Conclusão (gerada dinamicamente a partir das 7 habilidades avaliadas) */}
          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-slate-900">Conclusão:</h2>
            <ul className="list-disc list-inside text-xs text-slate-800 space-y-1 leading-relaxed">
              {summary.conclusion.lines.map((item, idx) => (
                <li
                  key={idx}
                  className={
                    idx === 1 && summary.conclusion.alteredSkills.length > 0
                      ? "font-bold text-red-700"
                      : ""
                  }
                >
                  {item}
                </li>
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

          {store.clinician.clinicAddress?.trim() ? (
            <div className="pt-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
              {store.clinician.clinicAddress}
            </div>
          ) : null}
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
