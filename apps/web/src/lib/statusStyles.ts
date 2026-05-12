import type { LabStatus } from "@lab-results/shared";

export const labStatusLabels: Record<LabStatus, string> = {
  normal: "Normal",
  low: "Low",
  high: "High",
  borderline: "Borderline",
  unknown: "Unknown"
};

export const labStatusStyles: Record<LabStatus, string> = {
  normal: "border-emerald-200 bg-emerald-50 text-emerald-700",
  low: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
  borderline: "border-yellow-200 bg-yellow-50 text-yellow-700",
  unknown: "border-slate-200 bg-slate-50 text-slate-700"
};
