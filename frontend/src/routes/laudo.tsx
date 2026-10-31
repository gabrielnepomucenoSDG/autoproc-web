import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Printer,
  FileText,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore } from "@/lib/pac-store";

export const Route = createFileRoute("/laudo")({
  component: Screen8LaudoReviewAndExport,
});

function Screen8LaudoReviewAndExport() {
  const navigate = useNavigate();
  const [store] = usePacStore();

  const [comportamento, setComportamento] = useState(store.laudo.comportamento);
  const [isEditing, setIsEditing] = useState(false);

  function handlePrint() {
    window.print();
  }

  function handleExportDocx() {
    alert("Exportação para DOCX (.docx) acionada.");
  }

  return (
    <ClinicalLayout
      title="Revisão e Exportação do Laudo Clínico"
      subtitle="Verifique o laudo gerado automaticamente pelo motor de regras antes da assinatura e exportação."
      backHref="/protocolos/ssw"
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Action Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700">
              Laudo Gerado com Sucesso (Pronto para Emissão)
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
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
          {/* Document Header */}
          <div className="border-b-2 border-slate-800 pb-5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
              Centro de Audiologia Clínica & PAC
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              Dra. Carolina Mendonça — CRFa 2-12345
            </p>
          </div>

          {/* Patient Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs text-slate-700 pt-1">
            <div>
              <span className="font-bold text-slate-900">Data:</span>{" "}
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
              <span className="font-bold text-slate-900">Idade:</span>{" "}
              {store.patient.age}
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

          {/* Results Table */}
          <div className="space-y-3 pt-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Resultados da Bateria de Testes
            </h2>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
                    <th className="p-3">Teste / Protocolo</th>
                    <th className="p-3 text-center w-24">OD</th>
                    <th className="p-3 text-center w-24">OE</th>
                    <th className="p-3 text-center w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      Bandinha (Localização / Memória)
                    </td>
                    <td className="p-3 text-center font-semibold">5/5</td>
                    <td className="p-3 text-center font-semibold">3/3</td>
                    <td className="p-3 text-center">
                      <span className="text-emerald-700 font-bold">Normal</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      Fala no Ruído (Fechamento)
                    </td>
                    <td className="p-3 text-center font-semibold">84%</td>
                    <td className="p-3 text-center font-semibold">92%</td>
                    <td className="p-3 text-center">
                      <span className="text-emerald-700 font-bold">Normal</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      SSW (Dissílabos Alternados)
                    </td>
                    <td className="p-3 text-center font-semibold">90%</td>
                    <td className="p-3 text-center font-semibold">95%</td>
                    <td className="p-3 text-center">
                      <span className="text-emerald-700 font-bold">Normal</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">
                      RGDT (Processamento Temporal)
                    </td>
                    <td className="p-3 text-center font-semibold">14 ms</td>
                    <td className="p-3 text-center font-semibold">15 ms</td>
                    <td className="p-3 text-center">
                      <span className="text-red-600 font-bold">Alterado</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

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
            <div className="w-56 border-b border-slate-400 mb-2"></div>
            <div className="text-sm font-bold text-slate-900">
              Dra. Carolina Mendonça
            </div>
            <div className="text-[11px] text-slate-600">
              Assinado digitalmente por PAC Digital Engine — CRFa 2-12345
            </div>
            <div className="text-[10px] text-slate-400 italic">
              Documento gerado em conformidade com as normas do Conselho Federal de Fonoaudiologia.
            </div>
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="flex justify-between items-center pt-2 pb-6 print:hidden">
          <button
            type="button"
            onClick={() => void navigate({ to: "/protocolos/ssw" })}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            ← Voltar ao Protocolo SSW
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: "/" })}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-xs"
          >
            Nova Avaliação (Início)
          </button>
        </div>
      </div>
    </ClinicalLayout>
  );
}
