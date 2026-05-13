export interface CleanPHIOptions {
  /**
   * HIPAA treats most patient-related dates as PHI, except year-only dates.
   * Default: true
   */
  redactAllDates?: boolean;

  /**
   * Redacts standalone name-looking text like "John Smith".
   * This can over-redact test names, provider names, or facility names.
   * Default: false
   */
  aggressiveNames?: boolean;
}

export function cleanPHI(
  text: string,
  options: CleanPHIOptions = {}
): string {
  const { redactAllDates = true, aggressiveNames = false } = options;

  if (!text) return text;

  let cleaned = text;

  const PHI_LABELS: Record<string, string[]> = {
    names: [
      String.raw`Patient(?:'s)?\s*Name`,
      String.raw`Pt\.?\s*Name`,
      String.raw`Full\s*Name`,
      String.raw`Member\s*Name`,
      String.raw`Subscriber\s*Name`,
      String.raw`Guarantor\s*Name`,
      String.raw`Responsible\s*Party`,
      String.raw`Ordering\s*Provider`,
      String.raw`Referring\s*Provider`,
      String.raw`Provider`,
      String.raw`Physician`,
      String.raw`Doctor`,
      String.raw`PCP`
    ],

    dob: [
      String.raw`DOB`,
      String.raw`D\.O\.B\.`,
      String.raw`Date\s*of\s*Birth`,
      String.raw`Birth\s*Date`
    ],

    dates: [
      String.raw`Collection\s*Date`,
      String.raw`Collected`,
      String.raw`Report\s*Date`,
      String.raw`Reported\s*Date`,
      String.raw`Result\s*Date`,
      String.raw`Specimen\s*Date`,
      String.raw`Admission\s*Date`,
      String.raw`Discharge\s*Date`,
      String.raw`Visit\s*Date`,
      String.raw`Encounter\s*Date`,
      String.raw`Service\s*Date`,
      String.raw`Draw\s*Date`
    ],

    contact: [
      String.raw`Phone`,
      String.raw`Telephone`,
      String.raw`Mobile`,
      String.raw`Cell`,
      String.raw`Fax`,
      String.raw`Email`,
      String.raw`E-mail`
    ],

    address: [
      String.raw`Address`,
      String.raw`Street\s*Address`,
      String.raw`Home\s*Address`,
      String.raw`Mailing\s*Address`,
      String.raw`City`,
      String.raw`State`,
      String.raw`Zip`,
      String.raw`ZIP\s*Code`
    ],

    ids: [
      String.raw`MRN`,
      String.raw`Medical\s*Record\s*(?:Number|No\.?|#)?`,
      String.raw`Patient\s*ID`,
      String.raw`Patient\s*Number`,
      String.raw`Member\s*ID`,
      String.raw`Subscriber\s*ID`,
      String.raw`Account\s*(?:Number|No\.?|#)?`,
      String.raw`Encounter\s*(?:Number|No\.?|#)?`,
      String.raw`Accession\s*(?:Number|No\.?|#)?`,
      String.raw`Requisition\s*(?:Number|No\.?|#)?`,
      String.raw`Order\s*(?:Number|No\.?|#)?`,
      String.raw`Specimen\s*(?:ID|Number|No\.?|#)?`,
      String.raw`Sample\s*(?:ID|Number|No\.?|#)?`,
      String.raw`Case\s*(?:ID|Number|No\.?|#)?`,
      String.raw`Insurance\s*(?:ID|Number|No\.?|#)?`,
      String.raw`Policy\s*(?:ID|Number|No\.?|#)?`,
      String.raw`Claim\s*(?:ID|Number|No\.?|#)?`,
      String.raw`SSN`,
      String.raw`Social\s*Security\s*(?:Number|No\.?|#)?`
    ],

    demographics: [
      String.raw`Age`,
      String.raw`Sex`,
      String.raw`Gender`
    ]
  };

  const allLabelsPattern = Object.values(PHI_LABELS)
    .flat()
    .sort((a, b) => b.length - a.length)
    .join("|");

  function redactLabeledValues(labels: string[], replacement: string) {
    const labelPattern = labels
      .sort((a, b) => b.length - a.length)
      .join("|");

    const pattern = new RegExp(
      String.raw`\b(${labelPattern})\s*(?::|#|-)?\s*([^\n\r|;]{1,140}?)(?=\s+(?:${allLabelsPattern})\s*(?::|#|-)?|[|;\n\r]|$)`,
      "giu"
    );

    cleaned = cleaned.replace(pattern, (_match, label) => {
      return `${label}: ${replacement}`;
    });
  }

  // Redact labeled PHI first.
  redactLabeledValues(PHI_LABELS.names, "[REDACTED_NAME]");
  redactLabeledValues(PHI_LABELS.dob, "[REDACTED_DOB]");
  redactLabeledValues(PHI_LABELS.dates, "[REDACTED_DATE]");
  redactLabeledValues(PHI_LABELS.contact, "[REDACTED_CONTACT]");
  redactLabeledValues(PHI_LABELS.address, "[REDACTED_ADDRESS]");
  redactLabeledValues(PHI_LABELS.ids, "[REDACTED_ID]");
  redactLabeledValues(PHI_LABELS.demographics, "[REDACTED_DEMOGRAPHIC]");

  // Redact generic line-start labels like:
  // Name: John Smith
  // Patient: John Smith
  // Pt: John Smith
  const genericNameLinePattern = new RegExp(
    String.raw`(^|[\n\r])(\s*(?:Name|Patient|Pt\.?)\s*(?::|#|-)\s*)([^\n\r|;]{1,100}?)(?=\s+(?:${allLabelsPattern})\s*(?::|#|-)?|[|;\n\r]|$)`,
    "giu"
  );

  cleaned = cleaned.replace(
    genericNameLinePattern,
    (_match, lineStart, labelPrefix) => {
      return `${lineStart}${labelPrefix}[REDACTED_NAME]`;
    }
  );

  // Email addresses.
  cleaned = cleaned.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    "[REDACTED_EMAIL]"
  );

  // US phone/fax numbers.
  cleaned = cleaned.replace(
    /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
    "[REDACTED_PHONE]"
  );

  // SSN formats: 123-45-6789 or 123456789.
  cleaned = cleaned.replace(
    /\b\d{3}-?\d{2}-?\d{4}\b/g,
    "[REDACTED_SSN]"
  );

  // Common IDs if they appear with obvious ID prefixes.
  cleaned = cleaned.replace(
    /\b(?:MRN|ID|Patient ID|Member ID|Account|Accession|Requisition|Order|Specimen|Encounter)\s*(?::|#|-)?\s*[A-Z0-9-]{4,}\b/gi,
    "[REDACTED_ID]"
  );

  // URLs.
  cleaned = cleaned.replace(
    /\b(?:https?:\/\/|www\.)[^\s]+/gi,
    "[REDACTED_URL]"
  );

  // IP addresses.
  cleaned = cleaned.replace(
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    "[REDACTED_IP]"
  );

  // Street addresses.
  cleaned = cleaned.replace(
    /\b\d{1,6}\s+(?:[A-Z0-9][A-Z0-9'.-]*\s+){1,8}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Pkwy|Parkway|Pl|Place|Terrace|Ter|Circle|Cir)\.?(?:\s+(?:Apt|Apartment|Suite|Ste|Unit|#)\s*[A-Z0-9-]+)?\b/gi,
    "[REDACTED_ADDRESS]"
  );

  // Dates. This includes "01-FEB-1990".
  if (redactAllDates) {
    const MONTHS =
      String.raw`Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?`;

    const datePatterns = [
      // 01-FEB-1990, 1-Feb-1990
      new RegExp(
        String.raw`\b(?:0?[1-9]|[12][0-9]|3[01])-(?:${MONTHS})-(?:19|20)\d{2}\b`,
        "gi"
      ),

      // 02/01/1990, 2-1-1990, 02.01.1990
      /\b(?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12][0-9]|3[01])[-/.](?:19|20)\d{2}\b/g,

      // 1990-02-01
      /\b(?:19|20)\d{2}[-/.](?:0?[1-9]|1[0-2])[-/.](?:0?[1-9]|[12][0-9]|3[01])\b/g,

      // February 1, 1990
      new RegExp(
        String.raw`\b(?:${MONTHS})\s+(?:0?[1-9]|[12][0-9]|3[01]),?\s+(?:19|20)\d{2}\b`,
        "gi"
      ),

      // 1 February 1990
      new RegExp(
        String.raw`\b(?:0?[1-9]|[12][0-9]|3[01])\s+(?:${MONTHS})\s+(?:19|20)\d{2}\b`,
        "gi"
      )
    ];

    for (const pattern of datePatterns) {
      cleaned = cleaned.replace(pattern, "[REDACTED_DATE]");
    }
  }

  // HIPAA treats ages over 89 as PHI.
  cleaned = cleaned.replace(
    /\b(?:9[0-9]|1[01][0-9]|120)\s*(?:years old|year old|yrs old|yr old|y\/o|yo)\b/gi,
    "[REDACTED_AGE_OVER_89]"
  );

  // Optional aggressive name removal.
  // Use carefully because it can redact non-PHI phrases like "Lab Results".
  if (aggressiveNames) {
    cleaned = cleaned.replace(
      /\b[A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+){1,3}\b/g,
      "[REDACTED_POSSIBLE_NAME]"
    );
  }

  // Clean repeated spaces introduced by replacements.
  cleaned = cleaned.replace(/[ \t]{2,}/g, " ");

  return cleaned.trim();
}