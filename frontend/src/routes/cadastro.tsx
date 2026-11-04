import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Ear,
  Upload,
  CheckCircle2,
  User,
  BadgeCheck,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { authStore } from "@/lib/auth-store";
import { usePacStore } from "@/lib/pac-store";

export const Route = createFileRoute("/cadastro")({
  component: Tela02CadastroPage,
});

function Tela02CadastroPage() {
  const navigate = useNavigate();
  const [, setStore] = usePacStore();

  const [fullName, setFullName] = useState("Rachel Costa Façanha");
  const [crfa, setCrfa] = useState("CRFa 8R - 7353");
  const [email, setEmail] = useState("rachel.facanha@pacdigital.com.br");
  const [phone, setPhone] = useState("(85) 99982-4510");
  const [password, setPassword] = useState("PacDigital@2026");
  const [confirmPassword, setConfirmPassword] = useState("PacDigital@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [signatureFile, setSignatureFile] = useState<string | null>(
    "assinatura_carimbo_rachel_facanha.png",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStore((prev) => ({
      ...prev,
      clinician: {
        ...prev.clinician,
        name: fullName,
        shortName: fullName.startsWith("Dra.")
          ? fullName
          : `Dra. ${fullName.split(" ")[0]} ${fullName.split(" ").slice(-1)[0]}`,
        crfa,
        email,
        phone,
        hasSignature: Boolean(signatureFile),
      },
    }));
    authStore.setToken("dev-clinician-session");
    void navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 sm:p-10 font-sans text-slate-800">
      {/* Top Institutional Brand Header */}
      <div className="mb-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-[#112338] text-white flex items-center justify-center shadow-xs">
          <Ear className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <span className="text-base font-bold text-slate-900 tracking-tight block leading-none">
            PAC Digital
          </span>
          <span className="text-xs text-slate-500">
            Plataforma Clínica de Processamento Auditivo Central
          </span>
        </div>
      </div>

      {/* Centered Structured White Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
        {/* Card Header */}
        <div className="px-8 pt-8 pb-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Criar Conta Profissional
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure seus dados clínicos e carimbo digital para emissão
              automatizada de laudos PAC.
            </p>
          </div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold self-start sm:self-auto shrink-0">
            <BadgeCheck className="w-4 h-4" />
            <span>Acesso Fonoaudiólogo</span>
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Two-Column Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Rachel Costa Façanha"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/60 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  required
                />
              </div>
            </div>

            {/* Registro CRFa */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Registro CRFa (ex: CRFa 8R - 7353)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={crfa}
                  onChange={(e) => setCrfa(e.target.value)}
                  placeholder="CRFa 8R - 7353"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/60 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  required
                />
              </div>
            </div>

            {/* E-mail Profissional */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                E-mail Profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@clinica.com.br"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/60 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  required
                />
              </div>
            </div>

            {/* Telefone / WhatsApp */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 90000-0000"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/60 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha forte"
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50/60 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Senha + Semantic Green Password Strength Progress Bar */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/60 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  required
                />
              </div>

              {/* Semantic Green Password Strength Bar */}
              <div className="pt-1.5 space-y-1">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div className="h-full flex-1 bg-emerald-500 rounded-full"></div>
                  <div className="h-full flex-1 bg-emerald-500 rounded-full"></div>
                  <div className="h-full flex-1 bg-emerald-500 rounded-full"></div>
                  <div className="h-full flex-1 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Força da senha: Excelente / Segura</span>
                  </span>
                  <span className="text-slate-400">Senhas coincidem</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Dashed Dropzone Box: Upload de Assinatura / Carimbo Digital (PNG) */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              Upload de Assinatura / Carimbo Digital (PNG)
            </label>
            <div
              onClick={() =>
                setSignatureFile(
                  signatureFile
                    ? null
                    : "assinatura_carimbo_rachel_facanha.png",
                )
              }
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition"
            >
              <div className="flex items-center space-x-4 text-center sm:text-left">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">
                    Upload de Assinatura / Carimbo Digital (PNG)
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {signatureFile ? (
                      <span className="text-emerald-700 font-semibold">
                        ✓ Arquivo carregado: {signatureFile} (Fundo transparente
                        validado)
                      </span>
                    ) : (
                      "Arraste sua assinatura em PNG transparente ou clique para selecionar (Máx. 2MB)"
                    )}
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0">
                {signatureFile ? "Alterar PNG" : "Selecionar Arquivo"}
              </span>
            </div>
          </div>

          {/* Bottom Footer of the Card */}
          <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline text-center sm:text-left"
            >
              Já tenho uma conta? Fazer Login
            </Link>

            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-sm font-bold shadow-sm hover:shadow transition cursor-pointer"
            >
              Finalizar Cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
