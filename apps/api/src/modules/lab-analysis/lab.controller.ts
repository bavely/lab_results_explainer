import type { Request, Response, NextFunction } from "express";
import { analyzeLabsRequestSchema } from "@lab-results/shared";
import { analyzeLabResults } from "./lab.service.js";

export async function analyzeLabs(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = analyzeLabsRequestSchema.parse(req.body);
    const analysis = await analyzeLabResults(payload);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
}
