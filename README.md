# Lab Results Explainer — Flask + React

A patient-friendly starter application for explaining common lab results in plain language.

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn-style UI, react-hook-form, Zod, TanStack Query
- **Backend:** Python, Flask, Pydantic, pypdf
- **Core logic:** deterministic normalization + range classification, combination risk flags, and AI-generated educational explanations with deterministic fallback

> Educational use only. This application does **not** provide medical advice, diagnosis, or treatment.

## Repository Layout

```txt
.
├── apps/
│   ├── api/                         # Flask backend
│   └── web/                         # React frontend
├── docs/                            # Architecture, guardrails, and prompt design docs
├── docker-compose.yml               # Local full-stack orchestration
├── package.json                     # Root helper scripts
└── README.md
```

## Quick Start

### 1) Configure environment

From the repository root:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 2) Run backend API

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

API base URL: `http://localhost:4000`

Health endpoint:

```http
GET /api/health
```

### 3) Run web app

```bash
cd apps/web
npm install
npm run dev
```

Web URL: `http://localhost:5173`

## Root Convenience Scripts

From repository root:

```bash
npm run dev:api
npm run dev:web
npm run build:web
```

## API Endpoints

### Analyze lab values

```http
POST /api/labs/analyze
Content-Type: application/json
```

Example body:

```json
{
  "patientContext": {
    "age": 35,
    "sex": "female",
    "pregnant": false
  },
  "results": [
    {
      "testName": "Hemoglobin",
      "value": 11.2,
      "unit": "g/dL",
      "referenceRange": { "low": 12, "high": 16 }
    }
  ]
}
```

### Upload PDF lab report

```http
POST /api/labs/upload
Content-Type: multipart/form-data
```

Form-data field name: `file`

The backend extracts PDF text and returns candidate values for user confirmation before analysis.

## AI Provider Behavior

Default behavior uses deterministic **mock** explanations so the app works without cloud credentials.

To enable Azure AI Foundry Agent, configure in `apps/api/.env`:

```env
AI_PROVIDER=azure_foundry_agent
AZURE_FOUNDRY_ENDPOINT=https://<resource>.services.ai.azure.com/api/projects/<project>
AZURE_FOUNDRY_AGENT_NAME=<agent-name>
AZURE_FOUNDRY_AGENT_VERSION=2
```

If the AI call fails or returns invalid output, backend logic falls back to deterministic mock explanations.

## Safety and Privacy Defaults

- Uploaded PDFs are processed in memory (no permanent storage).
- Basic PHI pattern masking runs during parsing.
- UI includes explicit educational-use disclaimer.
- Backend classification is source of truth; AI explains but does not set abnormality status.

## Documentation Map

- `docs/architecture.md` — end-to-end architecture and module responsibilities
- `docs/medical-guardrails.md` — safety boundaries and non-diagnostic constraints
- `docs/prompt-design.md` — prompt contracts for LLM output
- `docs/azure-foundry-agent.md` — Azure provider setup details

## Suggested Next Improvements

1. Improve extraction accuracy across diverse real-world lab PDF formats.
2. Add OCR path for scanned/image-only PDF reports.
3. Add request throttling and structured, non-sensitive observability.
4. Increase backend test coverage for parsing + normalization edge cases.
