const aliasMap: Record<string, string[]> = {
  hemoglobin: ["hemoglobin", "hgb", "hb"],
  a1c: ["a1c", "hba1c", "hemoglobin a1c", "glycated hemoglobin"],
  glucose: ["glucose", "fasting glucose", "blood glucose"],
  total_cholesterol: ["total cholesterol", "cholesterol"],
  ldl: ["ldl", "ldl cholesterol", "ldl-c"],
  hdl: ["hdl", "hdl cholesterol", "hdl-c"],
  triglycerides: ["triglycerides", "trig"],
  tsh: ["tsh", "thyroid stimulating hormone"],
  free_t4: ["free t4", "ft4", "thyroxine free"],
  creatinine: ["creatinine", "serum creatinine"],
  egfr: ["egfr", "estimated gfr"]
};

export function normalizeLabName(testName: string): string {
  const normalized = testName.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

  for (const [canonical, aliases] of Object.entries(aliasMap)) {
    if (aliases.some((alias) => alias === normalized)) {
      return canonical;
    }
  }

  return normalized.replace(/\s+/g, "_");
}
