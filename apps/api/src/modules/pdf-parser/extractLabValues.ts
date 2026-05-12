import type { LabInput } from "@lab-results/shared";

const knownTests = [
  "Hemoglobin",
  "Hgb",
  "A1C",
  "HbA1c",
  "Glucose",
  "Total Cholesterol",
  "LDL",
  "HDL",
  "Triglycerides",
  "TSH",
  "Free T4",
  "Creatinine",
  "eGFR",
  "MCV"
];

export function extractLabValuesFromText(text: string): LabInput[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  const results: LabInput[] = [];

  for (const line of lines) {
    for (const test of knownTests) {
      const testPattern = new RegExp(`^${escapeRegExp(test)}\\b`, "i");
      if (!testPattern.test(line)) continue;

      const numbers = [...line.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
      if (numbers.length === 0) continue;

      const value = numbers[0];
      const low = numbers.length >= 3 ? numbers[1] : undefined;
      const high = numbers.length >= 3 ? numbers[2] : undefined;
      const unitMatch = line.match(/(?:mg\/dL|g\/dL|%|mIU\/L|ng\/dL|fL|mL\/min\/1\.73m2)/i);

      results.push({
        testName: test,
        value,
        unit: unitMatch?.[0] ?? "",
        referenceRange: {
          low,
          high,
          text: low !== undefined && high !== undefined ? `${low} - ${high}` : undefined
        },
        notes: "Extracted from PDF text. Please review before analysis."
      });
    }
  }

  return dedupeResults(results);
}

function dedupeResults(results: LabInput[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.testName.toLowerCase()}-${result.value}-${result.unit}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
