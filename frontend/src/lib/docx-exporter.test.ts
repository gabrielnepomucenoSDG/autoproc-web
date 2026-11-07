import { describe, expect, it, vi } from "vitest";
import {
  buildLaudoFilename,
  exportLaudoToDocx,
  generateLaudoDocxBlob,
} from "@/lib/docx-exporter";
import { pacStore } from "@/lib/pac-store";

describe("docx-exporter", () => {
  it("sanitizes patient name and date into a valid .docx filename", () => {
    expect(buildLaudoFilename("Maria Fernanda Torres", "07/11/2026")).toBe(
      "Laudo_PAC_Maria_Fernanda_Torres_07-11-2026.docx",
    );
    expect(buildLaudoFilename("João Ângelo D'Ávila", "2026-11-07")).toBe(
      "Laudo_PAC_Joao_Angelo_D_Avila_2026-11-07.docx",
    );
  });

  it("generates a valid non-empty DOCX blob from PacState", async () => {
    const state = {
      ...pacStore.getState(),
      bandinha: {
        ...pacStore.getState().bandinha,
        observacoes: "Boa localização lateral.",
      },
    };

    const blob = await generateLaudoDocxBlob(state, {
      comportamento: "Comportamento revisado na sessão.",
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
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
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith(
      "blob:http://localhost/mock-docx",
    );

    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
    clickSpy.mockRestore();
  });
});
