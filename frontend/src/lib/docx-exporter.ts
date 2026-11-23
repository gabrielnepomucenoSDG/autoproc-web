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
import { computeEvaluationSummary } from "@/lib/evaluation-summary";

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

  const summary = computeEvaluationSummary(state);

  const skillsSummary: Array<{ label: string; status: "Normal" | "Alterado" }> =
    [
      {
        label: "Fechamento Auditivo",
        status: summary.skills.fechamentoAuditivo,
      },
      { label: "Figura-Fundo", status: summary.skills.figuraFundo },
      {
        label: "Integração Binaural",
        status: summary.skills.integracaoBinaural,
      },
      {
        label: "Separação Binaural",
        status: summary.skills.separacaoBinaural,
      },
      {
        label: "Ordenação Temporal",
        status: summary.skills.ordenacaoTemporal,
      },
      {
        label: "Resolução Temporal",
        status: summary.skills.resolucaoTemporal,
      },
      {
        label: "Localização Sonora",
        status: summary.skills.localizacaoSonora,
      },
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
          `Loc: ${summary.bandinha.locCount}/5`,
          `SV: ${summary.bandinha.mvCount}/3 | SNV: ${summary.bandinha.mnvCount}/3`,
          "Loc ≥ 4/5 | Mem ≥ 2/3",
          summary.bandinha.overallStatus,
        ),
        createBlockHeaderRow("2. TAREFAS MONOAURAIS DE BAIXA REDUNDÂNCIA"),
        createResultRow(
          "IPRF com Gravação",
          `${summary.falaNoRuido.odIprf}%`,
          `${summary.falaNoRuido.oeIprf}%`,
          summary.falaNoRuido.odIprfRefText,
          summary.falaNoRuido.iprfStatus,
        ),
        createResultRow(
          "Fala no Ruído (Fechamento Auditivo - S/R +5 dB)",
          `${summary.falaNoRuido.odFr}% (Dif: ${summary.falaNoRuido.odDiff}%)`,
          `${summary.falaNoRuido.oeFr}% (Dif: ${summary.falaNoRuido.oeDiff}%)`,
          "≥ 72% (Dif < 20%)",
          summary.falaNoRuido.overallStatus,
        ),
        createResultRow(
          `${state.psi.mode.toUpperCase()} / MCI (Relações 0 dB / -10 dB / -15 dB)`,
          `0dB: ${summary.psi.odDb0Pct}% | -10dB: ${summary.psi.odDb10Pct}% | -15dB: ${summary.psi.odDb15Pct}%`,
          `0dB: ${summary.psi.oeDb0Pct}% | -10dB: ${summary.psi.oeDb10Pct}% | -15dB: ${summary.psi.oeDb15Pct}%`,
          `${summary.psi.odDb0RefText} / ${summary.psi.odDb10RefText} / ${summary.psi.odDb15RefText}`,
          summary.psi.overallStatus,
        ),
        createBlockHeaderRow("3. TAREFAS DE PROCESSAMENTO TEMPORAL"),
        createResultRow(
          "Padrão de Frequência e Duração (Auditec - Nomeação)",
          `Freq: ${summary.temporal.freqPct}% (Hum: ${summary.temporal.freqHummingPct}%)`,
          `Dur: ${summary.temporal.durPct}% (Hum: ${summary.temporal.durHummingPct}%)`,
          `Freq ${summary.temporal.freqRefText} | Dur ${summary.temporal.durRefText} (Hum ${summary.temporal.freqHummingRefText}/${summary.temporal.durHummingRefText})`,
          summary.temporal.ordStatus,
        ),
        createResultRow(
          "RGDT (Resolução Temporal - 500 a 4000 Hz)",
          `${state.temporal.rgdt[500]} / ${state.temporal.rgdt[1000]} / ${state.temporal.rgdt[2000]} / ${state.temporal.rgdt[4000]} ms`,
          `Média: ${summary.temporal.rgdtMedia.toFixed(2).replace(".", ",")} ms`,
          summary.temporal.rgdtRefText,
          summary.temporal.rgdtStatus,
        ),
        createBlockHeaderRow("4. TAREFAS DICÓTICAS"),
        createResultRow(
          "TDD (Integração / Separação Binaural)",
          `Int: ${summary.tdd.integOd}% | Sep: ${summary.tdd.sepOd}%`,
          `Int: ${summary.tdd.integOe}% | Sep: ${summary.tdd.sepOe}%`,
          `${summary.tdd.integOdRefText} | ${summary.tdd.sepOdRefText}`,
          summary.tdd.overallStatus,
        ),
        createResultRow(
          `SSW Quantitativo (DNC:${summary.ssw.dncTotal} DC:${summary.ssw.dcTotal} EC:${summary.ssw.ecTotal} ENC:${summary.ssw.encTotal})`,
          `DC: ${summary.ssw.dc.toFixed(1)}%`,
          `EC: ${summary.ssw.ec.toFixed(1)}%`,
          summary.ssw.dcRefText,
          summary.ssw.overallStatus,
        ),
        createResultRow(
          "SSW Análise Qualitativa (Auditivo / Ordem)",
          `Ef. Auditivo: ${summary.ssw.efeitoAuditivo > 0 ? `+${summary.ssw.efeitoAuditivo}` : summary.ssw.efeitoAuditivo}`,
          `Ef. Ordem: ${summary.ssw.efeitoOrdem > 0 ? `+${summary.ssw.efeitoOrdem}` : summary.ssw.efeitoOrdem}`,
          "Aud: -4 a +4 | Ord: -3 a +3",
          summary.ssw.qualitativeStatus,
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
