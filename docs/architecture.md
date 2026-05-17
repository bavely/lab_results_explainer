# Architecture

```txt
User enters lab values or uploads PDF
        ↓
React frontend validates input with react-hook-form + Zod
        ↓
Flask API receives structured data or PDF file
        ↓
PDF parser extracts candidate lab values when needed
        ↓
Normalizer maps aliases such as Hgb → hemoglobin and HbA1c → a1c
        ↓
Rule engine compares values against provided reference ranges
        ↓
Combination flag engine detects follow-up patterns
        ↓
AI service generates patient-friendly explanation or mock fallback
        ↓
Frontend renders color-coded dashboard
```

## Why rules before AI?

The backend classifies results first. The LLM receives already-classified results and explains them. This reduces the risk that the model invents or changes the status of a lab value.
