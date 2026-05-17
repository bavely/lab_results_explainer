# Lab Results Explainer — Flask + React Starter

A patient-friendly starter application for explaining common lab results in plain language. This version uses:

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn-style UI components, react-hook-form, Zod, TanStack Query
- **Backend:** Python, Flask, Pydantic, pypdf
- **Core logic:** deterministic lab-range classification, normalization, combination flags, mock explanations, and an Azure AI Foundry Agent provider

> Educational use only. This application does not provide medical advice, diagnosis, or treatment. Lab results should always be interpreted by a licensed healthcare professional.

---

## Project Structure

```txt
lab-results-explainer-flask-react-starter/
├── apps/
│   ├── api/                         # Python Flask backend
│   │   ├── src/
│   │   │   ├── app.py
│   │   │   ├── config.py
│   │   │   ├── modules/
│   │   │   │   ├── ai/
│   │   │   │   ├── lab_analysis/
│   │   │   │   └── pdf_parser/
│   │   │   └── utils/
│   │   ├── requirements.txt
│   │   ├── run.py
│   │   └── .env.example
│   │
│   └── web/                         # React frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── labs/
│       │   │   ├── layout/
│       │   │   └── ui/
│       │   ├── lib/
│       │   ├── pages/
│       │   ├── types/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       ├── tailwind.config.ts
│       └── vite.config.ts
│
├── docs/
│   ├── architecture.md
│   ├── medical-guardrails.md
│   └── prompt-design.md
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick Start

### 1. Start the Flask API

```bash
cd apps/api
python -m venv .venv

# Windows Git Bash / PowerShell may differ:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python run.py
```

API runs at:

```txt
http://localhost:4000
```

Health check:

```txt
GET http://localhost:4000/api/health
```

### 2. Start the React app

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

---

## Main API Endpoints

### Analyze manual lab results

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
      "referenceRange": {
        "low": 12,
        "high": 16
      }
    }
  ]
}
```

### Upload PDF lab report

```http
POST /api/labs/upload
Content-Type: multipart/form-data
```

Form field:

```txt
file: lab-report.pdf
```

The starter extracts raw text with `pypdf`, removes common PHI patterns, and applies a basic regex extractor. It is intentionally conservative and returns candidate values for user review before analysis.

---

## AI Provider Notes

By default, the backend uses a deterministic **mock explainer** so the app works before Azure authentication is configured.

To use your Azure AI Foundry Agent, set this inside `apps/api/.env`:

```env
AI_PROVIDER=azure_foundry_agent
AZURE_FOUNDRY_ENDPOINT=https://<resource-name>.services.ai.azure.com/api/projects/<project-name>
AZURE_FOUNDRY_AGENT_NAME=your-agent-name
AZURE_FOUNDRY_AGENT_VERSION=2
```

The Azure provider is implemented in:

```txt
apps/api/src/modules/ai/ai_service.py
```

It uses `DefaultAzureCredential`, so local development can authenticate with Azure CLI:

```bash
az login
```

You can also use managed identity in Azure hosting, or service-principal environment variables supported by `DefaultAzureCredential`.

Keep backend classification as the source of truth for low/high/normal status. The Azure agent explains the backend classification; it should not independently decide whether a result is abnormal. If the agent is unavailable or returns invalid JSON, the backend safely falls back to deterministic mock explanations.

---

## Safety and Privacy Defaults

- Uploaded PDFs are read in memory and not permanently stored.
- The PDF parser runs a basic PHI cleaner before returning extracted text snippets.
- The frontend displays a medical disclaimer.
- The backend returns educational explanations, not diagnoses.
- The app avoids collecting name, date of birth, address, insurance ID, or medical record number.

---

## Recommended Next Steps

1. Improve PDF extraction against real sample lab reports.
2. Add OCR for scanned PDFs.
3. Add rate limiting and request logging without sensitive values.
4. Replace mock AI output with structured JSON validation from a real LLM.
5. Add exportable patient summary PDF.
6. Add unit tests for classification and combination flags.
