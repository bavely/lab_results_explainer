import type { AnalyzeRequest, AnalyzeResponse, UploadResponse } from "@/types/labs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error || payload?.message || "Request failed";
    throw new Error(message);
  }
  return payload as T;
}

export async function analyzeLabs(body: AnalyzeRequest): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/labs/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<AnalyzeResponse>(response);
}

export async function uploadLabPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/api/labs/upload`, {
    method: "POST",
    body: formData,
  });
  return parseJsonResponse<UploadResponse>(response);
}
