import pdfParse from "pdf-parse";
import type { ExtractedLabResult } from "@lab-results/shared";
import Tesseract from "tesseract.js";
import { env } from "../../config/env.js";
import { extractLabValuesFromText } from "./extractLabValues.js";

export type SupportedUploadMime = "application/pdf" | "image/png" | "image/jpeg" | "image/jpg" | "image/webp";

export interface ParseLabReportResult {
  extractedResults: ExtractedLabResult[];
  confidence: number;
  source: "pdf-text" | "pdf-ocr" | "image-ocr" | "image-ocr-enhanced" | "pdf-ocr-enhanced";
}

export async function parseLabReportFile(buffer: Buffer, mimetype: string): Promise<ParseLabReportResult> {
  if (mimetype === "application/pdf") {
    const parsed = await pdfParse(buffer);
    const directText = (parsed.text ?? "").trim();

    if (directText.length > 30) {
      const directResults = extractLabValuesFromText(directText);
      if (directResults.length >= 2) {
        return {
          extractedResults: directResults,
          confidence: 0.95,
          source: "pdf-text"
        };
      }
    }

    const ocr = await extractTextFromPdfWithOcr(buffer);
    return {
      extractedResults: extractLabValuesFromText(ocr.text),
      confidence: ocr.confidence,
      source: ocr.source
    };
  }

  const ocr = await runOcrOnImage(buffer);
  return {
    extractedResults: extractLabValuesFromText(ocr.text),
    confidence: ocr.confidence,
    source: ocr.source
  };
}

async function extractTextFromPdfWithOcr(buffer: Buffer): Promise<{ text: string; confidence: number; source: "pdf-ocr" | "pdf-ocr-enhanced" }> {
  const renderer = await loadPdfOcrRenderer();

  if (!renderer) {
    return { text: "", confidence: 0, source: "pdf-ocr" };
  }

  return renderer(buffer);
}

async function loadPdfOcrRenderer(): Promise<((buffer: Buffer) => Promise<{ text: string; confidence: number; source: "pdf-ocr" | "pdf-ocr-enhanced" }>) | null> {
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
      let usedEnhancer = false;
      const maxPages = Math.min(pdf.numPages, 5);

      const pageNumbers = Array.from({ length: maxPages }, (_, idx) => idx + 1);
      const pageChunks = chunk(pageNumbers, 2);

      for (const pageChunk of pageChunks) {
        const chunkOcr = await Promise.all(
          pageChunk.map(async (pageNo) => {
            const page = await pdf.getPage(pageNo);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
            const context = canvas.getContext("2d");
            await page.render({ canvasContext: context as any, viewport }).promise;
            const ocr = await runOcrOnImage(canvas.toBuffer("image/png"));
            if (ocr.source === "image-ocr-enhanced") {
              usedEnhancer = true;
            }
            return ocr;
          })
        );

        for (const ocr of chunkOcr) {
          merged += `\n${ocr.text}`;
          totalConfidence += ocr.confidence;
          pagesProcessed += 1;
        }
      }

      return {
        text: merged.trim(),
        confidence: pagesProcessed === 0 ? 0 : totalConfidence / pagesProcessed,
        source: usedEnhancer ? "pdf-ocr-enhanced" : "pdf-ocr"
      };
    };
  } catch {
    return null;
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function runOcrOnImage(buffer: Buffer): Promise<{ text: string; confidence: number; source: "image-ocr" | "image-ocr-enhanced" }> {
  const enhanced = await requestEnhancedOcr(buffer);

  if (enhanced) {
    return {
      text: enhanced.text,
      confidence: 0.9,
      source: "image-ocr-enhanced"
    };
  }

  const result = await Tesseract.recognize(buffer, "eng");
  return {
    text: result.data.text ?? "",
    confidence: Number((result.data.confidence / 100).toFixed(3)),
    source: "image-ocr"
  };
}

async function requestEnhancedOcr(buffer: Buffer): Promise<{ text: string } | null> {
  if (!env.OCR_ENHANCER_URL) {
    return null;
  }

  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: "image/png" });
    formData.append("file", blob, "report.png");

    const response = await fetch(`${env.OCR_ENHANCER_URL}/enhance`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { text?: unknown };
    if (typeof data.text !== "string") {
      return null;
    }

    return { text: data.text };
  } catch {
    return null;
  }
}
