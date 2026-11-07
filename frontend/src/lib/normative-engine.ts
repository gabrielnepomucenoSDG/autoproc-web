export interface NormativeResult {
  status: "Normal" | "Alterado";
  refText: string;
}

export function getTodayBR(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // Format DD/MM/YYYY
  const brMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]) - 1;
    const year = Number(brMatch[3]);
    const parsed = new Date(year, month, day);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  // Format YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    const parsed = new Date(year, month, day);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

export function calculateAgeFromBirthDate(
  birthDateStr: string,
  referenceDateStr?: string,
): { age: number; ageLabel: string } {
  const birthDate = parseDateString(birthDateStr);
  if (!birthDate) {
    return { age: 9, ageLabel: "9 anos" };
  }
  const refDate =
    (referenceDateStr ? parseDateString(referenceDateStr) : null) ?? new Date();

  let years = refDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = refDate.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && refDate.getDate() < birthDate.getDate())
  ) {
    years -= 1;
  }
  const safeYears = Math.max(0, years);
  return {
    age: safeYears,
    ageLabel: `${safeYears} ${safeYears === 1 ? "ano" : "anos"}`,
  };
}

export function parsePatientAge(
  ageOrLabel?: string | number,
  birthDate?: string,
  examDate?: string,
): number {
  if (birthDate && parseDateString(birthDate)) {
    return calculateAgeFromBirthDate(birthDate, examDate).age;
  }
  if (typeof ageOrLabel === "number" && !Number.isNaN(ageOrLabel)) {
    return ageOrLabel;
  }
  if (typeof ageOrLabel === "string") {
    const match = /(\d+)/.exec(ageOrLabel);
    if (match) return Number(match[1]);
  }
  return 9;
}

export function evaluateBandinhaLocalizacao(
  acertos: number,
  direita = true,
  esquerda = true,
): NormativeResult {
  const isNormal = acertos >= 4 && direita && esquerda;
  return {
    status: isNormal ? "Normal" : "Alterado",
    refText: "≥ 4/5 acertos (D e E obrigatórios)",
  };
}

export function evaluateBandinhaMemoria(acertos: number): NormativeResult {
  const isNormal = acertos >= 2;
  return {
    status: isNormal ? "Normal" : "Alterado",
    refText: "≥ 2/3 acertos",
  };
}

export function evaluateFalaNoRuido(
  iprfPct: number,
  frPct: number,
): {
  iprf: NormativeResult;
  fr: NormativeResult;
  diff: NormativeResult;
  diffValue: number;
} {
  const diffValue = Math.abs(iprfPct - frPct);
  return {
    iprf: {
      status: iprfPct >= 88 ? "Normal" : "Alterado",
      refText: "≥ 88%",
    },
    fr: {
      status: frPct >= 72 ? "Normal" : "Alterado",
      refText: "≥ 72%",
    },
    diff: {
      status: diffValue < 20 ? "Normal" : "Alterado",
      refText: "< 20%",
    },
    diffValue,
  };
}

export function evaluatePsiSsi(
  relacao: 0 | -10 | -15,
  scoreOrPct: number,
  isPercent = false,
): NormativeResult {
  const pct = isPercent ? scoreOrPct : scoreOrPct * 10;
  if (relacao === 0) {
    return {
      status: pct >= 80 ? "Normal" : "Alterado",
      refText: "≥ 80%",
    };
  }
  if (relacao === -10) {
    return {
      status: pct >= 70 ? "Normal" : "Alterado",
      refText: "≥ 70%",
    };
  }
  return {
    status: pct >= 60 ? "Normal" : "Alterado",
    refText: "≥ 60%",
  };
}

export function evaluateTemporalAuditec(
  type: "freqHumming" | "freqNomeacao" | "durHumming" | "durNomeacao",
  pct: number,
): NormativeResult {
  const cutoff = type === "durNomeacao" ? 83 : 90;
  return {
    status: pct >= cutoff ? "Normal" : "Alterado",
    refText: `≥ ${cutoff}%`,
  };
}

export function evaluateRgdt(thresholds: {
  500: number;
  1000: number;
  2000: number;
  4000: number;
}): NormativeResult & { media: number } {
  const media =
    (thresholds[500] + thresholds[1000] + thresholds[2000] + thresholds[4000]) /
    4;
  return {
    media,
    status: media <= 10 ? "Normal" : "Alterado",
    refText: "≤ 10 ms",
  };
}

export function evaluateTddIntegracao(
  age: number,
  ear: "OD" | "OE",
  pct: number,
): NormativeResult {
  if (age <= 6) {
    const cutoff = ear === "OD" ? 81 : 74;
    return {
      status: pct >= cutoff ? "Normal" : "Alterado",
      refText: `5-6 anos (${ear}): ≥ ${cutoff}%`,
    };
  }
  if (age <= 8) {
    const cutoff = ear === "OD" ? 85 : 82;
    return {
      status: pct >= cutoff ? "Normal" : "Alterado",
      refText: `7-8 anos (${ear}): ≥ ${cutoff}%`,
    };
  }
  if (age >= 60) {
    return {
      status: pct >= 78 ? "Normal" : "Alterado",
      refText: "60+ anos: ≥ 78%",
    };
  }
  return {
    status: pct >= 95 ? "Normal" : "Alterado",
    refText: "9+ anos: ≥ 95%",
  };
}

export function evaluateTddSeparacao(
  age: number,
  _ear: "OD" | "OE",
  pct: number,
): NormativeResult {
  if (age <= 6) {
    return {
      status: pct >= 70 ? "Normal" : "Alterado",
      refText: "5-6 anos: ≥ 70%",
    };
  }
  if (age <= 8) {
    return {
      status: pct >= 75 ? "Normal" : "Alterado",
      refText: "7-8 anos: ≥ 75%",
    };
  }
  if (age <= 10) {
    return {
      status: pct >= 85 ? "Normal" : "Alterado",
      refText: "9-10 anos: ≥ 85%",
    };
  }
  return {
    status: pct >= 91 ? "Normal" : "Alterado",
    refText: "11+ anos: ≥ 91%",
  };
}

export function evaluateSswQuantitativo(
  _age: number,
  _ear: "DC" | "EC",
  pct: number,
): NormativeResult {
  return {
    status: pct >= 90 ? "Normal" : "Alterado",
    refText: "≥ 90%",
  };
}
