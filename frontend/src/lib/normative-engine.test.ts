import { describe, expect, it } from "vitest";
import {
  calculateAgeFromBirthDate,
  evaluateBandinhaLocalizacao,
  evaluateBandinhaMemoria,
  evaluateFalaNoRuido,
  evaluatePsiSsi,
  evaluateRgdt,
  evaluateSswQuantitativo,
  evaluateTddIntegracao,
  evaluateTddSeparacao,
  evaluateTemporalAuditec,
  parseDateString,
  parsePatientAge,
} from "@/lib/normative-engine";
import {
  computeEvaluationSummary,
  type ProtocolSummaryInput,
} from "@/lib/pac-store";

const ALL_TESTS = [
  "1. Fala no Ruído",
  "2. TDD",
  "3. SSW",
  "4. Processamento Temporal/RGDT",
  "5. PSI/SSI",
  "6. Bandinha",
];

function makeBaseInput(
  overrides?: Partial<ProtocolSummaryInput>,
): ProtocolSummaryInput {
  return {
    patient: {
      name: "Paciente Sintético",
      age: "9 anos",
      birthDate: "10/05/2017",
      date: "20/11/2026",
      examiner: "Dra. Rachel Façanha",
      referral: "Encaminhamento Teste",
      selectedTests: [...ALL_TESTS],
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
      od: { intensidade: 70, iprfGravacao: 96, erros: [0, 1] }, // 92%, diff 4%
      oe: { intensidade: 70, iprfGravacao: 96, erros: [0, 1] }, // 92%, diff 4%
      observacoes: "",
    },
    tdd: {
      integracao: {
        odIntensidade: 70,
        odErrors: 1, // 97.5%
        oeIntensidade: 70,
        oeErrors: 1, // 97.5%
      },
      separacao: {
        odIntensidade: 70,
        odErrors: 1, // 95%
        oeIntensidade: 70,
        oeErrors: 1, // 95%
      },
      observacoes: "",
    },
    temporal: {
      freqHumming: 10,
      freqNomeacao: 10,
      durHumming: 10,
      durNomeacao: 9, // 90% >= 83%
      freqHummingGrid: Array.from({ length: 30 }, () => true),
      freqNomeacaoGrid: Array.from({ length: 30 }, () => true),
      durHummingGrid: Array.from({ length: 30 }, () => true),
      durNomeacaoGrid: Array.from({ length: 30 }, (_, i) => i < 27),
      rgdt: { 500: 5, 1000: 5, 2000: 5, 4000: 5 }, // 5 ms
      observacoes: "",
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
      errors: { a: 0, b: 1, c: 1, d: 0, e: 0, f: 1, g: 1, h: 0 }, // DC=95%, EC=95%
      inversoes: 0,
      observacoes: "",
    },
    ...overrides,
  };
}

describe("normative-engine: dates and age calculation", () => {
  it("computes age on exact birthday, day before, and day after", () => {
    expect(calculateAgeFromBirthDate("15/06/2019", "14/06/2026").age).toBe(6);
    expect(calculateAgeFromBirthDate("15/06/2019", "15/06/2026").age).toBe(7);
    expect(calculateAgeFromBirthDate("15/06/2019", "16/06/2026").age).toBe(7);
  });

  it("handles leap-day births (29/02) on leap and non-leap exam dates", () => {
    expect(calculateAgeFromBirthDate("29/02/2020", "28/02/2026").age).toBe(5);
    expect(calculateAgeFromBirthDate("29/02/2020", "01/03/2026").age).toBe(6);
    expect(calculateAgeFromBirthDate("29/02/2020", "29/02/2024").age).toBe(4);
  });

  it("uses the exam date rather than today when parsing patient age", () => {
    expect(parsePatientAge("20 anos", "14/03/1998", "24/11/2007")).toBe(9);
    expect(parsePatientAge("5 anos", "01/12/2019", "01/12/2026")).toBe(7);
  });

  it("parses ISO YYYY-MM-DD and BR DD/MM/YYYY dates", () => {
    const br = parseDateString("01/12/2026");
    const iso = parseDateString("2026-12-01");
    expect(br).not.toBeNull();
    expect(iso).not.toBeNull();
    expect(br?.getFullYear()).toBe(2026);
    expect(br?.getMonth()).toBe(11);
    expect(br?.getDate()).toBe(1);
    expect(iso?.getTime()).toBe(br?.getTime());
  });

  it("D8: invalid birthDate does not silently fall back to 9 years", () => {
    const res = calculateAgeFromBirthDate("data-invalida", "20/11/2026");
    expect(res.age).not.toBe(9);
    expect(parsePatientAge("", "data-invalida", "20/11/2026")).toBeNaN();
  });

  it("D9: impossible calendar dates like 31/02/2020 are rejected", () => {
    expect(parseDateString("31/02/2020")).toBeNull();
    expect(parseDateString("29/02/2021")).toBeNull();
    expect(parseDateString("31/04/2020")).toBeNull();
    expect(parseDateString("2020-02-31")).toBeNull();
  });
});

describe("normative-engine: boundary cutoffs per protocol", () => {
  it("TDD Integração cutoffs (step 2.5%): 5-6, 7-8, 9-59, 60+", () => {
    // 5-6 anos: OD >= 81, OE >= 74
    expect(evaluateTddIntegracao(5, "OD", 80).status).toBe("Alterado");
    expect(evaluateTddIntegracao(5, "OD", 81).status).toBe("Normal");
    expect(evaluateTddIntegracao(6, "OD", 82.5).status).toBe("Normal");
    expect(evaluateTddIntegracao(5, "OE", 72.5).status).toBe("Alterado");
    expect(evaluateTddIntegracao(5, "OE", 74).status).toBe("Normal");
    expect(evaluateTddIntegracao(6, "OE", 75).status).toBe("Normal");

    // 7-8 anos: OD >= 85, OE >= 82
    expect(evaluateTddIntegracao(7, "OD", 82.5).status).toBe("Alterado");
    expect(evaluateTddIntegracao(7, "OD", 85).status).toBe("Normal");
    expect(evaluateTddIntegracao(8, "OD", 87.5).status).toBe("Normal");
    expect(evaluateTddIntegracao(7, "OE", 80).status).toBe("Alterado");
    expect(evaluateTddIntegracao(7, "OE", 82).status).toBe("Normal");
    expect(evaluateTddIntegracao(8, "OE", 82.5).status).toBe("Normal");

    // 9-59 anos: >= 95 (OD and OE)
    for (const age of [9, 30, 59]) {
      for (const ear of ["OD", "OE"] as const) {
        expect(evaluateTddIntegracao(age, ear, 92.5).status).toBe("Alterado");
        expect(evaluateTddIntegracao(age, ear, 95).status).toBe("Normal");
        expect(evaluateTddIntegracao(age, ear, 97.5).status).toBe("Normal");
      }
    }

    // 60+ anos: >= 78
    for (const age of [60, 72]) {
      for (const ear of ["OD", "OE"] as const) {
        expect(evaluateTddIntegracao(age, ear, 77.5).status).toBe("Alterado");
        expect(evaluateTddIntegracao(age, ear, 78).status).toBe("Normal");
        expect(evaluateTddIntegracao(age, ear, 80).status).toBe("Normal");
      }
    }
  });

  it("TDD Separação cutoffs (step 5%): 5-6, 7-8, 9-10, 11-59", () => {
    expect(evaluateTddSeparacao(5, "OD", 65).status).toBe("Alterado");
    expect(evaluateTddSeparacao(5, "OD", 70).status).toBe("Normal");
    expect(evaluateTddSeparacao(6, "OE", 75).status).toBe("Normal");

    expect(evaluateTddSeparacao(7, "OD", 70).status).toBe("Alterado");
    expect(evaluateTddSeparacao(7, "OD", 75).status).toBe("Normal");
    expect(evaluateTddSeparacao(8, "OE", 80).status).toBe("Normal");

    expect(evaluateTddSeparacao(9, "OD", 80).status).toBe("Alterado");
    expect(evaluateTddSeparacao(9, "OD", 85).status).toBe("Normal");
    expect(evaluateTddSeparacao(10, "OE", 90).status).toBe("Normal");

    expect(evaluateTddSeparacao(11, "OD", 90).status).toBe("Alterado");
    expect(evaluateTddSeparacao(11, "OD", 91).status).toBe("Normal");
    expect(evaluateTddSeparacao(35, "OE", 95).status).toBe("Normal");
  });

  it("D1: TDD < 5 anos and TDD Separação >= 60 anos return Não aplicável", () => {
    expect(evaluateTddIntegracao(4, "OD", 100).status).toBe("Não aplicável");
    expect(evaluateTddSeparacao(4, "OE", 100).status).toBe("Não aplicável");
    expect(evaluateTddSeparacao(60, "OD", 95).status).toBe("Não aplicável");
    expect(evaluateTddSeparacao(65, "OE", 80).status).toBe("Não aplicável");
  });

  it("Fala no Ruído cutoffs (step 4%): FR >= 72, IPRF >= 88, diff < 20", () => {
    expect(evaluateFalaNoRuido(84, 68).iprf.status).toBe("Alterado");
    expect(evaluateFalaNoRuido(88, 72).iprf.status).toBe("Normal");
    expect(evaluateFalaNoRuido(92, 76).iprf.status).toBe("Normal");

    expect(evaluateFalaNoRuido(88, 68).fr.status).toBe("Alterado");
    expect(evaluateFalaNoRuido(88, 72).fr.status).toBe("Normal");
    expect(evaluateFalaNoRuido(88, 76).fr.status).toBe("Normal");

    // Diff < 20 (20% is Alterado)
    expect(evaluateFalaNoRuido(92, 76).diff.status).toBe("Normal"); // diff = 16
    expect(evaluateFalaNoRuido(91, 72).diff.status).toBe("Normal"); // diff = 19
    expect(evaluateFalaNoRuido(92, 72).diff.status).toBe("Alterado"); // diff = 20
    expect(evaluateFalaNoRuido(96, 72).diff.status).toBe("Alterado"); // diff = 24
  });

  it("RGDT cutoff: média <= 10 ms", () => {
    expect(evaluateRgdt({ 500: 10, 1000: 10, 2000: 10, 4000: 9 }).status).toBe(
      "Normal",
    ); // 9.75 ms
    expect(evaluateRgdt({ 500: 10, 1000: 10, 2000: 10, 4000: 10 }).status).toBe(
      "Normal",
    ); // 10.00 ms
    expect(evaluateRgdt({ 500: 10, 1000: 10, 2000: 10, 4000: 11 }).status).toBe(
      "Alterado",
    ); // 10.25 ms
  });

  it("SSW quantitativo cutoff (step 2.5%): >= 90% for ages >= 7", () => {
    for (const age of [7, 8, 9, 40]) {
      expect(evaluateSswQuantitativo(age, "DC", 87.5).status).toBe("Alterado");
      expect(evaluateSswQuantitativo(age, "DC", 90).status).toBe("Normal");
      expect(evaluateSswQuantitativo(age, "EC", 92.5).status).toBe("Normal");
    }
  });

  it("D1: SSW below 7 years returns Não aplicável", () => {
    expect(evaluateSswQuantitativo(6, "DC", 95).status).toBe("Não aplicável");
    expect(evaluateSswQuantitativo(6, "EC", 80).status).toBe("Não aplicável");
  });

  it("Temporal Auditec cutoffs (step 10%): Freq >= 90, Dur Hum >= 90, Dur Nom >= 83", () => {
    expect(evaluateTemporalAuditec("freqHumming", 80).status).toBe("Alterado");
    expect(evaluateTemporalAuditec("freqHumming", 90).status).toBe("Normal");
    expect(evaluateTemporalAuditec("freqHumming", 100).status).toBe("Normal");

    expect(evaluateTemporalAuditec("freqNomeacao", 80).status).toBe("Alterado");
    expect(evaluateTemporalAuditec("freqNomeacao", 90).status).toBe("Normal");
    expect(evaluateTemporalAuditec("freqNomeacao", 100).status).toBe("Normal");

    expect(evaluateTemporalAuditec("durHumming", 80).status).toBe("Alterado");
    expect(evaluateTemporalAuditec("durHumming", 90).status).toBe("Normal");
    expect(evaluateTemporalAuditec("durHumming", 100).status).toBe("Normal");

    // 8/10 = 80% Alterado, exact 83% Normal, 9/10 = 90% Normal
    expect(evaluateTemporalAuditec("durNomeacao", 80).status).toBe("Alterado");
    expect(evaluateTemporalAuditec("durNomeacao", 83).status).toBe("Normal");
    expect(evaluateTemporalAuditec("durNomeacao", 90).status).toBe("Normal");
  });

  it("PSI/SSI cutoffs (step 10%): 0 dB >= 80, -10 dB >= 70, -15 dB >= 60", () => {
    expect(evaluatePsiSsi(0, 7).status).toBe("Alterado");
    expect(evaluatePsiSsi(0, 8).status).toBe("Normal");
    expect(evaluatePsiSsi(0, 9).status).toBe("Normal");

    expect(evaluatePsiSsi(-10, 6).status).toBe("Alterado");
    expect(evaluatePsiSsi(-10, 7).status).toBe("Normal");
    expect(evaluatePsiSsi(-10, 8).status).toBe("Normal");

    expect(evaluatePsiSsi(-15, 5).status).toBe("Alterado");
    expect(evaluatePsiSsi(-15, 6).status).toBe("Normal");
    expect(evaluatePsiSsi(-15, 7).status).toBe("Normal");
  });

  it("Bandinha cutoffs: localização >= 4/5 with D and E required, memória >= 2/3", () => {
    expect(evaluateBandinhaLocalizacao(3, true, true).status).toBe("Alterado");
    expect(evaluateBandinhaLocalizacao(4, true, true).status).toBe("Normal");
    expect(evaluateBandinhaLocalizacao(5, true, true).status).toBe("Normal");
    expect(evaluateBandinhaLocalizacao(4, false, true).status).toBe("Alterado");
    expect(evaluateBandinhaLocalizacao(4, true, false).status).toBe("Alterado");

    expect(evaluateBandinhaMemoria(1).status).toBe("Alterado");
    expect(evaluateBandinhaMemoria(2).status).toBe("Normal");
    expect(evaluateBandinhaMemoria(3).status).toBe("Normal");
  });
});

describe("normative-engine: synthetic own cases (A2)", () => {
  it("Case 6 — All Normal (9 years): all 7 skills Normal", () => {
    const input = makeBaseInput();
    const summary = computeEvaluationSummary(input);

    expect(summary.skills.fechamentoAuditivo).toBe("Normal");
    expect(summary.skills.figuraFundo).toBe("Normal");
    expect(summary.skills.integracaoBinaural).toBe("Normal");
    expect(summary.skills.separacaoBinaural).toBe("Normal");
    expect(summary.skills.ordenacaoTemporal).toBe("Normal");
    expect(summary.skills.resolucaoTemporal).toBe("Normal");
    expect(summary.skills.localizacaoSonora).toBe("Normal");
  });

  it("Case 2 — 7 years on exact birthday: uses 7-8 TDD cutoffs and 7+ SSW/Temporal", () => {
    const input = makeBaseInput({
      patient: {
        name: "Lucas Aniversariante",
        age: "7 anos",
        birthDate: "20/11/2019",
        date: "20/11/2026",
        examiner: "Dra. Rachel Façanha",
        referral: "Pediatria",
        selectedTests: [...ALL_TESTS],
      },
      tdd: {
        integracao: {
          odIntensidade: 70,
          odErrors: 6, // 85% -> Normal for 7-8 (would be Alterado for 9+)
          oeIntensidade: 70,
          oeErrors: 7, // 82.5% -> Normal for 7-8
        },
        separacao: {
          odIntensidade: 70,
          odErrors: 5, // 75% -> Normal for 7-8
          oeIntensidade: 70,
          oeErrors: 5, // 75% -> Normal for 7-8
        },
        observacoes: "",
      },
    });
    const summary = computeEvaluationSummary(input);
    expect(summary.tdd.integOdStatus).toBe("Normal");
    expect(summary.tdd.integOeStatus).toBe("Normal");
    expect(summary.tdd.sepOdStatus).toBe("Normal");
    expect(summary.tdd.sepOeStatus).toBe("Normal");
    expect(summary.ssw.dcStatus).toBe("Normal");
    expect(summary.temporal.freqStatus).toBe("Normal");
  });

  it("D1: Case 1 — 6 years marks SSW and Temporal Patterns as Não aplicável", () => {
    const input = makeBaseInput({
      patient: {
        name: "Sofia Seis Anos",
        age: "6 anos",
        birthDate: "10/03/2020",
        date: "20/11/2026",
        examiner: "Dra. Rachel Façanha",
        referral: "Pediatria",
        selectedTests: [...ALL_TESTS],
      },
      // SSW and Temporal raw values intentionally below 7+ cutoffs; must be Não aplicável at age 6
      ssw: {
        errors: { a: 0, b: 5, c: 5, d: 0, e: 0, f: 5, g: 5, h: 0 },
        inversoes: 0,
        observacoes: "",
      },
      temporal: {
        freqHumming: 5,
        freqNomeacao: 5,
        durHumming: 5,
        durNomeacao: 5,
        freqHummingGrid: Array.from({ length: 30 }, () => false),
        freqNomeacaoGrid: Array.from({ length: 30 }, () => false),
        durHummingGrid: Array.from({ length: 30 }, () => false),
        durNomeacaoGrid: Array.from({ length: 30 }, () => false),
        rgdt: { 500: 5, 1000: 5, 2000: 5, 4000: 5 },
        observacoes: "",
      },
    });
    const summary = computeEvaluationSummary(input);

    expect(summary.ssw.dcStatus).toBe("Não aplicável");
    expect(summary.ssw.ecStatus).toBe("Não aplicável");
    expect(summary.temporal.freqStatus).toBe("Não aplicável");
    expect(summary.temporal.durStatus).toBe("Não aplicável");
    // PSI -15 dB is Normal and SSW is Não aplicável -> Figura-fundo = Normal
    expect(summary.skills.figuraFundo).toBe("Normal");
    // Bandinha MV/MNV are Normal and Auditec patterns are Não aplicável -> Ordenação Temporal = Normal
    expect(summary.skills.ordenacaoTemporal).toBe("Normal");
  });

  it("D1: Case 3 — 60+ years marks TDD Separação as Não aplicável while TDD Integração uses >= 78%", () => {
    const input = makeBaseInput({
      patient: {
        name: "Roberto Sessenta Mais",
        age: "64 anos",
        birthDate: "03/04/1962",
        date: "20/11/2026",
        examiner: "Dra. Rachel Façanha",
        referral: "Geriatria",
        selectedTests: [...ALL_TESTS],
      },
      tdd: {
        integracao: {
          odIntensidade: 70,
          odErrors: 8, // 80% >= 78% -> Normal
          oeIntensidade: 70,
          oeErrors: 8, // 80% >= 78% -> Normal
        },
        separacao: {
          odIntensidade: 70,
          odErrors: 6, // 70% -> Não aplicável for 60+
          oeIntensidade: 70,
          oeErrors: 6,
        },
        observacoes: "",
      },
    });
    const summary = computeEvaluationSummary(input);

    expect(summary.tdd.integOdStatus).toBe("Normal");
    expect(summary.tdd.integOeStatus).toBe("Normal");
    expect(summary.skills.integracaoBinaural).toBe("Normal");
    expect(summary.tdd.sepOdStatus).toBe("Não aplicável");
    expect(summary.tdd.sepOeStatus).toBe("Não aplicável");
    expect(summary.skills.separacaoBinaural).toBe("Não aplicável");
  });

  it("D2: Case 4 — partial battery marks unselected protocols as Não avaliado", () => {
    const input = makeBaseInput({
      patient: {
        name: "Clara Bateria Parcial",
        age: "9 anos",
        birthDate: "10/05/2017",
        date: "20/11/2026",
        examiner: "Dra. Rachel Façanha",
        referral: "Escola",
        // Bandinha and SSW unchecked; TDD unchecked
        selectedTests: [
          "1. Fala no Ruído",
          "4. Processamento Temporal/RGDT",
          "5. PSI/SSI",
        ],
      },
      // Residual altered data in unchecked protocols must NOT pollute results
      bandinha: {
        localizacao: {
          direita: false,
          esquerda: false,
          acima: false,
          frente: false,
          atras: false,
        },
        memoriaNaoVerbal: [false, false, false],
        memoriaVerbal: [false, false, false],
        observacoes: "",
      },
      ssw: {
        errors: { a: 0, b: 10, c: 10, d: 0, e: 0, f: 10, g: 10, h: 0 },
        inversoes: 0,
        observacoes: "",
      },
    });
    const summary = computeEvaluationSummary(input);

    expect(summary.bandinha.locStatus).toBe("Não avaliado");
    expect(summary.skills.localizacaoSonora).toBe("Não avaliado");
    expect(summary.tdd.integOdStatus).toBe("Não avaliado");
    expect(summary.skills.integracaoBinaural).toBe("Não avaliado");
    expect(summary.skills.separacaoBinaural).toBe("Não avaliado");
    expect(summary.ssw.dcStatus).toBe("Não avaliado");
    // PSI is Normal and SSW is Não avaliado -> Figura-fundo = Normal
    expect(summary.skills.figuraFundo).toBe("Normal");
    // Temporal Auditec is Normal and Bandinha is Não avaliado -> Ordenação Temporal = Normal
    expect(summary.skills.ordenacaoTemporal).toBe("Normal");
  });

  it("D13: Case 5 — altered humming with normal naming marks Ordenação Temporal as Alterado", () => {
    const input = makeBaseInput({
      temporal: {
        freqHumming: 7, // 70% < 90% -> Alterado
        freqNomeacao: 10, // 100% -> Normal
        durHumming: 10,
        durNomeacao: 10,
        freqHummingGrid: Array.from({ length: 30 }, (_, i) => i < 21),
        freqNomeacaoGrid: Array.from({ length: 30 }, () => true),
        durHummingGrid: Array.from({ length: 30 }, () => true),
        durNomeacaoGrid: Array.from({ length: 30 }, () => true),
        rgdt: { 500: 5, 1000: 5, 2000: 5, 4000: 5 },
        observacoes: "",
      },
    });
    const summary = computeEvaluationSummary(input);

    expect(summary.skills.ordenacaoTemporal).toBe("Alterado");
  });
});

describe("normative-engine: golden case (official laudo Maria Fernanda Torres)", () => {
  // Source: otherfiles/protocols-from-specialist/MARIA FERNANDA TORRES.docx
  // Note on manual error in original laudo: FR OD was written as 77% (impossible with 4% step)
  // and OD diff as 24% (96 - 77 = 19). Here FR OD is corrected to 76% (6 errors -> diff = 20%, Alterado).
  const goldenCase = makeBaseInput({
    patient: {
      name: "Maria Fernanda Torres",
      age: "9 anos",
      birthDate: "14/03/1998",
      date: "24/11/2007",
      examiner: "Débora Fonseca Bittecourt (CRFa 5R - 3126)",
      referral: "Dra. Marcela Filgueiras Antunes",
      selectedTests: [...ALL_TESTS],
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
      // Corrected FR OD = 76% (6 errors, 4% each -> diff = |96 - 76| = 20% -> Alterado)
      od: { intensidade: 70, iprfGravacao: 96, erros: [0, 1, 2, 3, 4, 5] },
      // FR OE = 72% (7 errors -> diff = |96 - 72| = 24% -> Alterado)
      oe: { intensidade: 70, iprfGravacao: 96, erros: [0, 1, 2, 3, 4, 5, 6] },
      observacoes: "",
    },
    psi: {
      mode: "ssi",
      od: {
        db0: 8,
        dbMinus10: 0,
        dbMinus15: 9,
        enabled0: true,
        enabledMinus10: false,
        enabledMinus15: true,
      },
      oe: {
        db0: 8,
        dbMinus10: 0,
        dbMinus15: 9,
        enabled0: true,
        enabledMinus10: false,
        enabledMinus15: true,
      },
      observacoes: "",
    },
    temporal: {
      freqHumming: 10,
      freqNomeacao: 10,
      durHumming: 10,
      durNomeacao: 7, // 70% -> Alterado
      freqHummingGrid: Array.from({ length: 30 }, () => true),
      freqNomeacaoGrid: Array.from({ length: 30 }, () => true),
      durHummingGrid: Array.from({ length: 30 }, () => true),
      durNomeacaoGrid: Array.from({ length: 30 }, (_, i) => i < 21),
      rgdt: { 500: 2, 1000: 5, 2000: 0, 4000: 0 }, // 1.75 ms -> Normal
      observacoes: "",
    },
    tdd: {
      integracao: {
        odIntensidade: 70,
        odErrors: 16, // 60% -> Alterado
        oeIntensidade: 70,
        oeErrors: 18, // 55% -> Alterado
      },
      separacao: {
        odIntensidade: 70,
        odErrors: 4, // 80% -> Alterado
        oeIntensidade: 70,
        oeErrors: 2, // 90% -> Normal
      },
      observacoes: "",
    },
    ssw: {
      errors: { a: 0, b: 4, c: 4, d: 0, e: 0, f: 3, g: 2, h: 1 },
      inversoes: 0,
      observacoes: "",
    },
  });

  it("matches all quantitative scores and agreed skills from official laudo", () => {
    const summary = computeEvaluationSummary(goldenCase);

    expect(summary.bandinha.locCount).toBe(5);
    expect(summary.bandinha.mvCount).toBe(3);
    expect(summary.bandinha.mnvCount).toBe(3);
    expect(summary.skills.localizacaoSonora).toBe("Normal");

    expect(summary.falaNoRuido.odFr).toBe(76);
    expect(summary.falaNoRuido.oeFr).toBe(72);
    expect(summary.falaNoRuido.diffMax).toBe(24);
    expect(summary.skills.fechamentoAuditivo).toBe("Alterado");

    expect(summary.psi.odPct).toBe(90);
    expect(summary.psi.oePct).toBe(90);
    expect(summary.psi.odStatus).toBe("Normal");
    expect(summary.psi.oeStatus).toBe("Normal");

    expect(summary.temporal.rgdtMedia).toBe(1.75);
    expect(summary.skills.resolucaoTemporal).toBe("Normal");
    expect(summary.temporal.durPct).toBe(70);
    expect(summary.skills.ordenacaoTemporal).toBe("Alterado");

    expect(summary.tdd.integOd).toBe(60);
    expect(summary.tdd.integOe).toBe(55);
    expect(summary.skills.integracaoBinaural).toBe("Alterado");
    expect(summary.tdd.sepOd).toBe(80);
    expect(summary.tdd.sepOe).toBe(90);
    expect(summary.tdd.sepOdStatus).toBe("Alterado");
    expect(summary.tdd.sepOeStatus).toBe("Normal");
    expect(summary.skills.separacaoBinaural).toBe("Alterado");

    expect(summary.ssw.dc).toBe(85);
    expect(summary.ssw.ec).toBe(82.5);
    expect(summary.ssw.dcStatus).toBe("Alterado");
    expect(summary.ssw.ecStatus).toBe("Alterado");
    expect(summary.ssw.ordemLabel).toBe("NS");
    expect(summary.ssw.auditivoLabel).toBe("NS");

    // Decisão clínica pendente (U3): official laudo marked Figura-fundo Normal even with SSW Alterado.
    // Code & Parâmetros currently mark Alterado when PSI/SSI -15 dB OR SSW is Alterado.
    expect(summary.skills.figuraFundo).toBe("Alterado");
  });

  it("D7: SSW Tipo A uses official formula max(B,F) - secondLargest (= 0 on golden case)", () => {
    const summary = computeEvaluationSummary(goldenCase);
    expect(summary.ssw.tipoA).toBe(0);
    expect(summary.ssw.tipoALabel).toBe("0 (NS)");
  });

  it("D14: SSW inversões are tracked in state and evaluated against <= 1", () => {
    const withInversions = {
      ...goldenCase,
      ssw: { ...goldenCase.ssw, inversoes: 2 },
    } as ProtocolSummaryInput;
    const summary = computeEvaluationSummary(withInversions) as unknown as {
      ssw: { inversoes?: number; inversoesStatus?: string };
    };
    expect(summary.ssw.inversoes).toBe(2);
    expect(summary.ssw.inversoesStatus).toBe("Alterado");
  });
});

describe("age that cannot be computed", () => {
  it("says the age is invalid instead of '< 7 anos'", () => {
    const result = evaluateSswQuantitativo(Number.NaN, "DC", 100);
    expect(result.status).toBe("Não aplicável");
    expect(result.refText).toBe("Não aplicável (idade inválida)");
  });

  it("keeps the under-age wording for a real young age", () => {
    expect(evaluateSswQuantitativo(6, "DC", 100).refText).toBe(
      "Não aplicável (< 7 anos)",
    );
  });
});
