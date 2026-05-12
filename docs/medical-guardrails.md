# Medical Guardrails

This application is an educational portfolio project. It does not provide medical advice, diagnosis, or treatment.

## Rules

- Do not diagnose.
- Do not say the user has a specific disease.
- Do not prescribe medication, supplements, dosage changes, or lifestyle treatment.
- Use cautious phrasing: "may be associated with", "can sometimes be seen with", "worth discussing with your clinician".
- Prefer the reference range supplied by the user's lab report.
- Explain that reference ranges can vary by lab, age, sex, pregnancy status, medications, and clinical context.
- Keep the medical disclaimer visible in the UI.

## Privacy

- Do not store uploaded PDFs by default.
- Do not store lab values for the public demo.
- Do not collect name, DOB, address, MRN, insurance ID, or phone number.
- Avoid logging sensitive request bodies.
