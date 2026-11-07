import React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Ear,
  FileText,
  User,
  ArrowLeft,
  LayoutGrid,
  Users,
  ClipboardList,
  LogOut,
  Plus,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { usePacStore } from "@/lib/pac-store";
import { authStore } from "@/lib/auth-store";

interface ClinicalLayoutProps {
  currentProtocol?: number;
  protocolNumber?: number;
  title?: string;
  subtitle?: string;
  backHref?: string;
  showProtocolStepper?: boolean;
  showPatientSummary?: boolean;
  hidePageHeader?: boolean;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function ClinicalLayout({
  currentProtocol,
  protocolNumber,
  title,
  subtitle,
  backHref = "/",
  showProtocolStepper,
  showPatientSummary = true,
  hidePageHeader = false,
  headerAction,
  children,
}: ClinicalLayoutProps) {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;
  const [store, setStore] = usePacStore();

  // Pipeline de protocolos deve aparecer em todas as telas de protocolos
  const shouldShowStepper = showProtocolStepper ?? Boolean(currentProtocol);

  function toggleSidebar() {
    setStore((prev) => ({
      ...prev,
      sidebarOpen: !prev.sidebarOpen,
    }));
  }

  function handleLogout() {
    authStore.clearToken();
    setStore((prev) => ({ ...prev, sidebarOpen: false }));
    void navigate({ to: "/login" });
  }

  const mainNav = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutGrid,
      isActive: currentPath === "/" || currentPath === "/dashboard",
    },
    {
      label: "Pacientes",
      path: "/pacientes",
      icon: Users,
      isActive:
        currentPath.startsWith("/pacientes") ||
        currentPath.startsWith("/prontuario"),
    },
    {
      label: "Avaliações",
      path: "/avaliacao-visualizar",
      icon: ClipboardList,
      isActive: currentPath.startsWith("/avaliacao-visualizar"),
    },
    {
      label: "Meu Perfil",
      path: "/perfil",
      icon: User,
      isActive: currentPath.startsWith("/perfil"),
    },
  ];

  // 4 Grandes Blocos Clínicos Taxonômicos ([MELHORIA 06])
  const protocolBlocks = [
    {
      groupTitle: "1. Testes Dióticos",
      items: [
        {
          num: 1,
          name: "Testes Dióticos",
          sub: "(Bandinha)",
          path: "/protocolos/bandinha",
        },
      ],
    },
    {
      groupTitle: "2. Baixa Redundância",
      items: [
        {
          num: 2,
          name: "Fala no Ruído",
          sub: "(IPRF / FR)",
          path: "/protocolos/fala-no-ruido",
        },
        {
          num: 3,
          name: "PSI / SSI",
          sub: "(Mensagem Competitiva)",
          path: "/protocolos/psi-ssi",
        },
      ],
    },
    {
      groupTitle: "3. Processamento Temporal",
      items: [
        {
          num: 4,
          name: "Processamento Temporal",
          sub: "(Freq, Duração e RGDT)",
          path: "/protocolos/processamento-temporal",
        },
      ],
    },
    {
      groupTitle: "4. Tarefas Dicóticas",
      items: [
        {
          num: 5,
          name: "TDD",
          sub: "(Dicótico de Dígitos)",
          path: "/protocolos/tdd",
        },
        {
          num: 6,
          name: "SSW",
          sub: "(Dissílabos Alternados)",
          path: "/protocolos/ssw",
        },
      ],
    },
  ];

  const protocols = protocolBlocks.flatMap((block) => block.items);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans">
      {/* Left Collapsible Sidebar */}
      {store.sidebarOpen && (
        <aside className="w-64 bg-[#112338] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 shrink-0 select-none print:hidden transition-all">
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Brand Logo Block + Close Button */}
            <div className="pt-5 pb-4 px-4 flex items-center justify-between border-b border-slate-800/80">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-white group-hover:bg-blue-600/30 transition shrink-0">
                  <div className="relative flex items-center">
                    <Activity className="w-3.5 h-3.5 text-blue-300 -mr-1" />
                    <Ear className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="font-bold text-sm leading-tight text-white tracking-tight">
                  MVP PAC
                  <br />
                  Digital
                </span>
              </Link>

              <button
                type="button"
                onClick={toggleSidebar}
                title="Fechar barra lateral"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Main Navigation (Dashboard, Pacientes, Avaliações, Meu Perfil) */}
            <div className="py-3 pr-3 space-y-1">
              {mainNav.map((item) => {
                const IconComp = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 pl-5 pr-4 py-2.5 rounded-r-full text-xs sm:text-sm font-medium transition ${
                      item.isActive
                        ? "bg-[#1A73E8] text-white font-semibold shadow-md"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Clinical Protocols & Session Section organized in 4 Taxonomic Blocks */}
            <div className="px-3 pt-3 pb-4 border-t border-slate-800/80 space-y-2.5">
              <div className="px-2 flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>Bateria Clínica</span>
                <Link
                  to="/nova-avaliacao"
                  onClick={() =>
                    setStore((prev) => ({ ...prev, sidebarOpen: false }))
                  }
                  className="text-blue-400 hover:text-blue-300 font-bold"
                >
                  + Iniciar
                </Link>
              </div>

              <Link
                to="/nova-avaliacao"
                onClick={() =>
                  setStore((prev) => ({ ...prev, sidebarOpen: false }))
                }
                className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                  currentPath === "/nova-avaliacao"
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Plus className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Identificação / Bateria</span>
              </Link>

              {protocolBlocks.map((block) => (
                <div key={block.groupTitle} className="space-y-1 pt-1">
                  <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {block.groupTitle}
                  </div>
                  {block.items.map((p) => {
                    const isActive =
                      currentProtocol === p.num || currentPath === p.path;
                    return (
                      <Link
                        key={p.num}
                        to={p.path}
                        className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs transition ${
                          isActive
                            ? "bg-blue-600 text-white shadow-xs font-semibold"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isActive
                              ? "bg-white text-blue-600"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {p.num}
                        </span>
                        <span className="truncate">{p.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}

              <div className="pt-1">
                <Link
                  to="/laudo"
                  className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                    currentPath === "/laudo"
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Emitir Laudo Final</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Logout Button */}
          <div className="p-4 border-t border-slate-800/90">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white transition cursor-pointer"
            >
              <LogOut className="w-5 h-5 rotate-180" />
              <span>Sair</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Right Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Institutional Bar */}
        <header className="bg-[#112338] text-white h-16 px-4 md:px-8 flex items-center justify-between border-b border-slate-800 shadow-xs shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleSidebar}
              title={
                store.sidebarOpen
                  ? "Fechar menu lateral"
                  : "Abrir menu lateral"
              }
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            >
              {store.sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
              <span className="text-xs font-semibold hidden sm:inline">
                {store.sidebarOpen ? "Fechar Menu" : "Menu"}
              </span>
            </button>

            <Link
              to="/perfil"
              className="flex items-center space-x-2.5 text-white hover:text-blue-200 transition"
            >
              <User className="w-5 h-5 text-slate-200" />
              <span className="font-bold text-sm md:text-base tracking-tight">
                Olá, {store.clinician.shortName} (
                {store.clinician.crfa.replace(" - ", "-")})
              </span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setStore((prev) => ({ ...prev, sidebarOpen: false }));
              void navigate({ to: "/nova-avaliacao" });
            }}
            className="px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Avaliação PAC</span>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Pipeline de Protocolos (presente em todas as telas de protocolos) */}
          {shouldShowStepper && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs overflow-x-auto print:hidden">
              <div className="flex items-center justify-between min-w-[760px] text-xs font-medium">
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
                              ? "text-slate-600 hover:text-slate-900"
                              : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : isDone
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {isDone ? "✓" : p.num}
                        </div>
                        <div className="leading-tight">
                          <span className="block">{p.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {p.sub}
                          </span>
                        </div>
                      </Link>
                      {idx < protocols.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-2.5 min-w-[16px] ${
                            isDone ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {!hidePageHeader && (title || subtitle || headerAction) && (
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
                {title && (
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>

              {headerAction ? (
                headerAction
              ) : showPatientSummary ? (
                <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs flex flex-wrap items-center gap-4 text-xs text-slate-600 self-start lg:self-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Paciente
                      </div>
                      <div className="font-semibold text-slate-800">
                        {store.patient.name}
                      </div>
                    </div>
                  </div>
                  <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Nascimento / Idade
                    </div>
                    <div className="font-semibold text-slate-800">
                      {store.patient.birthDate
                        ? `${store.patient.birthDate} (${store.patient.age})`
                        : store.patient.age}
                    </div>
                  </div>
                  <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Data da avaliação
                    </div>
                    <div className="font-semibold text-slate-800">
                      {store.patient.date}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
