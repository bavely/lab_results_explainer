import type { CombinationFlag, LabExplanation } from "@lab-results/shared";

function findResult(results: LabExplanation[], normalizedName: string) {
  return results.find((result) => result.normalizedName === normalizedName);
}

function isHigh(result?: LabExplanation) {
  return result?.status === "high";
}

function isLow(result?: LabExplanation) {
  return result?.status === "low";
}

export function detectCombinationFlags(results: LabExplanation[]): CombinationFlag[] {
  const flags: CombinationFlag[] = [];

  const a1c = findResult(results, "a1c");
  const glucose = findResult(results, "glucose");
  const ldl = findResult(results, "ldl");
  const totalCholesterol = findResult(results, "total_cholesterol");
  const hemoglobin = findResult(results, "hemoglobin");
  const mcv = findResult(results, "mcv");
  const tsh = findResult(results, "tsh");
  const freeT4 = findResult(results, "free_t4");
  const creatinine = findResult(results, "creatinine");
  const egfr = findResult(results, "egfr");

  if (isHigh(a1c) && isHigh(glucose)) {
    flags.push({
      code: "glucose_a1c_followup",
      title: "Blood sugar follow-up may be useful",
      explanation:
        "Both A1C and glucose appear above the provided reference ranges. This pattern can be worth discussing with a clinician, especially if fasting status is known.",
      severity: "follow_up",
      recommendedFollowUp: "Ask whether repeat testing or additional metabolic evaluation is appropriate."
    });
  }

  if (isHigh(ldl) && isHigh(totalCholesterol)) {
    flags.push({
      code: "cholesterol_followup",
      title: "Cholesterol follow-up may be useful",
      explanation:
        "LDL and total cholesterol appear elevated. A clinician can interpret this along with age, blood pressure, family history, and other risk factors.",
      severity: "follow_up",
      recommendedFollowUp: "Ask how these values affect your overall cardiovascular risk."
    });
  }

  if (isLow(hemoglobin) && isLow(mcv)) {
    flags.push({
      code: "low_hgb_low_mcv_followup",
      title: "Possible anemia pattern to discuss",
      explanation:
        "Low hemoglobin with low MCV can be seen in several situations. This does not identify the cause, but it may be worth asking whether iron studies are appropriate.",
      severity: "follow_up",
      recommendedFollowUp: "Ask whether ferritin, iron studies, or repeat blood count testing may be useful."
    });
  }

  if (isHigh(tsh) && isLow(freeT4)) {
    flags.push({
      code: "thyroid_followup",
      title: "Thyroid follow-up may be useful",
      explanation:
        "TSH and free T4 together can provide thyroid function context. This pattern should be reviewed by a healthcare professional.",
      severity: "follow_up",
      recommendedFollowUp: "Ask whether repeat thyroid testing or clinical evaluation is appropriate."
    });
  }

  if (isHigh(creatinine) && isLow(egfr)) {
    flags.push({
      code: "kidney_function_followup",
      title: "Kidney function follow-up may be useful",
      explanation:
        "Creatinine and eGFR are commonly interpreted together for kidney filtering context. A clinician should review these values with your full medical history.",
      severity: "timely_follow_up",
      recommendedFollowUp: "Ask how soon these results should be reviewed and whether repeat testing is needed."
    });
  }

  return flags;
}
