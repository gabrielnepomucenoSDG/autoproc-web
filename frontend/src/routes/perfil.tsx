import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  User,
  BadgeCheck,
  Upload,
  Trash2,
  RefreshCw,
  Shield,
  Mail,
  Lock,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";
import { ClinicalLayout } from "@/components/layout/ClinicalLayout";
import { usePacStore } from "@/lib/pac-store";

export const Route = createFileRoute("/perfil")({
  component: Tela06MeuPerfilPage,
});

function Tela06MeuPerfilPage() {
  const [store, setStore] = usePacStore();

  const [name, setName] = useState(store.clinician.name);
  const [title, setTitle] = useState(store.clinician.title);
  const [crfa, setCrfa] = useState(store.clinician.crfa);
  const [phone, setPhone] = useState(store.clinician.phone);
  const [hasSignature, setHasSignature] = useState(
    store.clinician.hasSignature,
  );
  const [email, setEmail] = useState(store.clinician.email);
  const [currentPassword, setCurrentPassword] = useState("••••••••••••");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showToast, setShowToast] = useState(true);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStore((prev) => ({
      ...prev,
      clinician: {
        ...prev.clinician,
        name,
        shortName: name.startsWith("Dra.")
          ? name
          : `Dra. ${name.split(" ")[0]} ${name.split(" ").slice(-1)[0]}`,
        title,
        crfa,
        phone,
        email,
        hasSignature,
      },
    }));
    setShowToast(true);
  }

  return (
    <ClinicalLayout hidePageHeader={true}>
      <form onSubmit={handleSave} className="max-w-5xl mx-auto space-y-6">
        {/* Top Header + Floating Semantic Green Toast Notification */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#112338] tracking-tight">
              Meu Perfil e Configurações Profissionais
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Personalize sua identificação clínica, carimbo digital para laudos
              e credenciais de segurança.
            </p>
          </div>

          {/* Floating Semantic Green Toast Notification */}
          {showToast && (
            <div className="inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
              <span>Cadastro atualizado com sucesso</span>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                className="text-emerald-200 hover:text-white ml-1 cursor-pointer"
                aria-label="Fechar notificação"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Card 1: Dados Profissionais para o Laudo */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#112338]">
                Dados Profissionais para o Laudo
              </h2>
              <p className="text-xs text-slate-500">
                Estas informações aparecem automaticamente no cabeçalho e rodapé
                de todos os laudos gerados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nome Profissional */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nome Profissional
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            {/* Registro CRFa */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Registro CRFa
              </label>
              <input
                type="text"
                value={crfa}
                onChange={(e) => setCrfa(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            {/* Telefone / Contato Clínico */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Telefone / WhatsApp Clínico
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Assinatura e Carimbo Digital */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#112338]">
                Assinatura e Carimbo Digital
              </h2>
              <p className="text-xs text-slate-500">
                Imagem da assinatura e carimbo profissional inserida no
                fechamento dos documentos PDF e DOCX.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left: Upload Area */}
            <div
              onClick={() => setHasSignature(true)}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition min-h-[190px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 text-[#1A73E8] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">
                  Upload de Assinatura / Carimbo Digital (PNG)
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Arraste uma nova imagem PNG com fundo transparente ou clique
                  para atualizar (Recomendado: 600x200px).
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                {hasSignature
                  ? "✓ Assinatura ativa no sistema"
                  : "Nenhuma assinatura selecionada"}
              </span>
            </div>

            {/* Right: Document Footer Preview Box */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pré-visualização no Rodapé do Laudo:
              </div>
              <div className="bg-[#FCFDFE] border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner min-h-[160px]">
                {hasSignature ? (
                  <div className="mb-1 flex flex-col items-center">
                    {/* Scanned Blue Ink Signature SVG */}
                    <svg
                      viewBox="0 0 280 65"
                      className="w-56 h-14 text-[#1E40AF]"
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
                      <path
                        d="M52 52 Q 140 42, 245 49"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeOpacity="0.75"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="h-14 flex items-center justify-center text-xs text-slate-400 italic">
                    (Sem imagem de assinatura)
                  </div>
                )}

                <div className="w-64 border-t border-slate-400 pt-2">
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    {name} - {title} - {crfa.replace("CRFa ", "CRFa. ")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Processamento Auditivo Central • Audiologia Clínica
                  </div>
                </div>
              </div>

              {/* Action Buttons under Preview */}
              <div className="flex items-center justify-end space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setHasSignature(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-blue-600 bg-white text-slate-700 hover:text-blue-700 text-xs font-bold transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Trocar Imagem</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasSignature(false)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Assinatura</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Segurança e Acesso */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#112338]">
                Segurança e Acesso
              </h2>
              <p className="text-xs text-slate-500">
                Atualize seu e-mail de login ou redefina sua senha de acesso à
                plataforma.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* E-mail de Acesso */}
            <div className="space-y-1.5 sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700">
                E-mail de Acesso
              </label>
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition"
                />
              </div>
            </div>

            {/* Senha Atual */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Senha Atual
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition"
                />
              </div>
            </div>

            {/* Nova Senha */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Deixe em branco para manter"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition"
                />
              </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Right Primary Button: Salvar Alterações */}
        <div className="flex justify-end pt-2 pb-6">
          <button
            type="submit"
            className="px-7 py-3 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-sm font-bold flex items-center space-x-2 shadow-sm hover:shadow transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </ClinicalLayout>
  );
}
