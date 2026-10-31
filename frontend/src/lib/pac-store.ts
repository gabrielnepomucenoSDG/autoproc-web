import { useState, useEffect } from "react";

export interface PatientInfo {
  name: string;
  age: string;
  date: string;
  examiner: string;
  referral: string;
  selectedTests: string[];
}

export interface PacState {
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
  };
  falaNoRuido: {
    od: {
      intensidade: number;
      iprfGravacao: number;
      erros: number[]; // indices of errors 0..24
    };
    oe: {
      intensidade: number;
      iprfGravacao: number;
      erros: number[];
    };
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
  };
  temporal: {
    freqHumming: number;
    freqNomeacao: number;
    durHumming: number;
    durNomeacao: number;
    rgdt: {
      500: number;
      1000: number;
      2000: number;
      4000: number;
    };
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
  };
  laudo: {
    comportamento: string;
    conclusao: string[];
    recomendacoes: string[];
  };
}

const defaultState: PacState = {
  patient: {
    name: "Ana Maria de Souza",
    age: "9 anos",
    date: "26/10/2026",
    examiner: "Dra. Carolina Mendonça - CRFa 2-12345",
    referral: "Dr. Roberto Silva - Pediatra",
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
  },
  falaNoRuido: {
    od: {
      intensidade: 70,
      iprfGravacao: 88,
      erros: [2, 9, 16, 22], // 3. ROL, 10. LUZ, 17. TUC, 23. BAI
    },
    oe: {
      intensidade: 70,
      iprfGravacao: 90,
      erros: [3, 13, 20, 24], // 4. PUS, 14. DOR, 21. ZIN, 25. NUF
    },
  },
  tdd: {
    integracao: {
      odIntensidade: 70,
      odErrors: 0,
      oeIntensidade: 70,
      oeErrors: 0,
    },
    separacao: {
      odIntensidade: 70,
      odErrors: 1, // 97.5%
      oeIntensidade: 70,
      oeErrors: 0, // 100%
    },
  },
  temporal: {
    freqHumming: 9,
    freqNomeacao: 8,
    durHumming: 9,
    durNomeacao: 7,
    rgdt: {
      500: 2,
      1000: 5,
      2000: 0,
      4000: 0,
    },
  },
  psi: {
    mode: "psi",
    od: {
      db0: 9,
      dbMinus10: 8,
      dbMinus15: 8,
      enabled0: true,
      enabledMinus10: true,
      enabledMinus15: true,
    },
    oe: {
      db0: 10,
      dbMinus10: 9,
      dbMinus15: 8,
      enabled0: true,
      enabledMinus10: true,
      enabledMinus15: true,
    },
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
  },
  laudo: {
    comportamento:
      "Paciente colaborou bem durante toda a avaliação audiológica, demonstrando atenção sustentada e boa compreensão das instruções verbais. Ausência de sinais de fadiga excessiva.",
    conclusao: [
      "Achados compatíveis com Transtorno do Processamento Auditivo Central (TPAC) leve.",
      "Alteração específica em Processamento Temporal (Resolução Temporal - RGDT).",
    ],
    recomendacoes: [
      "Sugere-se Treinamento Auditivo Acústico/Formal em cabine acústica focado em resolução temporal.",
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
