import { z } from "zod";

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || Number.isNaN(value)) return undefined;
  return value;
}, z.coerce.number().optional());


export const labStatusSchema = z.enum([
  "normal",
  "low",
  "high",
  "borderline",
  "unknown"
]);

export const labSeveritySchema = z.enum([
  "none",
  "mild",
  "moderate",
  "critical",
  "unknown"
]);

export const referenceRangeSchema = z.object({
  low: optionalNumber,
  high: optionalNumber,
  text: z.string().optional()
});

export const patientContextSchema = z.object({
  age: z.preprocess((value) => {
    if (value === "" || value === null || Number.isNaN(value)) return undefined;
    return value;
  }, z.coerce.number().min(0).max(130).optional()),
  sex: z.enum(["female", "male", "other", "unknown"]).optional().default("unknown"),
  pregnant: z.boolean().optional()
});

export const labInputSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  value: z.coerce.number({ invalid_type_error: "Result value must be a number" }),
  unit: z.string().optional().default(""),
  referenceRange: referenceRangeSchema.optional().default({}),
  notes: z.string().optional()
});

export const extractedLabResultSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  value: optionalNumber,
  valueText: z.string().optional(),
  comparator: z.enum(["<", ">"]).optional(),
  unit: z.string().optional().default(""),
  flag: z.enum(["H", "L"]).optional(),
  referenceRange: referenceRangeSchema.optional().default({}),
  source: z.literal("pdf").optional(),
  isAnalyzable: z.boolean().optional().default(false),
  notes: z.string().optional()
});

export const analyzeLabsRequestSchema = z.object({
  patientContext: patientContextSchema.optional().default({ sex: "unknown" }),
  results: z.array(labInputSchema).min(1, "At least one lab result is required")
});

export const combinationFlagSchema = z.object({
  code: z.string(),
  title: z.string(),
  explanation: z.string(),
  severity: z.enum(["info", "follow_up", "timely_follow_up"]).default("follow_up"),
  recommendedFollowUp: z.string().optional()
});

export const labExplanationSchema = z.object({
  testName: z.string(),
  normalizedName: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  referenceRange: referenceRangeSchema.optional(),
  status: labStatusSchema,
  severity: labSeveritySchema,
  testDefinition: z.string().optional(),
  plainLanguageExplanation: z.string(),
  possibleGeneralCauses: z.array(z.string()).default([]),
  followUpQuestions: z.array(z.string()).default([]),
  shouldDiscussWithClinician: z.boolean(),
  urgentCareDisclaimer: z.string().optional(),
  disclaimer: z.string()
});

export const analyzeLabsResponseSchema = z.object({
  summary: z.object({
    totalResults: z.number(),
    normalCount: z.number(),
    abnormalCount: z.number(),
    followUpRecommended: z.boolean(),
    overallPlainLanguageSummary: z.string(),
    importantNotes: z.array(z.string()).default([])
  }),
  results: z.array(labExplanationSchema),
  combinationFlags: z.array(combinationFlagSchema).default([])
});

export type LabStatus = z.infer<typeof labStatusSchema>;
export type LabSeverity = z.infer<typeof labSeveritySchema>;
export type ReferenceRange = z.infer<typeof referenceRangeSchema>;
export type PatientContext = z.infer<typeof patientContextSchema>;
export type LabInput = z.infer<typeof labInputSchema>;
export type ExtractedLabResult = z.infer<typeof extractedLabResultSchema>;
export type CombinationFlag = z.infer<typeof combinationFlagSchema>;
export type LabExplanation = z.infer<typeof labExplanationSchema>;
export type AnalyzeLabsRequest = z.infer<typeof analyzeLabsRequestSchema>;
export type AnalyzeLabsResponse = z.infer<typeof analyzeLabsResponseSchema>;
