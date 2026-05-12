import type { AnalyzeLabsRequest, AnalyzeLabsResponse, ExtractedLabResult } from "@lab-results/shared";

export async function analyzeLabs(payload: AnalyzeLabsRequest): Promise<AnalyzeLabsResponse> {
  const response = await fetch("/api/labs/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to analyze lab results");
  }

  return response.json();
}

export async function uploadLabReportPdf(file: File): Promise<{ extractedResults: ExtractedLabResult[]; needsReview: boolean; confidence: number; extractionSource: string; message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/labs/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to upload lab report");
  }

  return response.json();
}
