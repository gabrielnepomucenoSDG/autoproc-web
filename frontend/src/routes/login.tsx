import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Ear,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { authStore } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({
  component: Tela01LoginPage,
});

function Tela01LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("rachel.facanha@pacdigital.com.br");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotMessage, setForgotMessage] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    authStore.setToken("dev-clinician-session");
    void navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans text-slate-800">
      {/* Left Half: Deep Royal Blue Institutional Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#0F2342] via-[#153462] to-[#1D4ED8] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative Background Soundwave Rings */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        {/* Top Institutional Badge */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs border border-white/25 flex items-center justify-center shadow-sm">
            <Ear className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-200 block">
              Plataforma Clínica SaaS
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              MVP PAC Digital
            </span>
          </div>
        </div>

        {/* Center Minimalist Vector Illustration of Sound Waves & Audiology */}
        <div className="relative z-10 my-10 lg:my-0 space-y-8 max-w-lg">
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-6 shadow-xl">
            <svg
              viewBox="0 0 420 140"
              className="w-full h-32 text-blue-200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Central Reference Line */}
              <line
                x1="10"
                y1="70"
                x2="410"
                y2="70"
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeDasharray="4 4"
              />
              {/* Minimalist Acoustic Sound Waves */}
              {[
                18, 32, 50, 28, 65, 95, 115, 80, 45, 70, 110, 124, 90, 52, 35,
                68, 104, 84, 48, 96, 118, 76, 40, 24, 54, 30, 16,
              ].map((height, idx) => {
                const x = 22 + idx * 14;
                const y = 70 - height / 2;
                const isPeak = height > 85;
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width="6"
                    height={height}
                    rx="3"
                    fill={isPeak ? "#60A5FA" : "#FFFFFF"}
                    fillOpacity={isPeak ? "0.95" : "0.65"}
                  />
                );
              })}
              {/* Audiology Sine Curve Overlay */}
              <path
                d="M 15 70 Q 65 15, 115 70 T 215 70 T 315 70 T 405 70"
                stroke="#93C5FD"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <div className="mt-3 flex items-center justify-between text-xs text-blue-100/90 border-t border-white/10 pt-3">
              <span className="flex items-center space-x-1.5 font-medium">
                <Activity className="w-4 h-4 text-blue-300" />
                <span>6 Protocolos Padronizados</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-300/30 text-[11px] font-semibold text-white">
                Normatização por Faixa Etária
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              PAC Digital
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 font-medium leading-relaxed">
              Precisão clínica em Processamento Auditivo Central
            </p>
            <p className="text-sm text-blue-200/80 leading-relaxed pt-1">
              Tabulação automatizada de matriz SSW, RGDT, TDD, PSI/SSI, Fala no
              Ruído e Bandinha com emissão instantânea de laudos imutáveis.
            </p>
          </div>
        </div>

        {/* Bottom Institutional Footer */}
        <div className="relative z-10 flex flex-wrap items-center gap-6 text-xs text-blue-200/90 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Registros Clínicos Imutáveis</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-300" />
            <span>Padrão Conselho Federal de Fonoaudiologia</span>
          </div>
        </div>
      </div>

      {/* Right Half: Centered White Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#F8FAFC]">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-lg p-8 sm:p-10 space-y-6">
          {/* Card Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Ambiente Clínico Seguro</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Acesso do Profissional
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Insira suas credenciais para gerenciar pacientes e avaliações PAC.
            </p>
          </div>

          {forgotMessage && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
              Enviamos um link de redefinição de senha para{" "}
              <strong>{email || "seu e-mail profissional"}</strong>.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail Profissional */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-slate-700"
              >
                E-mail Profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@clinica.com.br"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  required
                />
              </div>
            </div>

            {/* Senha with Eye Visibility Icon */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-slate-700"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Alternar visibilidade da senha"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox "Lembrar meu acesso" + Link "Esqueci minha senha" */}
            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-slate-600">
                  Lembrar meu acesso
                </span>
              </label>

              <button
                type="button"
                onClick={() => setForgotMessage(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Esqueci minha senha
              </button>
            </div>

            {/* Primary Button: Entrar na Plataforma */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-sm font-bold shadow-sm hover:shadow transition cursor-pointer"
              >
                Entrar na Plataforma
              </button>
            </div>
          </form>

          {/* Thin Horizontal Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">
                Novo na plataforma?
              </span>
            </div>
          </div>

          {/* Outlined Secondary Button: Criar conta de Fonoaudiólogo */}
          <Link
            to="/cadastro"
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-blue-600 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 text-sm font-semibold flex items-center justify-center transition"
          >
            Criar conta de Fonoaudiólogo
          </Link>
        </div>
      </div>
    </div>
  );
}
