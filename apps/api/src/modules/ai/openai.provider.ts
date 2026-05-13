import {OpenAI} from "openai";
import type { CombinationFlag, LabExplanation, PatientContext } from "@lab-results/shared";
import { labExplanationSchema } from "@lab-results/shared";
import { env } from "../../config/env.js";
import { LAB_EXPLAINER_SYSTEM_PROMPT } from "./prompts.js";

type GenerateInput = {
  patientContext?: PatientContext;
  classifiedResults: LabExplanation[];
  combinationFlags: CombinationFlag[];
};

export async function generateOpenAiExplanations(input: GenerateInput): Promise<LabExplanation[]> {
  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    ...(env.OPENAI_BASE_URL ? { baseURL: env.OPENAI_BASE_URL } : {})
  });

  const model = env.OPENAI_MODEL ?? env.AZURE_OPENAI_DEPLOYMENT;

  const completion = await Promise.race([
    client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: LAB_EXPLAINER_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            task: "Explain the classified lab results in patient-friendly language. Do not change the status values assigned by the backend.",
            patientContext: input.patientContext ?? {},
            classifiedResults: input.classifiedResults,
            combinationFlags: input.combinationFlags,
            requiredShape: {
              results: [
                {
                  testName: "string",
                  normalizedName: "string",
                  value: "number",
                  unit: "string",
                  referenceRange: { low: "number optional", high: "number optional", text: "string optional" },
                  status: "normal | low | high | borderline | unknown",
                  severity: "none | mild | moderate | critical | unknown",
                  plainLanguageExplanation: "string",
                  possibleGeneralCauses: ["string"],
                  followUpQuestions: ["string"],
                  shouldDiscussWithClinician: "boolean",
                  disclaimer: "string"
                }
              ]
            }
          })
        }
      ]
    }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`OpenAI request timed out after ${env.OPENAI_TIMEOUT_MS}ms`)), env.OPENAI_TIMEOUT_MS);
    })
  ]);

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("AI provider returned an empty response");

  const parsed = JSON.parse(raw) as { results?: unknown[] };
  if (!Array.isArray(parsed.results)) throw new Error("AI provider response did not contain results[]");

  return parsed.results.map((result, index) => {
    const original = input.classifiedResults[index];
    const aiResult = labExplanationSchema.parse({
      ...original,
      ...(result as object),
      normalizedName: original.normalizedName,
      value: original.value,
      unit: original.unit,
      referenceRange: original.referenceRange,
      status: original.status,
      severity: original.severity
    });

    return aiResult;
  });
}
