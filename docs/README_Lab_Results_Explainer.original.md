# Lab Results Explainer

A patient-friendly AI web application that helps users understand common lab results in plain language. Users can manually enter values such as Hemoglobin, A1C, Cholesterol, TSH, LDL, HDL, Triglycerides, Glucose, Creatinine, and eGFR, or upload a lab report PDF for automatic extraction.

The app highlights values that appear outside the provided reference range, explains what each result generally means, and flags combinations that may be worth discussing with a healthcare professional.

> **Medical disclaimer:** This project is for educational purposes only. It does not provide medical advice, diagnosis, or treatment. Lab results should always be interpreted by a licensed healthcare professional who understands the patient's full history, symptoms, medications, and clinical context.

---

## Why This Project Exists

Lab reports are often difficult for patients to understand because they include abbreviations, units, reference ranges, and abnormal flags without much explanation. **Lab Results Explainer** makes lab data easier to read by combining deterministic rule-based checks with AI-generated plain-language explanations.

This project demonstrates:

- Patient-facing healthcare UX
- React form architecture
- Node.js backend API design
- PDF parsing workflow
- Prompt engineering with medical guardrails
- Structured LLM output
- Rule-based + AI hybrid decision flow
- Privacy-aware handling of sensitive health data
- Portfolio-ready visual data presentation

---

## Core Features

### 1. Manual Lab Entry

Users can enter lab results manually:

- Test name
- Result value
- Unit
- Reference range low
- Reference range high
- Optional notes

Example:

```txt
Test: Hemoglobin
Value: 11.2
Unit: g/dL
Reference Range: 12.0 - 16.0
```

---

### 2. PDF Lab Report Upload

Users can upload a PDF lab report. The backend extracts raw text and attempts to identify:

- Lab test names
- Result values
- Units
- Reference ranges
- Abnormal flags such as High, Low, H, L, or Out of Range

The app should show extracted values to the user for review before generating AI explanations.

---

### 3. Color-Coded Result Classification

Each lab result is classified as:

- Normal
- Low
- High
- Borderline
- Unknown
- Needs follow-up

The classification should be performed by backend rules before sending data to the LLM. The LLM explains the result; it should not be the only source deciding whether a value is high or low.

---

### 4. Plain-Language AI Explanations

The AI explains each result in patient-friendly language:

- What the test commonly measures
- Whether the value appears low, high, or within the provided range
- General reasons the result may be abnormal
- Questions the patient may ask their clinician
- Clear reminder that the explanation is educational, not diagnostic

---

### 5. Combination Flags

The backend can flag result combinations that may warrant follow-up, such as:

- High A1C + high fasting glucose
- High LDL + high total cholesterol
- Low hemoglobin + low MCV
- High TSH + low free T4
- High creatinine + low eGFR

These flags are not diagnoses. They are educational prompts for follow-up discussion.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- MUI or shadcn/ui
- react-hook-form
- Zod
- TanStack Query
- Recharts or ApexCharts

### Backend

- Node.js
- TypeScript
- Express or NestJS
- Zod
- Multer
- pdf-parse
- OpenAI API or Claude API

### Optional Enhancements

- PostgreSQL
- Prisma
- Redis for rate limiting
- Docker
- OCR for scanned PDFs
- Auth0 or Clerk for authentication
- Exportable patient summary PDF

---

## High-Level Architecture

```txt
User enters lab values or uploads PDF
        ↓
React frontend validates input
        ↓
Node.js API receives structured data or PDF file
        ↓
PDF parser extracts candidate lab values when needed
        ↓
Normalizer maps test names and units
        ↓
Rule engine compares values against provided reference ranges
        ↓
Combination flag engine detects important patterns
        ↓
AI service generates patient-friendly explanation
        ↓
Frontend renders color-coded dashboard
```

---

## Repository Structure

```txt
lab-results-explainer/
├── apps/
│   ├── web/                         # React frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   ├── labs/
│   │   │   │   └── ui/
│   │   │   ├── features/
│   │   │   │   └── lab-analysis/
│   │   │   ├── pages/
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── api/                         # Node.js backend
│       ├── src/
│       │   ├── server.ts
│       │   ├── app.ts
│       │   ├── config/
│       │   ├── modules/
│       │   │   ├── lab-analysis/
│       │   │   ├── pdf-parser/
│       │   │   └── ai/
│       │   ├── middleware/
│       │   └── types/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                      # Shared schemas and types
│   └── reference-data/              # Lab metadata and fallback ranges
│
├── docs/
│   ├── architecture.md
│   ├── prompt-design.md
│   ├── medical-guardrails.md
│   └── screenshots/
│
├── .env.example
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Frontend Architecture

### Main Pages

#### Home Page

- Explains what the app does
- Shows medical disclaimer
- Provides two entry paths:
  - Manual lab entry
  - Upload lab report PDF

#### Manual Entry Page

- Dynamic lab result rows
- Autocomplete for common test names
- Unit selector
- Reference range fields
- Form validation
- Submit button

#### Upload Report Page

- Drag-and-drop PDF upload
- File type and size validation
- Upload progress state
- Extracted values preview
- User correction before analysis

#### Results Page

- Overall summary card
- Color-coded lab result cards
- Reference range visualization
- Follow-up question list
- Combination flags
- Export/share option

---

## Key Frontend Components

```txt
components/labs/
├── LabEntryForm.tsx
├── LabResultCard.tsx
├── LabResultTable.tsx
├── PdfUploadDropzone.tsx
├── RangeIndicator.tsx
├── RiskFlagBanner.tsx
└── ExplanationPanel.tsx
```

### LabResultCard

Displays:

- Test name
- Value and unit
- Reference range
- Status badge
- Plain-language explanation
- Follow-up questions

### RangeIndicator

Visualizes where the user's result falls compared to the reference range:

```txt
Low             Normal Range             High
|----------------|========================|----------------|
                         ^ user value
```

### RiskFlagBanner

Displays combination-based follow-up flags and explains why the pattern may be worth discussing with a clinician.

---

## Backend Architecture

```txt
modules/
├── lab-analysis/
│   ├── lab.routes.ts
│   ├── lab.controller.ts
│   ├── lab.service.ts
│   ├── lab.rules.ts
│   ├── lab.normalizer.ts
│   └── lab.reference-ranges.ts
│
├── pdf-parser/
│   ├── pdf.routes.ts
│   ├── pdf.controller.ts
│   ├── pdf.service.ts
│   └── extract-lab-values.ts
│
└── ai/
    ├── ai.client.ts
    ├── openai.provider.ts
    ├── anthropic.provider.ts
    ├── prompts/
    │   ├── lab-explainer.system.ts
    │   └── lab-explainer.user.ts
    └── schemas/
        └── lab-explanation.schema.ts
```

---

## API Endpoints

### Analyze Manual Lab Results

```http
POST /api/labs/analyze
```

Request:

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

Response:

```json
{
  "summary": {
    "totalResults": 1,
    "normalCount": 0,
    "abnormalCount": 1,
    "followUpRecommended": true
  },
  "results": [
    {
      "testName": "Hemoglobin",
      "normalizedName": "hemoglobin",
      "value": 11.2,
      "unit": "g/dL",
      "status": "low",
      "severity": "mild",
      "plainLanguageExplanation": "Hemoglobin is a protein in red blood cells that carries oxygen. Your value appears below the provided reference range. Low hemoglobin can be associated with several causes, including iron deficiency, blood loss, chronic inflammation, or other conditions. This does not diagnose the cause, but it would be reasonable to discuss this result with your healthcare professional.",
      "followUpQuestions": [
        "Should I repeat this test?",
        "Should iron studies or ferritin be checked?",
        "Could this be related to diet, bleeding, or another condition?"
      ],
      "disclaimer": "This explanation is educational and is not a medical diagnosis."
    }
  ],
  "combinationFlags": []
}
```

---

### Upload Lab Report PDF

```http
POST /api/labs/upload
Content-Type: multipart/form-data
```

Form field:

```txt
file: lab-report.pdf
```

Response:

```json
{
  "extractedResults": [
    {
      "testName": "A1C",
      "value": 6.1,
      "unit": "%",
      "referenceRange": {
        "low": 4.0,
        "high": 5.6
      },
      "source": "pdf"
    }
  ],
  "needsReview": true,
  "message": "We extracted possible lab values from your report. Please review before generating explanations."
}
```

---

## Shared TypeScript Types

```ts
export type LabStatus =
  | "normal"
  | "low"
  | "high"
  | "borderline"
  | "unknown";

export type LabSeverity =
  | "none"
  | "mild"
  | "moderate"
  | "critical"
  | "unknown";

export interface ReferenceRange {
  low?: number;
  high?: number;
  text?: string;
}

export interface LabInput {
  testName: string;
  value: number;
  unit?: string;
  referenceRange?: ReferenceRange;
}

export interface LabExplanation {
  testName: string;
  normalizedName: string;
  value: number;
  unit?: string;
  status: LabStatus;
  severity: LabSeverity;
  plainLanguageExplanation: string;
  possibleGeneralCauses: string[];
  followUpQuestions: string[];
  shouldDiscussWithClinician: boolean;
  urgentCareDisclaimer?: string;
  disclaimer: string;
}
```

---

## Lab Classification Logic

The backend should classify values before sending them to the LLM.

```ts
function classifyLabValue(
  value: number,
  low?: number,
  high?: number
): "normal" | "low" | "high" | "unknown" {
  if (low === undefined && high === undefined) return "unknown";
  if (low !== undefined && value < low) return "low";
  if (high !== undefined && value > high) return "high";
  return "normal";
}
```

The LLM should explain the classification, not independently decide whether a value is normal or abnormal.

---

## Combination Rule Example

```ts
export function detectCombinationFlags(results: NormalizedLabResult[]) {
  const flags = [];

  const a1c = findResult(results, "a1c");
  const glucose = findResult(results, "glucose");
  const ldl = findResult(results, "ldl");
  const totalCholesterol = findResult(results, "total_cholesterol");
  const hemoglobin = findResult(results, "hemoglobin");
  const mcv = findResult(results, "mcv");
  const tsh = findResult(results, "tsh");
  const freeT4 = findResult(results, "free_t4");

  if (isHigh(a1c) && isHigh(glucose)) {
    flags.push({
      code: "glucose_a1c_followup",
      title: "Blood sugar follow-up may be useful",
      explanation:
        "Both A1C and glucose appear above the provided reference ranges. This pattern can be worth discussing with a clinician, especially if fasting status is known.",
      severity: "follow_up"
    });
  }

  if (isHigh(ldl) && isHigh(totalCholesterol)) {
    flags.push({
      code: "cholesterol_followup",
      title: "Cholesterol follow-up may be useful",
      explanation:
        "LDL and total cholesterol appear elevated. A clinician can interpret this along with age, blood pressure, family history, and other risk factors.",
      severity: "follow_up"
    });
  }

  if (isLow(hemoglobin) && isLow(mcv)) {
    flags.push({
      code: "low_hgb_low_mcv_followup",
      title: "Possible anemia pattern to discuss",
      explanation:
        "Low hemoglobin with low MCV can be seen in several situations. This does not identify the cause, but it may be worth asking whether iron studies are appropriate.",
      severity: "follow_up"
    });
  }

  if (isHigh(tsh) && isLow(freeT4)) {
    flags.push({
      code: "thyroid_followup",
      title: "Thyroid follow-up may be useful",
      explanation:
        "TSH and free T4 together can provide thyroid function context. This pattern should be reviewed by a healthcare professional.",
      severity: "follow_up"
    });
  }

  return flags;
}
```

---

## AI System Prompt

```txt
You are a patient-friendly lab result explainer.

Your role:
- Explain lab results in plain language.
- Help users understand what a test commonly measures.
- Explain whether a value appears low, high, or within the provided reference range.
- Suggest reasonable follow-up questions for a licensed healthcare professional.

Safety rules:
- Do not diagnose the user.
- Do not claim the user has a specific disease.
- Do not prescribe medication, supplements, lifestyle treatment, or dosage changes.
- Do not tell the user to stop, start, or change medication.
- Do not replace professional medical advice.
- Use cautious language such as "may be associated with", "can sometimes be seen with", and "worth discussing with your clinician."
- If a result may be serious, advise timely follow-up with a healthcare professional.
- If the user reports severe symptoms such as chest pain, severe shortness of breath, fainting, confusion, stroke-like symptoms, or severe bleeding, advise urgent medical care.

Reference range rules:
- Prefer the reference range provided by the user's lab report.
- If no reference range is provided, use fallback ranges only as general educational context.
- Explain that ranges can vary by lab, age, sex, pregnancy status, and clinical context.

Output rules:
- Return valid JSON only.
- Do not include markdown.
- Do not include citations.
- Do not include hidden reasoning.
```

---

## AI User Prompt Template

```txt
Explain the following lab results in patient-friendly language.

Patient context:
{{patientContext}}

Lab results:
{{labResults}}

Backend classifications:
{{classifiedResults}}

Combination flags:
{{combinationFlags}}

Return JSON matching this schema:
{
  "summary": {
    "overallPlainLanguageSummary": "string",
    "followUpRecommended": boolean,
    "importantNotes": ["string"]
  },
  "results": [
    {
      "testName": "string",
      "status": "normal | low | high | borderline | unknown",
      "severity": "none | mild | moderate | critical | unknown",
      "plainLanguageExplanation": "string",
      "possibleGeneralCauses": ["string"],
      "followUpQuestions": ["string"],
      "shouldDiscussWithClinician": boolean,
      "disclaimer": "string"
    }
  ],
  "combinationFlags": [
    {
      "title": "string",
      "explanation": "string",
      "recommendedFollowUp": "string"
    }
  ]
}
```

---

## Environment Variables

Create `.env` inside `apps/api`.

```env
PORT=4000
NODE_ENV=development

AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

MAX_UPLOAD_MB=10
DELETE_UPLOADS_AFTER_PARSE=true
```

---

## Installation

```bash
pnpm install
```

---

## Run Locally

Start the backend:

```bash
pnpm --filter api dev
```

Start the frontend:

```bash
pnpm --filter web dev
```

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:4000
```

---

## Development Roadmap

### Phase 1: Manual Entry MVP

- Build manual lab entry form
- Add validation with Zod
- Add backend analyze endpoint
- Add rule-based range classification
- Return mock explanations
- Build results dashboard

### Phase 2: AI Explanations

- Add OpenAI or Claude provider
- Add structured JSON response schema
- Add medical safety system prompt
- Add retry and fallback handling
- Validate AI responses before returning them to the frontend

### Phase 3: PDF Upload

- Add upload endpoint
- Extract PDF text using `pdf-parse`
- Detect candidate lab values
- Normalize lab names and units
- Show extracted values for user review
- Allow manual correction before analysis

### Phase 4: Portfolio Polish

- Add range visualizations
- Add combination flags
- Add loading and error states
- Add screenshots
- Add demo video
- Add deployment

---

## Privacy and Safety Notes

Recommended safeguards:

- Do not store uploaded PDFs by default
- Delete temporary files after parsing
- Limit PDF file size
- Accept only PDF files
- Avoid collecting unnecessary personal information
- Do not collect name, date of birth, address, insurance ID, or medical record number unless absolutely required
- Add rate limiting
- Avoid logging sensitive lab values
- Add a visible medical disclaimer on every results page
- Always encourage users to review results with a licensed healthcare professional

---

## Portfolio Talking Point

> I built a healthcare AI tool that combines deterministic lab-range classification with LLM-generated patient explanations. The system uses medical guardrails, structured JSON output, privacy-aware PDF handling, and a clean patient-facing React UI to make lab reports easier to understand without making diagnoses.

---

## Future Enhancements

- OCR support for scanned PDFs
- Historical lab trend tracking
- User accounts
- Exportable patient summary
- Multi-language explanations
- Arabic language support
- FHIR integration
- EHR import support
- Clinician-reviewed reference data
- Mobile-first responsive version

---

## Disclaimer

Lab Results Explainer is an educational tool. It does not provide medical advice, diagnosis, or treatment. Always consult a licensed healthcare professional for medical interpretation of lab results.
