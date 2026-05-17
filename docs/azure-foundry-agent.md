# Azure AI Foundry Agent Integration

The Flask backend can call an Azure AI Foundry Agent instead of directly calling a standalone OpenAI model.

## Environment variables

Set these values in `apps/api/.env`:

```env
AI_PROVIDER=azure_foundry_agent
AZURE_FOUNDRY_ENDPOINT=https://<resource-name>.services.ai.azure.com/api/projects/<project-name>
AZURE_FOUNDRY_AGENT_NAME=your-agent-name
AZURE_FOUNDRY_AGENT_VERSION=2
```

## Authentication

The backend uses `DefaultAzureCredential` from `azure-identity`.

For local development:

```bash
az login
```

For Azure deployment, prefer managed identity and assign the identity the required access to the Azure AI Foundry project and agent.

## Provider flow

1. Flask receives lab inputs.
2. Backend normalizes test names.
3. Backend classifies each value against the provided reference range.
4. Backend detects combination flags.
5. Backend sends classified results to the Azure Foundry Agent using an agent reference.
6. Agent returns JSON explanations.
7. Backend validates the JSON with Pydantic.
8. Backend preserves deterministic fields such as `status`, `severity`, `value`, and `referenceRange` even if the agent omits or changes them.
9. If the agent fails, backend returns deterministic mock explanations instead of blocking the UI.

## Important safety rule

The agent should explain the backend classification. It should not be the source of truth for whether a lab result is high, low, normal, or urgent.
