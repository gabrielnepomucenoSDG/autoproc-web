import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { PacState } from "@/lib/pac-store";
import {
  evaluateBandinhaLocalizacao,
  evaluateBandinhaMemoria,
  evaluateFalaNoRuido,
  evaluatePsiSsi,
  evaluateRgdt,
  evaluateSswQuantitativo,
  evaluateTddIntegracao,
  evaluateTddSeparacao,
  evaluateTemporalAuditec,
  parsePatientAge,
} from "@/lib/normative-engine";

export interface DocxExportOptions {
  comportamento?: string;
}

const BORDER_COLOR = "CBD5E1";
const HEADER_BG = "F1F5F9";
const SUBHEADER_BG = "F8FAFC";
const PRIMARY_DARK = "112338";
const NORMAL_COLOR = "15803D";
const ALTERADO_COLOR = "DC2626";
const MUTED_TEXT = "475569";

const defaultBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
};

export function buildLaudoFilename(
  patientName: string,
  evaluationDate: string,
): string {
  const normalizedName = (patientName || "Paciente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const normalizedDate = (evaluationDate || "Data")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9-]+/g, "");
  return `Laudo_PAC_${normalizedName || "Paciente"}_${normalizedDate || "Avaliacao"}.docx`;
}

function createTextParagraph(
  text: string,
  opts?: {
    bold?: boolean;
    italics?: boolean;
    size?: number;
    color?: string;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    before?: number;
    after?: number;
    bullet?: boolean;
  },
): Paragraph {
  return new Paragraph({
    alignment: opts?.align ?? AlignmentType.LEFT,
    spacing: { before: opts?.before, after: opts?.after ?? 60 },
    bullet: opts?.bullet ? { level: 0 } : undefined,
    children: [
      new TextRun({
        text,
        bold: opts?.bold ?? false,
        italics: opts?.italics ?? false,
        size: opts?.size ?? 20,
        color: opts?.color ?? PRIMARY_DARK,
        font: "Arial",
      }),
    ],
  });
}

function createCell(
  text: string,
  options?: {
    bold?: boolean;
    color?: string;
    shading?: string;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    colSpan?: number;
    widthPct?: number;
  },
): TableCell {
  return new TableCell({
    columnSpan: options?.colSpan,
    width: options?.widthPct
      ? { size: options.widthPct, type: WidthType.PERCENTAGE }
      : undefined,
    shading: options?.shading
      ? { fill: options.shading, type: ShadingType.CLEAR, color: "auto" }
      : undefined,
    borders: defaultBorders,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      createTextParagraph(text, {
        bold: options?.bold,
        color: options?.color,
        align: options?.align,
        after: 0,
      }),
    ],
  });
}

function createStatusCell(status: "Normal" | "Alterado"): TableCell {
  return createCell(status, {
    bold: true,
    color: status === "Normal" ? NORMAL_COLOR : ALTERADO_COLOR,
    align: AlignmentType.CENTER,
  });
}

function createMetaRow(
  l1: string,
  v1: string,
  l2: string,
  v2: string,
): TableRow {
  return new TableRow({
    children: [
      createCell(l1, { bold: true, shading: HEADER_BG, widthPct: 22 }),
      createCell(v1, { widthPct: 28 }),
      createCell(l2, { bold: true, shading: HEADER_BG, widthPct: 22 }),
      createCell(v2, { widthPct: 28 }),
    ],
  });
}

function createBlockHeaderRow(title: string): TableRow {
  return new TableRow({
    children: [
      createCell(title, { bold: true, shading: SUBHEADER_BG, colSpan: 5 }),
    ],
  });
}

function createResultRow(
  protocol: string,
  odResult: string,
  oeDetail: string,
  reference: string,
  status: "Normal" | "Alterado",
): TableRow {
  return new TableRow({
    children: [
      createCell(protocol),
      createCell(odResult, { align: AlignmentType.CENTER }),
      createCell(oeDetail, { align: AlignmentType.CENTER }),
      createCell(reference, { align: AlignmentType.CENTER }),
      createStatusCell(status),
    ],
  });
}

function createSectionTitle(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24,
        color: PRIMARY_DARK,
        font: "Arial",
      }),
    ],
  });
}

export async function generateLaudoDocxBlob(
  state: PacState,
  options?: DocxExportOptions,
): Promise<Blob> {
  const comportamentoText =
    options?.comportamento !== undefined
      ? options.comportamento
      : state.laudo.comportamento;

  const patientAge = parsePatientAge(
    state.patient.age,
    state.patient.birthDate,
    state.patient.date,
  );

  // 1. Testes Dióticos (Bandinha)
  const locCount = Object.values(state.bandinha.localizacao).filter(
    Boolean,
  ).length;
  const mnvCount = state.bandinha.memoriaNaoVerbal.filter(Boolean).length;
  const mvCount = state.bandinha.memoriaVerbal.filter(Boolean).length;
  const locNorm = evaluateBandinhaLocalizacao(
    locCount,
    state.bandinha.localizacao.direita,
    state.bandinha.localizacao.esquerda,
  );
  const mnvNorm = evaluateBandinhaMemoria(mnvCount);
  const mvNorm = evaluateBandinhaMemoria(mvCount);
  const bandinhaStatus: "Normal" | "Alterado" =
    locNorm.status === "Normal" &&
    mnvNorm.status === "Normal" &&
    mvNorm.status === "Normal"
      ? "Normal"
      : "Alterado";

  // 2. Tarefas Monoaurais de Baixa Redundância (Fala no Ruído e PSI/SSI)
  const odFr = Math.max(0, 100 - state.falaNoRuido.od.erros.length * 4);
  const oeFr = Math.max(0, 100 - state.falaNoRuido.oe.erros.length * 4);
  const odFrEval = evaluateFalaNoRuido(state.falaNoRuido.od.iprfGravacao, odFr);
  const oeFrEval = evaluateFalaNoRuido(state.falaNoRuido.oe.iprfGravacao, oeFr);
  const frStatus: "Normal" | "Alterado" =
    odFrEval.fr.status === "Normal" &&
    oeFrEval.fr.status === "Normal" &&
    odFrEval.diff.status === "Normal" &&
    oeFrEval.diff.status === "Normal"
      ? "Normal"
      : "Alterado";

  const psiOd0 = evaluatePsiSsi(0, state.psi.od.db0);
  const psiOd10 = evaluatePsiSsi(-10, state.psi.od.dbMinus10);
  const psiOd15 = evaluatePsiSsi(-15, state.psi.od.dbMinus15);
  const psiOe15 = evaluatePsiSsi(-15, state.psi.oe.dbMinus15);
  const psiStatus: "Normal" | "Alterado" =
    psiOd15.status === "Normal" && psiOe15.status === "Normal"
      ? "Normal"
      : "Alterado";

  // 3. Processamento Temporal
  const freqHummingPct = Math.round((state.temporal.freqHumming / 10) * 100);
  const freqNomeacaoPct = Math.round((state.temporal.freqNomeacao / 10) * 100);
  const durHummingPct = Math.round((state.temporal.durHumming / 10) * 100);
  const durNomeacaoPct = Math.round((state.temporal.durNomeacao / 10) * 100);
  const freqHummingNorm = evaluateTemporalAuditec(
    "freqHumming",
    freqHummingPct,
  );
  const freqNorm = evaluateTemporalAuditec("freqNomeacao", freqNomeacaoPct);
  const durHummingNorm = evaluateTemporalAuditec("durHumming", durHummingPct);
  const durNorm = evaluateTemporalAuditec("durNomeacao", durNomeacaoPct);
  const temporalOrdStatus: "Normal" | "Alterado" =
    freqNorm.status === "Normal" && durNorm.status === "Normal"
      ? "Normal"
      : "Alterado";
  const rgdtEval = evaluateRgdt(state.temporal.rgdt);

  // 4. Tarefas Dicóticas (TDD e SSW)
  const tddIntegOd = Math.max(0, 100 - state.tdd.integracao.odErrors * 2.5);
  const tddIntegOe = Math.max(0, 100 - state.tdd.integracao.oeErrors * 2.5);
  const tddSepOd = Math.max(0, 100 - state.tdd.separacao.odErrors * 5);
  const tddSepOe = Math.max(0, 100 - state.tdd.separacao.oeErrors * 5);
  const tddIntegOdNorm = evaluateTddIntegracao(patientAge, "OD", tddIntegOd);
  const tddIntegOeNorm = evaluateTddIntegracao(patientAge, "OE", tddIntegOe);
  const tddSepOdNorm = evaluateTddSeparacao(patientAge, "OD", tddSepOd);
  const tddSepOeNorm = evaluateTddSeparacao(patientAge, "OE", tddSepOe);
  const tddStatus: "Normal" | "Alterado" =
    tddIntegOdNorm.status === "Normal" &&
    tddIntegOeNorm.status === "Normal" &&
    tddSepOdNorm.status === "Normal" &&
    tddSepOeNorm.status === "Normal"
      ? "Normal"
      : "Alterado";

  const { a, b, c, d, e, f, g, h } = state.ssw.errors;
  const dncTotal = a + h;
  const dcTotal = b + g;
  const ecTotal = c + f;
  const encTotal = d + e;
  const sswDc = Math.max(0, 100 - dcTotal * 2.5);
  const sswEc = Math.max(0, 100 - ecTotal * 2.5);
  const sswDcNorm = evaluateSswQuantitativo(patientAge, "DC", sswDc);
  const sswEcNorm = evaluateSswQuantitativo(patientAge, "EC", sswEc);
  const sswStatus: "Normal" | "Alterado" =
    sswDcNorm.status === "Normal" && sswEcNorm.status === "Normal"
      ? "Normal"
      : "Alterado";

  const efeitoAuditivo = a + b + c + d - (e + f + g + h);
  const efeitoOrdem = a + b + e + f - (c + d + g + h);
  const efeitoAuditivoNormal = efeitoAuditivo >= -4 && efeitoAuditivo <= 4;
  const efeitoOrdemNormal = efeitoOrdem >= -3 && efeitoOrdem <= 3;

  const skillsSummary: Array<{ label: string; status: "Normal" | "Alterado" }> =
    [
      { label: "Fechamento Auditivo", status: frStatus },
      {
        label: "Figura-Fundo",
        status:
          psiStatus === "Normal" && sswStatus === "Normal"
            ? "Normal"
            : "Alterado",
      },
      {
        label: "Integração Binaural",
        status:
          tddIntegOdNorm.status === "Normal" &&
          tddIntegOeNorm.status === "Normal"
            ? "Normal"
            : "Alterado",
      },
      {
        label: "Separação Binaural",
        status:
          tddSepOdNorm.status === "Normal" && tddSepOeNorm.status === "Normal"
            ? "Normal"
            : "Alterado",
      },
      {
        label: "Ordenação Temporal",
        status:
          mnvNorm.status === "Normal" &&
          mvNorm.status === "Normal" &&
          freqNorm.status === "Normal" &&
          durNorm.status === "Normal"
            ? "Normal"
            : "Alterado",
      },
      { label: "Resolução Temporal", status: rgdtEval.status },
      { label: "Localização Sonora", status: locNorm.status },
    ];

  const alteredSkills = skillsSummary
    .filter((s) => s.status === "Alterado")
    .map((s) => s.label);

  const protocolNotes = [
    { label: "Bandinha", text: state.bandinha.observacoes },
    { label: "Fala no Ruído", text: state.falaNoRuido.observacoes },
    { label: "PSI / SSI", text: state.psi.observacoes },
    { label: "Processamento Temporal", text: state.temporal.observacoes },
    { label: "TDD", text: state.tdd.observacoes },
    { label: "SSW", text: state.ssw.observacoes },
  ].filter((n) => n.text && n.text.trim().length > 0);

  const children: Array<Paragraph | Table> = [];

  if (state.clinician.hasClinicLogo) {
    children.push(
      createTextParagraph(
        (
          state.clinician.clinicName || "Centro de Audiologia Clínica & PAC"
        ).toUpperCase(),
        { bold: true, size: 28, align: AlignmentType.CENTER, after: 60 },
      ),
      createTextParagraph(
        `${state.clinician.name} — ${state.clinician.title} — ${state.clinician.crfa}`,
        {
          bold: true,
          size: 20,
          color: MUTED_TEXT,
          align: AlignmentType.CENTER,
          after: 180,
        },
      ),
    );
  }

  const birthAndAge = state.patient.birthDate
    ? `${state.patient.birthDate} (${state.patient.age})`
    : state.patient.age;

  children.push(
    createTextParagraph("AVALIAÇÃO DO PROCESSAMENTO AUDITIVO CENTRAL", {
      bold: true,
      size: 26,
      align: AlignmentType.CENTER,
      before: 80,
      after: 240,
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        createMetaRow(
          "Paciente:",
          state.patient.name,
          "Data da Avaliação:",
          state.patient.date,
        ),
        createMetaRow(
          "Nascimento / Idade:",
          birthAndAge,
          "Ref. Protocolo:",
          "PAC-2026-891",
        ),
        createMetaRow(
          "Encaminhamento:",
          state.patient.referral,
          "Examinador(a):",
          `${state.clinician.name} (${state.clinician.crfa})`,
        ),
      ],
    }),
    createSectionTitle(
      "Resumo da Avaliação Comportamental (7 Habilidades Auditivas)",
    ),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createCell("Habilidade Auditiva Avaliada", {
              bold: true,
              shading: HEADER_BG,
              widthPct: 70,
            }),
            createCell("Status Normativo", {
              bold: true,
              shading: HEADER_BG,
              align: AlignmentType.CENTER,
              widthPct: 30,
            }),
          ],
        }),
        ...skillsSummary.map(
          (skill) =>
            new TableRow({
              children: [
                createCell(skill.label),
                createStatusCell(skill.status),
              ],
            }),
        ),
      ],
    }),
    createSectionTitle("Resultados da Bateria de Testes"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createCell("Bloco / Protocolo Clínico", {
              bold: true,
              shading: HEADER_BG,
              widthPct: 38,
            }),
            createCell("OD / Resultado", {
              bold: true,
              shading: HEADER_BG,
              align: AlignmentType.CENTER,
              widthPct: 18,
            }),
            createCell("OE / Detalhe", {
              bold: true,
              shading: HEADER_BG,
              align: AlignmentType.CENTER,
              widthPct: 18,
            }),
            createCell("Referência", {
              bold: true,
              shading: HEADER_BG,
              align: AlignmentType.CENTER,
              widthPct: 14,
            }),
            createCell("Status", {
              bold: true,
              shading: HEADER_BG,
              align: AlignmentType.CENTER,
              widthPct: 12,
            }),
          ],
        }),
        createBlockHeaderRow("1. TESTES DIÓTICOS"),
        createResultRow(
          "Bandinha (Localização / Memória S.V. e S.N.V.)",
          `Loc: ${locCount}/5`,
          `SV: ${mvCount}/3 | SNV: ${mnvCount}/3`,
          "Loc ≥ 4/5 | Mem ≥ 2/3",
          bandinhaStatus,
        ),
        createBlockHeaderRow("2. TAREFAS MONOAURAIS DE BAIXA REDUNDÂNCIA"),
        createResultRow(
          "IPRF com Gravação",
          `${state.falaNoRuido.od.iprfGravacao}%`,
          `${state.falaNoRuido.oe.iprfGravacao}%`,
          odFrEval.iprf.refText,
          odFrEval.iprf.status === "Normal" && oeFrEval.iprf.status === "Normal"
            ? "Normal"
            : "Alterado",
        ),
        createResultRow(
          "Fala no Ruído (Fechamento Auditivo - S/R +5 dB)",
          `${odFr}% (Dif: ${odFrEval.diffValue}%)`,
          `${oeFr}% (Dif: ${oeFrEval.diffValue}%)`,
          "≥ 72% (Dif < 20%)",
          frStatus,
        ),
        createResultRow(
          `${state.psi.mode.toUpperCase()} / MCI (Relações 0 dB / -10 dB / -15 dB)`,
          `0dB: ${state.psi.od.db0 * 10}% | -10dB: ${state.psi.od.dbMinus10 * 10}% | -15dB: ${state.psi.od.dbMinus15 * 10}%`,
          `0dB: ${state.psi.oe.db0 * 10}% | -10dB: ${state.psi.oe.dbMinus10 * 10}% | -15dB: ${state.psi.oe.dbMinus15 * 10}%`,
          `${psiOd0.refText} / ${psiOd10.refText} / ${psiOd15.refText}`,
          psiStatus,
        ),
        createBlockHeaderRow("3. TAREFAS DE PROCESSAMENTO TEMPORAL"),
        createResultRow(
          "Padrão de Frequência e Duração (Auditec - Nomeação)",
          `Freq: ${freqNomeacaoPct}% (Hum: ${freqHummingPct}%)`,
          `Dur: ${durNomeacaoPct}% (Hum: ${durHummingPct}%)`,
          `Freq ${freqNorm.refText} | Dur ${durNorm.refText} (Hum ${freqHummingNorm.refText}/${durHummingNorm.refText})`,
          temporalOrdStatus,
        ),
        createResultRow(
          "RGDT (Resolução Temporal - 500 a 4000 Hz)",
          `${state.temporal.rgdt[500]} / ${state.temporal.rgdt[1000]} / ${state.temporal.rgdt[2000]} / ${state.temporal.rgdt[4000]} ms`,
          `Média: ${rgdtEval.media.toFixed(2).replace(".", ",")} ms`,
          rgdtEval.refText,
          rgdtEval.status,
        ),
        createBlockHeaderRow("4. TAREFAS DICÓTICAS"),
        createResultRow(
          "TDD (Integração / Separação Binaural)",
          `Int: ${tddIntegOd}% | Sep: ${tddSepOd}%`,
          `Int: ${tddIntegOe}% | Sep: ${tddSepOe}%`,
          `${tddIntegOdNorm.refText} | ${tddSepOdNorm.refText}`,
          tddStatus,
        ),
        createResultRow(
          `SSW Quantitativo (DNC:${dncTotal} DC:${dcTotal} EC:${ecTotal} ENC:${encTotal})`,
          `DC: ${sswDc.toFixed(1)}%`,
          `EC: ${sswEc.toFixed(1)}%`,
          sswDcNorm.refText,
          sswStatus,
        ),
        createResultRow(
          "SSW Análise Qualitativa (Auditivo / Ordem)",
          `Ef. Auditivo: ${efeitoAuditivo > 0 ? `+${efeitoAuditivo}` : efeitoAuditivo}`,
          `Ef. Ordem: ${efeitoOrdem > 0 ? `+${efeitoOrdem}` : efeitoOrdem}`,
          "Aud: -4 a +4 | Ord: -3 a +3",
          efeitoAuditivoNormal && efeitoOrdemNormal ? "Normal" : "Alterado",
        ),
      ],
    }),
  );

  if (protocolNotes.length > 0) {
    children.push(
      createSectionTitle("Observações Específicas por Protocolo:"),
      ...protocolNotes.map((note) =>
        createTextParagraph(`${note.label}: ${note.text}`, { bullet: true }),
      ),
    );
  }

  children.push(
    createSectionTitle("Comportamento na Sessão:"),
    createTextParagraph(comportamentoText, {
      align: AlignmentType.JUSTIFIED,
      after: 160,
    }),
    createSectionTitle("Conclusão:"),
    ...state.laudo.conclusao.map((item) =>
      createTextParagraph(item, { bullet: true }),
    ),
  );

  if (alteredSkills.length > 0) {
    children.push(
      createTextParagraph(
        `Habilidades auditivas alteradas na bateria atual: ${alteredSkills.join(", ")}.`,
        { bold: true, color: ALTERADO_COLOR, bullet: true, after: 120 },
      ),
    );
  }

  children.push(
    createSectionTitle("Conduta / Recomendações:"),
    ...state.laudo.recomendacoes.map((rec, index) =>
      createTextParagraph(`${index + 1}. ${rec}`),
    ),
    createTextParagraph("__________________________________________________", {
      color: MUTED_TEXT,
      align: AlignmentType.CENTER,
      before: 560,
      after: 40,
    }),
    createTextParagraph(
      `${state.clinician.name} - ${state.clinician.title} - ${state.clinician.crfa}`,
      { bold: true, size: 22, align: AlignmentType.CENTER, after: 40 },
    ),
    createTextParagraph(
      `Assinado digitalmente por PAC Digital Engine — ${state.clinician.crfa}`,
      { size: 18, color: MUTED_TEXT, align: AlignmentType.CENTER, after: 40 },
    ),
    createTextParagraph(
      "Documento gerado em conformidade com as normas do Conselho Federal de Fonoaudiologia.",
      {
        italics: true,
        size: 16,
        color: MUTED_TEXT,
        align: AlignmentType.CENTER,
      },
    ),
  );

  const doc = new Document({
    creator: state.clinician.name,
    title: `Laudo PAC - ${state.patient.name}`,
    description:
      "Laudo Clínico de Avaliação do Processamento Auditivo Central (PAC)",
    sections: [{ properties: {}, children }],
  });

  return Packer.toBlob(doc);
}

export async function exportLaudoToDocx(
  state: PacState,
  options?: DocxExportOptions,
): Promise<void> {
  const blob = await generateLaudoDocxBlob(state, options);
  const filename = buildLaudoFilename(state.patient.name, state.patient.date);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
