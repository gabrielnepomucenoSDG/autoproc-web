import { describe, expect, it, vi } from "vitest";
import { strFromU8, unzipSync } from "fflate";
import {
  buildLaudoFilename,
  exportLaudoToDocx,
  generateLaudoDocxBlob,
} from "@/lib/docx-exporter";
import {
  ALL_PROTOCOL_IDS,
  PROTOCOL_IDS,
  computeEvaluationSummary,
} from "@/lib/evaluation-summary";
import { pacStore, type PacState } from "@/lib/pac-store";

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === "function") {
    return new Uint8Array(await blob.arrayBuffer());
  }
  return new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsArrayBuffer(blob);
  });
}

async function extractDocumentXml(blob: Blob): Promise<string> {
  const bytes = await blobToUint8Array(blob);
  const archive = unzipSync(bytes);
  const docXml = archive["word/document.xml"];
  if (!docXml) throw new Error("word/document.xml missing in generated .docx");
  return strFromU8(docXml);
}

function makeAllNormalState(): PacState {
  const base = pacStore.getState();
  return {
    ...base,
    activeEvaluationId: "eval-normal-1",
    patient: {
      name: "Paciente Tudo Normal",
      age: "9 anos",
      birthDate: "10/05/2017",
      date: "20/11/2026",
      examiner: "Rachel Costa Façanha - CRFa 8R - 7353",
      referral: "Pediatria",
      selectedTests: [...ALL_PROTOCOL_IDS],
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
      od: { intensidade: 70, iprfGravacao: 96, erros: [0] },
      oe: { intensidade: 70, iprfGravacao: 96, erros: [0] },
      observacoes: "",
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
        odErrors: 0,
        oeIntensidade: 70,
        oeErrors: 0,
      },
      observacoes: "",
    },
    temporal: {
      freqHumming: 10,
      freqNomeacao: 10,
      durHumming: 10,
      durNomeacao: 10,
      freqHummingGrid: Array.from({ length: 30 }, () => true),
      freqNomeacaoGrid: Array.from({ length: 30 }, () => true),
      durHummingGrid: Array.from({ length: 30 }, () => true),
      durNomeacaoGrid: Array.from({ length: 30 }, () => true),
      rgdt: { 500: 5, 1000: 5, 2000: 5, 4000: 5 },
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
      errors: { a: 0, b: 1, c: 1, d: 0, e: 0, f: 1, g: 1, h: 0 },
      inversoes: 0,
      observacoes: "",
    },
  };
}

describe("docx-exporter (A6 determinism & B2 checklist)", () => {
  it("sanitizes patient name and date into a valid .docx filename", () => {
    expect(buildLaudoFilename("Maria Fernanda Torres", "07/11/2026")).toBe(
      "Laudo_PAC_Maria_Fernanda_Torres_07-11-2026.docx",
    );
    expect(buildLaudoFilename("João Ângelo D'Ávila", "2026-11-07")).toBe(
      "Laudo_PAC_Joao_Angelo_D_Avila_2026-11-07.docx",
    );
  });

  it("A6: exports deterministic word/document.xml across repeated runs", async () => {
    const state = makeAllNormalState();
    const blob1 = await generateLaudoDocxBlob(state, {
      comportamento: "Comportamento determinístico.",
    });
    const blob2 = await generateLaudoDocxBlob(state, {
      comportamento: "Comportamento determinístico.",
    });

    const xml1 = await extractDocumentXml(blob1);
    const xml2 = await extractDocumentXml(blob2);
    expect(xml1).toBe(xml2);
  });

  it("B2: all-normal case preserves canonical block order, accents, header/footer, and normal conclusion", async () => {
    const state = makeAllNormalState();
    const blob = await generateLaudoDocxBlob(state);
    const xml = await extractDocumentXml(blob);

    // Canonical order of the 4 clinical blocks
    const i1 = xml.indexOf("1. TESTES DIÓTICOS");
    const i2 = xml.indexOf("2. TAREFAS MONOAURAIS DE BAIXA REDUNDÂNCIA");
    const i3 = xml.indexOf("3. TAREFAS DE PROCESSAMENTO TEMPORAL");
    const i4 = xml.indexOf("4. TAREFAS DICÓTICAS");
    expect(i1).toBeGreaterThan(-1);
    expect(i2).toBeGreaterThan(i1);
    expect(i3).toBeGreaterThan(i2);
    expect(i4).toBeGreaterThan(i3);

    // Normal conclusion text when no skill is altered
    expect(xml).toContain("dentro dos padrões de normalidade");
    expect(xml).not.toContain("sugerem alteração nas seguintes habilidades");

    // Header & footer clinician info + accents
    expect(xml).toContain("AVALIAÇÃO DO PROCESSAMENTO AUDITIVO CENTRAL");
    expect(xml).toContain(state.clinician.name);
    expect(xml).toContain(state.clinician.crfa);
    expect(xml).toContain("Binaural");
  });

  it("B2 & D1/D4/D5/D6/D3/D13/D14: matches screen summary, Não aplicável, disabled PSI relations, missed direction, and altered conclusion", async () => {
    const base = makeAllNormalState();
    const state6yo: PacState = {
      ...base,
      patient: {
        ...base.patient,
        name: "Sofia Seis Anos",
        age: "6 anos",
        birthDate: "10/03/2020",
        date: "20/11/2026",
      },
      bandinha: {
        ...base.bandinha,
        localizacao: {
          direita: true,
          esquerda: false,
          acima: true,
          frente: true,
          atras: true,
        },
      },
      psi: {
        ...base.psi,
        mode: "ssi",
        od: { ...base.psi.od, enabledMinus10: false },
        oe: { ...base.psi.oe, enabledMinus10: false },
      },
    };

    const summary = computeEvaluationSummary(state6yo);
    const xml = await extractDocumentXml(await generateLaudoDocxBlob(state6yo));

    // D1: Não aplicável explicit for < 7 years
    expect(summary.ssw.dcStatus).toBe("Não aplicável");
    expect(xml).toContain("Não aplicável");

    // D5: Bandinha missed direction explicitly listed
    expect(xml).toContain("4/5 (errou: esquerda)");

    // D6 & D3: SSI label used and disabled -10dB omitted
    expect(xml).toContain("SSI / MCI");
    expect(xml).not.toContain("-10dB:");

    // Conclusion lists ONLY altered skill (Localização Sonora), not normal ones
    expect(xml).toContain("Localização Sonora");
    expect(xml).toContain("sugerem alteração nas seguintes habilidades");
  });

  it("B2 & D2: partial battery explicitly marks unchecked protocols as Protocolo não aplicado / Não avaliado", async () => {
    const base = makeAllNormalState();
    const partial: PacState = {
      ...base,
      patient: {
        ...base.patient,
        name: "Clara Parcial",
        selectedTests: [PROTOCOL_IDS.FALA_NO_RUIDO, PROTOCOL_IDS.PSI_SSI],
      },
      ssw: {
        errors: { a: 0, b: 10, c: 10, d: 0, e: 0, f: 10, g: 10, h: 0 },
        inversoes: 4,
        observacoes: "Nota residual que não deve sair",
      },
    };

    const xml = await extractDocumentXml(await generateLaudoDocxBlob(partial));
    expect(xml).toContain("Protocolo não aplicado");
    expect(xml).toContain("Não avaliado");
    expect(xml).not.toContain("Nota residual que não deve sair");
  });

  it("B2 & D1 (60+) & D7 & D13 & D14: 60+ TDD Separação Não aplicável, Tipo A and Inversões parity", async () => {
    const base = makeAllNormalState();
    const seniorState: PacState = {
      ...base,
      patient: {
        ...base.patient,
        name: "Roberto Idoso",
        age: "64 anos",
        birthDate: "03/04/1962",
        date: "20/11/2026",
      },
      temporal: {
        ...base.temporal,
        freqHumming: 7, // 70% Alterado (D13)
      },
      ssw: {
        errors: { a: 0, b: 4, c: 4, d: 0, e: 0, f: 3, g: 2, h: 1 },
        inversoes: 2,
        observacoes: "",
      },
    };

    const summary = computeEvaluationSummary(seniorState);
    const xml = await extractDocumentXml(
      await generateLaudoDocxBlob(seniorState),
    );

    expect(summary.skills.separacaoBinaural).toBe("Não aplicável");
    expect(summary.skills.ordenacaoTemporal).toBe("Alterado");
    expect(xml).toContain("Não aplicável");
    expect(xml).toContain(`Tipo A: ${summary.ssw.tipoALabel}`);
    expect(xml).toContain(`Inv: ${summary.ssw.inversoesLabel}`);
    expect(xml).toContain("Ordenação Temporal");
  });

  it("triggers browser file download when exportLaudoToDocx is called", async () => {
    const createObjectUrlSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:http://localhost/mock-docx");
    const revokeObjectUrlSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    await exportLaudoToDocx(pacStore.getState());

    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    // Revoked only after the browser had time to start the download.
    expect(revokeObjectUrlSpy).not.toHaveBeenCalled();
    await vi.waitFor(
      () =>
        expect(revokeObjectUrlSpy).toHaveBeenCalledWith(
          "blob:http://localhost/mock-docx",
        ),
      { timeout: 2000 },
    );
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith(
      "blob:http://localhost/mock-docx",
    );

    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
    clickSpy.mockRestore();
  });
});

describe("report header logo and footer address (specialist, 25/11/2026)", () => {
  // 1x1 transparent PNG.
  const PNG_1X1 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  function withClinic(overrides: Partial<PacState["clinician"]>): PacState {
    const state = makeAllNormalState();
    return { ...state, clinician: { ...state.clinician, ...overrides } };
  }

  async function partsOf(state: PacState): Promise<Record<string, string>> {
    const blob = await generateLaudoDocxBlob(state);
    const archive = unzipSync(await blobToUint8Array(blob));
    const out: Record<string, string> = {};
    for (const [name, bytes] of Object.entries(archive)) {
      if (name.endsWith(".xml")) out[name] = strFromU8(bytes);
      else out[name] = `<binary ${bytes.length}>`;
    }
    return out;
  }

  it("puts the uploaded logo in the page header and the address in the footer", async () => {
    const parts = await partsOf(
      withClinic({
        hasClinicLogo: true,
        clinicLogo: { dataUrl: PNG_1X1, type: "png", width: 1, height: 1 },
        clinicAddress: "Rua das Flores, 123 — Fortaleza/CE",
      }),
    );
    const header = Object.entries(parts).find(([n]) =>
      /^word\/header\d*\.xml$/.test(n),
    )?.[1];
    const footer = Object.entries(parts).find(([n]) =>
      /^word\/footer\d*\.xml$/.test(n),
    )?.[1];
    expect(header).toContain("<pic:pic");
    expect(Object.keys(parts).some((n) => n.startsWith("word/media/"))).toBe(
      true,
    );
    expect(footer).toContain("Rua das Flores, 123 — Fortaleza/CE");
  });

  it("falls back to the clinic name when no logo was uploaded", async () => {
    const parts = await partsOf(
      withClinic({
        hasClinicLogo: true,
        clinicLogo: undefined,
        clinicName: "Clínica Teste",
      }),
    );
    const header = Object.entries(parts).find(([n]) =>
      /^word\/header\d*\.xml$/.test(n),
    )?.[1];
    expect(header).toContain("CLÍNICA TESTE");
  });

  it("has no header or footer for letterhead paper and an empty address", async () => {
    const parts = await partsOf(
      withClinic({ hasClinicLogo: false, clinicAddress: "" }),
    );
    expect(
      Object.keys(parts).some((n) => /^word\/(header|footer)\d*\.xml$/.test(n)),
    ).toBe(false);
  });

  it("stays deterministic with a logo", async () => {
    const state = withClinic({
      hasClinicLogo: true,
      clinicLogo: { dataUrl: PNG_1X1, type: "png", width: 1, height: 1 },
      clinicAddress: "Rua das Flores, 123",
    });
    const a = await partsOf(state);
    const b = await partsOf(state);
    for (const name of Object.keys(a)) {
      if (name === "docProps/core.xml") continue;
      expect(b[name], name).toBe(a[name]);
    }
  });
});
