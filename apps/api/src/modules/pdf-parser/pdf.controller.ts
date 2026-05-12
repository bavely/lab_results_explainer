import type { Request, Response, NextFunction } from "express";
import { parseLabReportFile } from "./pdf.service.js";

export async function uploadLabReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "A PDF or image file is required" });
    }

    const parsed = await parseLabReportFile(req.file.buffer, req.file.mimetype);

    const extractedResults = parsed.extractedResults;

    res.json({
      extractedResults,
      needsReview: true,
      confidence: parsed.confidence,
      extractionSource: parsed.source,
      message: "We extracted possible lab values from your report using text extraction/OCR. Please review before generating explanations."
    });
  } catch (error) {
    next(error);
  }
}
