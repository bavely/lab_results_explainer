import pdfParse from "pdf-parse";
import type { LabInput } from "@lab-results/shared";
import { extractLabValuesFromText } from "./extractLabValues.js";

export async function parseLabReportPdf(buffer: Buffer): Promise<LabInput[]> {
  const parsed = await pdfParse(buffer);
  return extractLabValuesFromText(parsed.text);
}
