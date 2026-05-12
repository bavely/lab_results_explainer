import type { Request, Response, NextFunction } from "express";
import { parseLabReportPdf } from "./pdf.service.js";

export async function uploadLabReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const extractedResults = await parseLabReportPdf(req.file.buffer);

    res.json({
      extractedResults,
      needsReview: true,
      message: "We extracted possible lab values from your report. Please review before generating explanations."
    });
  } catch (error) {
    next(error);
  }
}
