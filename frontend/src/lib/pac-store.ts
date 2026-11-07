import { useState, useEffect } from "react";
import { getTodayBR } from "@/lib/normative-engine";

export interface ClinicianProfile {
  name: string;
  shortName: string;
  title: string;
  crfa: string;
  email: string;
  phone: string;
  hasSignature: boolean;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  ageLabel: string;
  birthDate: string;
  referral: string;
  lastEvaluationDate: string;
  totalExams: number;
  clinicalNotes: string;
}

export interface EvaluationRecord {
  id: string;
  patientId: string;
  patientName: string;
  ageLabel: string;
  date: string;
  status: "finalizada" | "rascunho";
  examiner: string;
  referral: string;
  skills: {
    fechamentoAuditivo: "Normal" | "Alterado";
    figuraFundo: "Normal" | "Alterado";
    integracaoBinaural: "Normal" | "Alterado";
    resolucaoTemporal: "Normal" | "Alterado";
  };
}

export interface PatientInfo {
  name: string;
  age: string;
  birthDate: string;
  date: string;
  examiner: string;
  referral: string;
  selectedTests: string[];
}

export interface PacState {
  clinician: ClinicianProfile;
  patients: PatientRecord[];
  evaluations: EvaluationRecord[];
  activePatientId: string;
  activeEvaluationId: string;
  sidebarOpen: boolean;
  patient: PatientInfo;
  bandinha: {
    localizacao: {
      direita: boolean;
      esquerda: boolean;
      acima: boolean;
      frente: boolean;
      atras: boolean;
    };
    memoriaNaoVerbal: [boolean, boolean, boolean];
    memoriaVerbal: [boolean, boolean, boolean];
    observacoes: string;
  };
  falaNoRuido: {
    od: {
      intensidade: number;
      iprfGravacao: number;
      erros: number[];
    };
    oe: {
      intensidade: number;
      iprfGravacao: number;
      erros: number[];
    };
    observacoes: string;
  };
  tdd: {
    integracao: {
      odIntensidade: number;
      odErrors: number;
      oeIntensidade: number;
      oeErrors: number;
    };
    separacao: {
      odIntensidade: number;
      odErrors: number;
      oeIntensidade: number;
      oeErrors: number;
    };
    observacoes: string;
  };
  temporal: {
    freqHumming: number;
    freqNomeacao: number;
    durHumming: number;
    durNomeacao: number;
    freqHummingGrid: boolean[];
    freqNomeacaoGrid: boolean[];
    durHummingGrid: boolean[];
    durNomeacaoGrid: boolean[];
    rgdt: {
      500: number;
      1000: number;
      2000: number;
      4000: number;
    };
    observacoes: string;
  };
  psi: {
    mode: "psi" | "ssi";
    od: {
      db0: number;
      dbMinus10: number;
      dbMinus15: number;
      enabled0: boolean;
      enabledMinus10: boolean;
      enabledMinus15: boolean;
    };
    oe: {
      db0: number;
      dbMinus10: number;
      dbMinus15: number;
      enabled0: boolean;
      enabledMinus10: boolean;
      enabledMinus15: boolean;
    };
    observacoes: string;
  };
  ssw: {
    errors: {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
      f: number;
      g: number;
      h: number;
    };
    observacoes: string;
  };
  laudo: {
    comportamento: string;
    conclusao: string[];
    recomendacoes: string[];
  };
}

const defaultState: PacState = {
  clinician: {
    name: "Rachel Costa Façanha",
    shortName: "Dra. Rachel Façanha",
    title: "Fonoaudióloga",
    crfa: "CRFa 8R - 7353",
    email: "rachel.facanha@pacdigital.com.br",
    phone: "(85) 99982-4510",
    hasSignature: true,
  },
  patients: [
    {
      id: "pac-1",
      name: "Maria Fernanda Torres",
      age: 9,
      ageLabel: "9 anos",
      birthDate: "14/03/2017",
      referral: "Dra. Marcela Filgueiras Antunes",
      lastEvaluationDate: "24/11/2007",
      totalExams: 3,
      clinicalNotes:
        "Paciente encaminhada para investigação de Processamento Auditivo Central devido a queixas de compreensão em ambientes ruidosos, desatenção auditiva em sala de aula e dificuldade na retenção de instruções verbais longas.",
    },
    {
      id: "pac-2",
      name: "Maria Silva Santos",
      age: 8,
      ageLabel: "8 anos",
      birthDate: "10/06/2017",
      referral: "Dra. Marcela Filgueiras Antunes",
      lastEvaluationDate: "28/04/2025",
      totalExams: 2,
      clinicalNotes:
        "Dificuldade escolar na alfabetização e trocas fonêmicas na escrita. Audiometria tonal dentro dos padrões de normalidade bilateralmente.",
    },
    {
      id: "pac-3",
      name: "João Pedro Oliveira",
      age: 10,
      ageLabel: "10 anos",
      birthDate: "22/01/2015",
      referral: "Dr. Roberto Silva (Neuropediatra)",
      lastEvaluationDate: "15/04/2025",
      totalExams: 1,
      clinicalNotes:
        "Avaliação solicitada para diagnóstico diferencial com TDAH. Queixa principal de distração fácil com estímulos sonoros competitivos.",
    },
    {
      id: "pac-4",
      name: "Ana Clara Ferreira",
      age: 7,
      ageLabel: "7 anos",
      birthDate: "05/09/2018",
      referral: "Dra. Patrícia Mendes (Otorrinolaringologista)",
      lastEvaluationDate: "10/04/2025",
      totalExams: 2,
      clinicalNotes:
        "Histórico de otites de repetição na primeira infância. Solicita repetição frequente ('hã?', 'o quê?') em conversas familiares.",
    },
    {
      id: "pac-5",
      name: "Lucas Martins Souza",
      age: 9,
      ageLabel: "9 anos",
      birthDate: "18/11/2016",
      referral: "Dra. Marcela Filgueiras Antunes",
      lastEvaluationDate: "05/04/2025",
      totalExams: 1,
      clinicalNotes:
        "Reavaliação pós-treinamento auditivo formal em cabine acústica.",
    },
    {
      id: "pac-6",
      name: "Beatriz Almeida Lima",
      age: 8,
      ageLabel: "8 anos",
      birthDate: "30/07/2017",
      referral: "Dr. Fernando Gomes (Pediatra)",
      lastEvaluationDate: "01/04/2025",
      totalExams: 1,
      clinicalNotes:
        "Encaminhamento fonoaudiológico escolar para avaliação das habilidades de resolução temporal e figura-fundo.",
    },
    {
      id: "pac-7",
      name: "Gabriel Henrique Costa",
      age: 11,
      ageLabel: "11 anos",
      birthDate: "12/02/2014",
      referral: "Dr. Carlos Eduardo Lopes",
      lastEvaluationDate: "28/03/2025",
      totalExams: 2,
      clinicalNotes:
        "Paciente em acompanhamento anual de habilidades auditivas binaurais.",
    },
    {
      id: "pac-8",
      name: "Antônio Carlos Magalhães Neto",
      age: 64,
      ageLabel: "64 anos",
      birthDate: "03/04/1962",
      referral: "Dr. Henrique Bastos (Geriatra)",
      lastEvaluationDate: "15/03/2025",
      totalExams: 1,
      clinicalNotes:
        "Queixa de dificuldade de inteligibilidade de fala no ruído social apesar de limiares tonais preservados.",
    },
  ],
  evaluations: [
    {
      id: "eval-1",
      patientId: "pac-2",
      patientName: "Maria Silva Santos",
      ageLabel: "8 anos",
      date: "28/04/2025",
      status: "finalizada",
      examiner: "Dra. Rachel Façanha",
      referral: "Dra. Marcela Filgueiras Antunes",
      skills: {
        fechamentoAuditivo: "Normal",
        figuraFundo: "Normal",
        integracaoBinaural: "Alterado",
        resolucaoTemporal: "Normal",
      },
    },
    {
      id: "eval-2",
      patientId: "pac-3",
      patientName: "João Pedro Oliveira",
      ageLabel: "10 anos",
      date: "15/04/2025",
      status: "rascunho",
      examiner: "Dra. Rachel Façanha",
      referral: "Dr. Roberto Silva (Neuropediatra)",
      skills: {
        fechamentoAuditivo: "Alterado",
        figuraFundo: "Normal",
        integracaoBinaural: "Normal",
        resolucaoTemporal: "Alterado",
      },
    },
    {
      id: "eval-3",
      patientId: "pac-4",
      patientName: "Ana Clara Ferreira",
      ageLabel: "7 anos",
      date: "10/04/2025",
      status: "finalizada",
      examiner: "Dra. Rachel Façanha",
      referral: "Dra. Patrícia Mendes",
      skills: {
        fechamentoAuditivo: "Normal",
        figuraFundo: "Normal",
        integracaoBinaural: "Normal",
        resolucaoTemporal: "Normal",
      },
    },
    {
      id: "eval-4",
      patientId: "pac-5",
      patientName: "Lucas Martins Souza",
      ageLabel: "9 anos",
      date: "05/04/2025",
      status: "finalizada",
      examiner: "Dra. Rachel Façanha",
      referral: "Dra. Marcela Filgueiras Antunes",
      skills: {
        fechamentoAuditivo: "Alterado",
        figuraFundo: "Normal",
        integracaoBinaural: "Alterado",
        resolucaoTemporal: "Normal",
      },
    },
    {
      id: "eval-5",
      patientId: "pac-6",
      patientName: "Beatriz Almeida Lima",
      ageLabel: "8 anos",
      date: "01/04/2025",
      status: "rascunho",
      examiner: "Dra. Rachel Façanha",
      referral: "Dr. Fernando Gomes",
      skills: {
        fechamentoAuditivo: "Normal",
        figuraFundo: "Alterado",
        integracaoBinaural: "Normal",
        resolucaoTemporal: "Normal",
      },
    },
    {
      id: "eval-6",
      patientId: "pac-7",
      patientName: "Gabriel Henrique Costa",
      ageLabel: "11 anos",
      date: "28/03/2025",
      status: "finalizada",
      examiner: "Dra. Rachel Façanha",
      referral: "Dr. Carlos Eduardo Lopes",
      skills: {
        fechamentoAuditivo: "Normal",
        figuraFundo: "Normal",
        integracaoBinaural: "Normal",
        resolucaoTemporal: "Normal",
      },
    },
    {
      id: "eval-7",
      patientId: "pac-1",
      patientName: "Maria Fernanda Torres",
      ageLabel: "9 anos",
      date: "24/11/2007",
      status: "finalizada",
      examiner: "Dra. Rachel Façanha",
      referral: "Dra. Marcela Filgueiras Antunes",
      skills: {
        fechamentoAuditivo: "Alterado",
        figuraFundo: "Normal",
        integracaoBinaural: "Alterado",
        resolucaoTemporal: "Normal",
      },
    },
    {
      id: "eval-8",
      patientId: "pac-1",
      patientName: "Maria Fernanda Torres",
      ageLabel: "9 anos",
      date: "26/10/2026",
      status: "finalizada",
      examiner: "Dra. Rachel Façanha",
      referral: "Dra. Marcela Filgueiras Antunes",
      skills: {
        fechamentoAuditivo: "Normal",
        figuraFundo: "Normal",
        integracaoBinaural: "Alterado",
        resolucaoTemporal: "Normal",
      },
    },
    {
      id: "eval-9",
      patientId: "pac-1",
      patientName: "Maria Fernanda Torres",
      ageLabel: "8 anos",
      date: "12/05/2006",
      status: "finalizada",
      examiner: "Dra. Rachel Façanha",
      referral: "Dra. Marcela Filgueiras Antunes",
      skills: {
        fechamentoAuditivo: "Alterado",
        figuraFundo: "Alterado",
        integracaoBinaural: "Alterado",
        resolucaoTemporal: "Normal",
      },
    },
  ],
  activePatientId: "pac-1",
  activeEvaluationId: "eval-8",
  sidebarOpen: false,
  patient: {
    name: "Maria Fernanda Torres",
    age: "9 anos",
    birthDate: "14/03/2017",
    date: getTodayBR(),
    examiner: "Rachel Costa Façanha - CRFa 8R - 7353",
    referral: "Dra. Marcela Filgueiras Antunes",
    selectedTests: [
      "1. Bandinha",
      "2. Fala no Ruído",
      "3. PSI/SSI",
      "4. Processamento Temporal/RGDT",
      "5. TDD",
      "6. SSW",
    ],
  },
  bandinha: {
    localizacao: {
      direita: true,
      esquerda: true,
      acima: true,
      frente: true,
      atras: true,
    },
    memoriaNaoVerbal: [true, true, true],
    memoriaVerbal: [true, true, true],
    observacoes: "",
  },
  falaNoRuido: {
    od: {
      intensidade: 70,
      iprfGravacao: 96,
      erros: [2],
    },
    oe: {
      intensidade: 70,
      iprfGravacao: 92,
      erros: [3, 13],
    },
    observacoes: "",
  },
  tdd: {
    integracao: {
      odIntensidade: 70,
      odErrors: 1,
      oeIntensidade: 70,
      oeErrors: 1,
    },
    separacao: {
      odIntensidade: 70,
      odErrors: 1,
      oeIntensidade: 70,
      oeErrors: 0,
    },
    observacoes: "",
  },
  temporal: {
    freqHumming: 10,
    freqNomeacao: 9,
    durHumming: 10,
    durNomeacao: 9,
    freqHummingGrid: Array.from({ length: 30 }, () => true),
    freqNomeacaoGrid: Array.from({ length: 30 }, (_, i) => i < 27),
    durHummingGrid: Array.from({ length: 30 }, () => true),
    durNomeacaoGrid: Array.from({ length: 30 }, (_, i) => i < 27),
    rgdt: {
      500: 2,
      1000: 5,
      2000: 0,
      4000: 0,
    },
    observacoes: "",
  },
  psi: {
    mode: "psi",
    od: {
      db0: 9,
      dbMinus10: 9,
      dbMinus15: 8,
      enabled0: true,
      enabledMinus10: true,
      enabledMinus15: true,
    },
    oe: {
      db0: 9,
      dbMinus10: 8,
      dbMinus15: 8,
      enabled0: true,
      enabledMinus10: true,
      enabledMinus15: true,
    },
    observacoes: "",
  },
  ssw: {
    errors: {
      a: 1,
      b: 2,
      c: 0,
      d: 1,
      e: 1,
      f: 1,
      g: 2,
      h: 0,
    },
    observacoes: "",
  },
  laudo: {
    comportamento:
      "Paciente colaborou bem durante toda a avaliação audiológica, demonstrando atenção sustentada e boa compreensão das instruções verbais. Ausência de sinais de fadiga excessiva.",
    conclusao: [
      "Achados compatíveis com Transtorno do Processamento Auditivo Central (TPAC).",
      "Alteração nas habilidades de Fechamento Auditivo e Integração Binaural.",
    ],
    recomendacoes: [
      "Sugere-se Treinamento Auditivo Acústico/Formal em cabine acústica.",
      "Adaptações acústicas e visuais no ambiente escolar (sentar nas primeiras fileiras, reduzir ruído de fundo).",
      "Reavaliação fonoaudiológica após 6 meses de intervenção.",
    ],
  },
};

let currentState: PacState = defaultState;
const listeners = new Set<(state: PacState) => void>();

export const pacStore = {
  getState(): PacState {
    return currentState;
  },
  setState(updater: Partial<PacState> | ((prev: PacState) => PacState)): void {
    if (typeof updater === "function") {
      currentState = updater(currentState);
    } else {
      currentState = { ...currentState, ...updater };
    }
    listeners.forEach((listener) => listener(currentState));
  },
  subscribe(listener: (state: PacState) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function usePacStore(): [PacState, typeof pacStore.setState] {
  const [state, setState] = useState<PacState>(pacStore.getState());

  useEffect(() => {
    return pacStore.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  return [state, pacStore.setState];
}
