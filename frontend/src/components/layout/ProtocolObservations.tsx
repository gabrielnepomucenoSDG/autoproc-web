import { MessageSquareText } from "lucide-react";

interface ProtocolObservationsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ProtocolObservations({
  value,
  onChange,
  placeholder = "Registre intercorrências, comportamento auditivo, hesitações, fadiga ou observações clínicas relevantes deste protocolo...",
}: ProtocolObservationsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <MessageSquareText className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Observações do Fonoaudiólogo
          </h3>
          <p className="text-xs text-slate-500">
            Anotações clínicas qualitative sobre o desempenho do paciente neste
            protocolo.
          </p>
        </div>
      </div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
      />
    </div>
  );
}
