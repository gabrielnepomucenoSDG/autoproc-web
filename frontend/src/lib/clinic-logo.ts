/**
 * The clinic logo printed in the report header. It is stored inside the
 * browser state (localStorage), so it is kept small and in a format that both
 * the screen and the .docx exporter can embed.
 */
export interface ClinicLogo {
  dataUrl: string;
  type: "png" | "jpg";
  width: number;
  height: number;
}

/** localStorage holds ~5 MB for the whole app; a logo must not eat it. */
export const MAX_LOGO_BYTES = 500 * 1024;

export type LogoReadError = "unsupported-type" | "too-large" | "unreadable";

const MIME_TO_TYPE: Record<string, ClinicLogo["type"]> = {
  "image/png": "png",
  "image/jpeg": "jpg",
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("unreadable"));
    reader.readAsDataURL(file);
  });
}

function readDimensions(
  dataUrl: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("unreadable"));
    img.src = dataUrl;
  });
}

export async function readLogoFile(
  file: File,
): Promise<{ logo: ClinicLogo } | { error: LogoReadError }> {
  const type = MIME_TO_TYPE[file.type];
  if (!type) return { error: "unsupported-type" };
  if (file.size > MAX_LOGO_BYTES) return { error: "too-large" };
  try {
    const dataUrl = await readAsDataUrl(file);
    const { width, height } = await readDimensions(dataUrl);
    if (width <= 0 || height <= 0) return { error: "unreadable" };
    return { logo: { dataUrl, type, width, height } };
  } catch {
    return { error: "unreadable" };
  }
}

/** Fits the logo in a header box, keeping its proportions (pixels at 96 dpi). */
export function fitLogo(
  logo: Pick<ClinicLogo, "width" | "height">,
  maxWidth = 220,
  maxHeight = 60,
): { width: number; height: number } {
  const scale = Math.min(maxWidth / logo.width, maxHeight / logo.height, 1);
  return {
    width: Math.round(logo.width * scale),
    height: Math.round(logo.height * scale),
  };
}
