export type LabStatus = "normal" | "low" | "high" | "borderline" | "unknown";
export type LabSeverity = "none" | "mild" | "moderate" | "critical" | "unknown";

export interface ReferenceRange {
  low?: number;
  high?: number;
  text?: string;
}

export interface LabInput {
  testName: string;
  value: number;
  unit?: string;
  referenceRange?: ReferenceRange;
  notes?: string;
  source?: "manual" | "pdf";
}

export interface PatientContext {
  age?: number;
  sex?: "male" | "female" | "other" | "unknown";
  pregnant?: boolean;
}

export interface AnalyzeRequest {
  patientContext?: PatientContext;
  results: LabInput[];
}

export interface LabExplanation {
  testName: string;
  normalizedName: string;
  value: number;
  unit?: string;
  referenceRange?: ReferenceRange;
  status: LabStatus;
  severity: LabSeverity;
  plainLanguageExplanation: string;
  possibleGeneralCauses: string[];
  followUpQuestions: string[];
  shouldDiscussWithClinician: boolean;
  disclaimer: string;
}

export interface CombinationFlag {
  code: string;
  title: string;
  explanation: string;
  severity: "info" | "follow_up" | "urgent";
}

export interface AnalyzeResponse {
  summary: {
    totalResults: number;
    normalCount: number;
    abnormalCount: number;
    followUpRecommended: boolean;
    overallPlainLanguageSummary: string;
    importantNotes: string[];
  };
  results: LabExplanation[];
  combinationFlags: CombinationFlag[];
}

export interface UploadResponse {
  extractedResults: Array<LabInput & { normalizedName?: string; rawLine?: string; flag?: string }>;
  needsReview: boolean;
  message: string;
  textPreview?: string;
}
