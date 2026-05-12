import type { CombinationFlag, LabExplanation, PatientContext } from "@lab-results/shared";
import { labExplanationSchema } from "@lab-results/shared";
import { env } from "../../config/env.js";
import { generateOpenAiExplanations } from "./openai.provider.js";

type GenerateInput = {
  patientContext?: PatientContext;
  classifiedResults: LabExplanation[];
  combinationFlags: CombinationFlag[];
};

export async function generateLabExplanations(input: GenerateInput): Promise<LabExplanation[]> {
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    try {
      return await generateOpenAiExplanations(input);
    } catch (error) {
      console.error("OpenAI explanation failed. Falling back to deterministic explanations.", error);
    }
  }

  return input.classifiedResults.map((result) => labExplanationSchema.parse({
    ...result,
    plainLanguageExplanation: buildMockExplanation(result),
    possibleGeneralCauses: buildMockCauses(result.status),
    followUpQuestions: buildFollowUpQuestions(result),
    shouldDiscussWithClinician: result.status !== "normal" || input.combinationFlags.length > 0,
    disclaimer: "This explanation is educational and is not a medical diagnosis."
  }));
}

function buildMockExplanation(result: LabExplanation) {
  const rangeText = result.referenceRange?.low !== undefined && result.referenceRange?.high !== undefined
    ? `The provided reference range is ${result.referenceRange.low} to ${result.referenceRange.high}${result.unit ? ` ${result.unit}` : ""}.`
    : "No complete reference range was provided, so the status may be limited.";

  if (result.status === "normal") {
    return `${result.testName} appears within the provided reference range. ${rangeText} This is generally reassuring, but lab values should still be reviewed with a clinician who knows your full health history.`;
  }

  if (result.status === "unknown") {
    return `${result.testName} could not be clearly classified because the reference range is missing or incomplete. ${rangeText} Ask your clinician or lab report for the correct reference interval.`;
  }

  return `${result.testName} appears ${result.status} compared with the provided reference range. ${rangeText} A ${result.status} result can sometimes be associated with several possible causes, and the meaning depends on your symptoms, medications, history, and other test results. It would be reasonable to discuss this result with a licensed healthcare professional.`;
}

function buildMockCauses(status: LabExplanation["status"]) {
  if (status === "normal") return [];
  if (status === "unknown") return ["Missing or incomplete reference range", "Different lab-specific reference intervals"];
  return [
    "Lab-specific range differences",
    "Recent diet, hydration, illness, medications, or fasting status",
    "A condition that requires clinical interpretation by a healthcare professional"
  ];
}

function buildFollowUpQuestions(result: LabExplanation) {
  if (result.status === "normal") {
    return ["Should I monitor this result again during my next routine labs?"];
  }

  if (result.status === "unknown") {
    return [
      "What is the correct reference range for this test?",
      "Should this result be repeated or compared with prior results?"
    ];
  }

  return [
    "Should I repeat this test?",
    "How should this be interpreted with my symptoms, medications, and medical history?",
    "Are there related labs that should be reviewed together with this result?"
  ];
}
