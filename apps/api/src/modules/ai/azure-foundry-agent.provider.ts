import { DefaultAzureCredential } from "@azure/identity";
import { AIProjectClient } from "@azure/ai-projects";
import type { CombinationFlag, LabExplanation, PatientContext } from "@lab-results/shared";
import { labExplanationSchema } from "@lab-results/shared";
import { env } from "../../config/env.js";
import { LAB_EXPLAINER_SYSTEM_PROMPT } from "./prompts.js";

type GenerateInput = {
  patientContext?: PatientContext;
  classifiedResults: LabExplanation[];
  combinationFlags: CombinationFlag[];
};

export async function generateAzureFoundryAgentExplanations(input: GenerateInput): Promise<LabExplanation[]> {
  if (!env.AZURE_AI_PROJECT_ENDPOINT || !env.AZURE_AI_AGENT_NAME || !env.AZURE_AI_AGENT_VERSION) {
    throw new Error("Missing AZURE_AI_PROJECT_ENDPOINT, AZURE_AI_AGENT_NAME, or AZURE_AI_AGENT_VERSION");
  }

  const projectClient = new AIProjectClient(env.AZURE_AI_PROJECT_ENDPOINT, new DefaultAzureCredential());
  const openAIClient = await projectClient.getAzureOpenAIClient();

  const conversation = await openAIClient.conversations.create({
    items: [{
      type: "message",
      role: "user",
      content: JSON.stringify({
        systemInstructions: LAB_EXPLAINER_SYSTEM_PROMPT,
        task: "Explain classified results in plain English, fill in missing reference ranges with general educational ranges when possible, and clearly flag any estimated ranges.",
        patientContext: input.patientContext ?? {},
        classifiedResults: input.classifiedResults,
        combinationFlags: input.combinationFlags,
        requiredShape: { results: [] }
      })
    }]
  });

  const response = await openAIClient.responses.create(
    { conversation: conversation.id },
    {
      body: {
        agent: {
          type: "agent_reference",
          name: env.AZURE_AI_AGENT_NAME,
          version: env.AZURE_AI_AGENT_VERSION
        }
      }
    }
  );

  const raw = response.output_text;
  if (!raw) throw new Error("Azure Foundry agent returned an empty response");

  const parsed = JSON.parse(raw) as { results?: unknown[] };
  if (!Array.isArray(parsed.results)) throw new Error("Azure Foundry agent response did not contain results[]");

  return parsed.results.map((result, index) => {
    const original = input.classifiedResults[index];
    return labExplanationSchema.parse({
      ...original,
      ...(result as object),
      normalizedName: original.normalizedName,
      value: original.value,
      unit: original.unit,
      status: original.status,
      severity: original.severity
    });
  });
}
