import type { AnalyzeLabsRequest } from "@lab-results/shared";

export const sampleLabPayload: AnalyzeLabsRequest = {
  patientContext: {
    age: 35,
    sex: "unknown"
  },
  results: [
    {
      testName: "Hemoglobin",
      value: 11.2,
      unit: "g/dL",
      referenceRange: { low: 12, high: 16 }
    },
    {
      testName: "A1C",
      value: 6.1,
      unit: "%",
      referenceRange: { low: 4, high: 5.6 }
    },
    {
      testName: "Glucose",
      value: 126,
      unit: "mg/dL",
      referenceRange: { low: 70, high: 99 }
    },
    {
      testName: "HDL",
      value: 51,
      unit: "mg/dL",
      referenceRange: { low: 40, high: 60 }
    }
  ]
};
