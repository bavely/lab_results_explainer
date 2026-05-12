import type { LabStatus, LabSeverity } from "@lab-results/shared";

export function classifyLabValue(value: number, low?: number, high?: number): LabStatus {
  if (low === undefined && high === undefined) return "unknown";
  if (low !== undefined && value < low) return "low";
  if (high !== undefined && value > high) return "high";
  return "normal";
}

export function estimateSeverity(status: LabStatus, value: number, low?: number, high?: number): LabSeverity {
  if (status === "normal") return "none";
  if (status === "unknown" || Number.isNaN(value)) return "unknown";

  if (status === "low" && low !== undefined && low !== 0) {
    const delta = Math.abs((low - value) / low);
    if (delta >= 0.35) return "moderate";
    return "mild";
  }

  if (status === "high" && high !== undefined && high !== 0) {
    const delta = Math.abs((value - high) / high);
    if (delta >= 0.35) return "moderate";
    return "mild";
  }

  return "unknown";
}

export function isHigh(status?: LabStatus) {
  return status === "high";
}

export function isLow(status?: LabStatus) {
  return status === "low";
}
