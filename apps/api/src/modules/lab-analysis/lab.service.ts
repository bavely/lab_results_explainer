import type { AnalyzeLabsRequest, AnalyzeLabsResponse, LabExplanation } from "@lab-results/shared";
import { analyzeLabsResponseSchema } from "@lab-results/shared";
import { generateLabExplanations } from "../ai/ai.client.js";
import { detectCombinationFlags } from "./combinationFlags.js";
import { classifyLabValue, estimateSeverity } from "./lab.rules.js";
import { normalizeLabName } from "./lab.normalizer.js";

export async function analyzeLabResults(payload: AnalyzeLabsRequest): Promise<AnalyzeLabsResponse> {
  const classifiedResults: LabExplanation[] = payload.results.map((result) => {
    const normalizedName = normalizeLabName(result.testName);
    const low = result.referenceRange?.low;
    const high = result.referenceRange?.high;
    const status = classifyLabValue(result.value, low, high);
    const severity = estimateSeverity(status, result.value, low, high);

    return {
      testName: result.testName,
      normalizedName,
      value: result.value,
      unit: result.unit,
      referenceRange: result.referenceRange,
      status,
      severity,
      plainLanguageExplanation: "",
      possibleGeneralCauses: [],
      followUpQuestions: [],
      shouldDiscussWithClinician: status !== "normal",
      disclaimer: "This explanation is educational and is not a medical diagnosis."
    };
  });

  const combinationFlags = detectCombinationFlags(classifiedResults);
  const explainedResults = await generateLabExplanations({
    patientContext: payload.patientContext,
    classifiedResults,
    combinationFlags
  });

  let normalCount = 0;
  let abnormalCount = 0;
  for (const result of explainedResults) {
    if (result.status === "normal") {
      normalCount += 1;
      continue;
    }

    if (result.status === "low" || result.status === "high" || result.status === "borderline") {
      abnormalCount += 1;
    }
  }
  const followUpRecommended = abnormalCount > 0 || combinationFlags.length > 0;

  const response: AnalyzeLabsResponse = {
    summary: {
      totalResults: explainedResults.length,
      normalCount,
      abnormalCount,
      followUpRecommended,
      overallPlainLanguageSummary: followUpRecommended
        ? "Some results appear outside the provided reference ranges or form a pattern worth reviewing with a healthcare professional."
        : "The submitted results appear within the provided reference ranges. Continue to review lab results with a healthcare professional who knows your full clinical context.",
      importantNotes: [
        "Reference ranges can vary by lab, age, sex, pregnancy status, medications, and clinical context.",
        "This tool is educational only and does not provide a diagnosis."
      ]
    },
    results: explainedResults,
    combinationFlags
  };

  return analyzeLabsResponseSchema.parse(response);
}
