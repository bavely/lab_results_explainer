export const commonLabAliases: Record<string, string[]> = {
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

export const educationalLabDescriptions: Record<string, string> = {
  hemoglobin: "Hemoglobin is a protein in red blood cells that helps carry oxygen throughout the body.",
  a1c: "A1C is a blood test that gives a general picture of average blood sugar over about 2 to 3 months.",
  glucose: "Glucose is a type of sugar in the blood and is affected by food intake, fasting status, medications, and other factors.",
  total_cholesterol: "Total cholesterol is one part of a lipid panel and should be interpreted with LDL, HDL, triglycerides, and personal risk factors.",
  ldl: "LDL is often called 'bad cholesterol' because higher levels may contribute to plaque buildup in arteries over time.",
  hdl: "HDL is often called 'good cholesterol' because it helps move cholesterol away from arteries.",
  triglycerides: "Triglycerides are a type of fat in the blood and can be affected by diet, fasting status, alcohol intake, and metabolic health.",
  tsh: "TSH is a hormone that helps signal the thyroid gland and is commonly used to screen thyroid function.",
  free_t4: "Free T4 is a thyroid hormone measurement that can provide additional thyroid context along with TSH.",
  creatinine: "Creatinine is a waste product filtered by the kidneys and is commonly used to estimate kidney function.",
  egfr: "eGFR is an estimated measure of kidney filtering function and should be interpreted with clinical context."
};
