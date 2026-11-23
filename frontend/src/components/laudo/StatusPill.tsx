import { AlertCircle, Check } from "lucide-react";
import type { NormativeStatus } from "@/lib/normative-engine";

export function StatusPill({ status }: { status: NormativeStatus }) {
  if (status === "Normal") {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#B8ECC8] text-[#0F5132] shrink-0">
        <span className="w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
        <span>Normal</span>
      </span>
    );
  }
  if (status === "Alterado") {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F8C2C2] text-[#7F1D1D] shrink-0">
        <span className="w-4 h-4 rounded-full bg-[#DC2626] text-white flex items-center justify-center">
          <AlertCircle className="w-3 h-3 stroke-[2.5]" />
        </span>
        <span>Alterado</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 shrink-0">
      <span>{status}</span>
    </span>
  );
}
