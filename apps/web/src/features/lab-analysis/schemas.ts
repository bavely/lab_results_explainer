import { z } from "zod";

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || Number.isNaN(value)) return undefined;
  return value;
}, z.coerce.number().optional());


export const labEntryFormSchema = z.object({
  patientContext: z.object({
    age: z.preprocess((value) => {
      if (value === "" || value === null || Number.isNaN(value)) return undefined;
      return value;
    }, z.coerce.number().min(0).max(130).optional()),
    sex: z.enum(["female", "male", "other", "unknown"]).default("unknown")
  }),
  results: z.array(
    z.object({
      testName: z.string().min(1, "Test name is required"),
      value: z.coerce.number({ invalid_type_error: "Value must be a number" }),
      unit: z.string().optional(),
      referenceRange: z.object({
        low: optionalNumber,
        high: optionalNumber
      }),
      notes: z.string().optional()
    })
  ).min(1)
});

export type LabEntryFormValues = z.infer<typeof labEntryFormSchema>;
