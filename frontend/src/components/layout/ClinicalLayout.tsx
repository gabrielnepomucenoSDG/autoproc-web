import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Ear,
  Home,
  FileText,
  Settings,
  ChevronDown,
  User,
  ArrowLeft,
} from "lucide-react";
import { usePacStore } from "@/lib/pac-store";

interface ClinicalLayoutProps {
  currentProtocol?: number;
  protocolNumber?: number;
  title: string;
  subtitle: string;
  backHref?: string;
  showProtocolStepper?: boolean;
  children: React.ReactNode;
}

export function ClinicalLayout({
  currentProtocol,
  protocolNumber,
  title,
  subtitle,
  backHref = "/",
  showProtocolStepper = false,
  children,
}: ClinicalLayoutProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [store] = usePacStore();

  const protocols = [
    {
      num: 1,
      name: "Testes Dióticos",
      sub: "(Bandinha)",
      path: "/protocolos/bandinha",
    },
    {
      num: 2,
      name: "Fala no Ruído",
      sub: "(IPRF / FR)",
      path: "/protocolos/fala-no-ruido",
    },
    {
      num: 3,
      name: "TDD",
      sub: "(Dicótico de Dígitos)",
      path: "/protocolos/tdd",
    },
    {
      num: 4,
      name: "Processamento Temporal",
      sub: "(Freq, Duração e RGDT)",
      path: "/protocolos/processamento-temporal",
    },
    {
      num: 5,
      name: "PSI / SSI",
      sub: "(Mensagem Competitiva)",
      path: "/protocolos/psi-ssi",
    },
    {
      num: 6,
      name: "SSW",
      sub: "(Dissílabos Alternados)",
      path: "/protocolos/ssw",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-[#112338] text-white h-14 px-6 flex items-center justify-between border-b border-slate-700/50 shadow-sm shrink-0">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 group-hover:text-white transition">
            <Ear className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            MVP PAC Digital
          </span>
        </Link>

        {/* User profile */}
        <div className="flex items-center space-x-2 text-slate-200 text-sm cursor-pointer hover:text-white transition">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <span className="font-medium text-xs sm:text-sm">Fonoaudióloga</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#112338] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 shrink-0">
          <div className="p-4 space-y-5">
            {/* Inicio Link */}
            <Link
              to="/"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                currentPath === "/"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Início</span>
            </Link>

            {/* Protocolos Header */}
            <div>
              <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Protocolos
              </div>
              <div className="space-y-1">
                {protocols.map((p) => {
                  const isActive =
                    currentProtocol === p.num || currentPath === p.path;
                  return (
                    <Link
                      key={p.num}
                      to={p.path}
                      className={`flex items-start space-x-3 px-3 py-2.5 rounded-lg text-xs transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm font-semibold"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          isActive
                            ? "bg-white text-blue-600"
                            : "bg-slate-700/80 text-slate-300"
                        }`}
                      >
                        {p.num}
                      </span>
                      <div className="leading-tight">
                        <div>{p.name}</div>
                        <div
                          className={`text-[10px] ${isActive ? "text-blue-100" : "text-slate-400"}`}
                        >
                          {p.sub}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sub-menu items */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <Link
                to="/laudo"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  currentPath === "/resultados"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Resultados</span>
              </Link>
              <Link
                to="/laudo"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentPath === "/laudo"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Gerar Laudo</span>
              </Link>
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Top Title & Patient Meta Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              {protocolNumber && (
                <Link
                  to={backHref}
                  className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 mb-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Protocolo {protocolNumber}
                </Link>
              )}
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                {subtitle}
              </p>
            </div>

            {/* Patient Header Card */}
            <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs flex flex-wrap items-center gap-4 text-xs text-slate-600 self-start lg:self-auto">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Paciente</div>
                  <div className="font-semibold text-slate-800">
                    {store.patient.name}
                  </div>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Idade</div>
                <div className="font-semibold text-slate-800">
                  {store.patient.age}
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Data do exame</div>
                <div className="font-semibold text-slate-800">
                  {store.patient.date}
                </div>
              </div>
            </div>
          </div>

          {/* Stepper (seen in Tela 7) */}
          {showProtocolStepper && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs overflow-x-auto">
              <div className="flex items-center justify-between min-w-[700px] text-xs font-medium">
                {protocols.map((p, idx) => {
                  const isActive = currentProtocol === p.num;
                  const isDone = (currentProtocol ?? 1) > p.num;
                  return (
                    <React.Fragment key={p.num}>
                      <Link
                        to={p.path}
                        className={`flex items-center space-x-2 transition ${
                          isActive
                            ? "text-blue-600 font-bold"
                            : isDone
                              ? "text-slate-500 hover:text-slate-800"
                              : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : isDone
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {isDone ? "✓" : p.num}
                        </div>
                        <div>
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            {p.sub}
                          </span>
                        </div>
                      </Link>
                      {idx < protocols.length - 1 && (
                        <div className="h-0.5 flex-1 mx-3 bg-slate-200 min-w-[20px]" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Page Body */}
          {children}
        </main>
      </div>
    </div>
  );
}
