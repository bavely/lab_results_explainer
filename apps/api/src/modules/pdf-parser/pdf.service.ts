import pdfParse from "pdf-parse";
import type { ExtractedLabResult } from "@lab-results/shared";
import Tesseract from "tesseract.js";
import { extractLabValuesFromText } from "./extractLabValues.js";

export type SupportedUploadMime = "application/pdf" | "image/png" | "image/jpeg" | "image/jpg" | "image/webp";

export interface ParseLabReportResult {
  extractedResults: ExtractedLabResult[];
  confidence: number;
  source: "pdf-text" | "pdf-ocr" | "image-ocr";
}

export async function parseLabReportFile(buffer: Buffer, mimetype: string): Promise<ParseLabReportResult> {
  if (mimetype === "application/pdf") {
    const parsed = await pdfParse(buffer);
    const directText = (parsed.text ?? "").trim();

    if (directText.length > 30) {
      return {
        extractedResults: extractLabValuesFromText(directText),
        confidence: 0.95,
        source: "pdf-text"
      };
    }

    const ocr = await extractTextFromPdfWithOcr(buffer);
    return {
      extractedResults: extractLabValuesFromText(ocr.text),
      confidence: ocr.confidence,
      source: "pdf-ocr"
    };
  }

  const ocr = await runOcrOnImage(buffer);
  return {
    extractedResults: extractLabValuesFromText(ocr.text),
    confidence: ocr.confidence,
    source: "image-ocr"
  };
}

async function extractTextFromPdfWithOcr(buffer: Buffer): Promise<{ text: string; confidence: number }> {
  const renderer = await loadPdfOcrRenderer();

  if (!renderer) {
    return { text: "", confidence: 0 };
  }

  return renderer(buffer);
}

async function loadPdfOcrRenderer(): Promise<((buffer: Buffer) => Promise<{ text: string; confidence: number }>) | null> {
  try {
    const [{ getDocument }, { createCanvas }] = await Promise.all([
      import("pdfjs-dist/legacy/build/pdf.mjs"),
      import("canvas")
    ]);

    return async (buffer: Buffer) => {
      const loadingTask = getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;

      let merged = "";
      let totalConfidence = 0;
      let pagesProcessed = 0;
      const maxPages = Math.min(pdf.numPages, 5);

      for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
        const page = await pdf.getPage(pageNo);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
        const context = canvas.getContext("2d");
        await page.render({ canvasContext: context as any, viewport }).promise;

        const ocr = await runOcrOnImage(canvas.toBuffer("image/png"));
        merged += `
${ocr.text}`;
        totalConfidence += ocr.confidence;
        pagesProcessed += 1;
      }

      return {
        text: merged.trim(),
        confidence: pagesProcessed === 0 ? 0 : totalConfidence / pagesProcessed
      };
    };
  } catch {
    return null;
  }
}

async function runOcrOnImage(buffer: Buffer): Promise<{ text: string; confidence: number }> {
  const result = await Tesseract.recognize(buffer, "eng");
  return {
    text: result.data.text ?? "",
    confidence: Number((result.data.confidence / 100).toFixed(3))
  };
}
