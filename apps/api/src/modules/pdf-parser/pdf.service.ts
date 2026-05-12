import pdfParse from "pdf-parse";
import type { ExtractedLabResult } from "@lab-results/shared";
import { extractLabValuesFromText } from "./extractLabValues.js";

export async function parseLabReportPdf(buffer: Buffer): Promise<ExtractedLabResult[]> {
  const parsed = await pdfParse(buffer);
  return extractLabValuesFromText(parsed.text);
}
