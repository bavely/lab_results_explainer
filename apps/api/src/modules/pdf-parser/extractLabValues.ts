import type { ExtractedLabResult, ReferenceRange } from "@lab-results/shared";

type TestDefinition = {
  displayName: string;
  aliases: string[];
};

type ParsedValue = {
  value?: number;
  valueText: string;
  comparator?: "<" | ">";
};

const testDefinitions: TestDefinition[] = [
  { displayName: "HIV I & II Ab/Ag with P24 Ag", aliases: ["HIV I & II Ab/Ag with P24 Ag", "HIV I and II Ab/Ag with P24 Ag"] },
  { displayName: "PSA-Prostate Specific Antigen, Total", aliases: ["PSA-Prostate Specific Antigen, Total", "PSA", "Prostate Specific Antigen"] },
  { displayName: "Total Iron Binding Capacity (TIBC)", aliases: ["Total Iron Binding Capacity (TIBC)", "TIBC"] },
  { displayName: "TSH - Thyroid Stimulating Hormone", aliases: ["TSH - Thyroid Stimulating Hormone", "Thyroid Stimulating Hormone", "TSH"] },
  { displayName: "T3 - Triiodothyronine", aliases: ["T3 - Triiodothyronine", "Triiodothyronine", "T3"] },
  { displayName: "T4 - Thyroxine", aliases: ["T4 - Thyroxine", "Thyroxine", "T4"] },
  { displayName: "25(OH) Vitamin D", aliases: ["25(OH) Vitamin D", "Vitamin D", "25 OH Vitamin D"] },
  { displayName: "Vitamin B12", aliases: ["Vitamin B12", "B12"] },
  { displayName: "Direct LDL", aliases: ["Direct LDL", "LDL Cholesterol", "LDL"] },
  { displayName: "HDL Cholesterol", aliases: ["HDL Cholesterol", "HDL"] },
  { displayName: "Total Cholesterol", aliases: ["Total Cholesterol", "Cholesterol"] },
  { displayName: "Triglyceride", aliases: ["Triglyceride", "Triglycerides"] },
  { displayName: "Fasting Blood Sugar", aliases: ["Fasting Blood Sugar", "Fasting Glucose", "Glucose"] },
  { displayName: "HbA1c", aliases: ["HbA1c", "Hemoglobin A1c", "A1C"] },
  { displayName: "Mean Blood Glucose", aliases: ["Mean Blood Glucose", "Estimated Average Glucose", "eAG"] },
  { displayName: "Creatinine, Serum", aliases: ["Creatinine, Serum", "Creatinine Serum", "Creatinine"] },
  { displayName: "Microalbumin", aliases: ["Microalbumin (per urine volume)", "Microalbumin"] },
  { displayName: "Homocysteine, Serum", aliases: ["Homocysteine, Serum", "Homocysteine"] },
  { displayName: "Hemoglobin", aliases: ["Hemoglobin", "Hgb"] },
  { displayName: "RBC Count", aliases: ["RBC Count"] },
  { displayName: "Hematocrit", aliases: ["Hematocrit"] },
  { displayName: "MCV", aliases: ["MCV"] },
  { displayName: "MCHC", aliases: ["MCHC"] },
  { displayName: "MCH", aliases: ["MCH"] },
  { displayName: "RDW CV", aliases: ["RDW CV", "RDW"] },
  { displayName: "WBC Count", aliases: ["WBC Count", "Total WBC"] },
  { displayName: "Neutrophils", aliases: ["Neutrophils"] },
  { displayName: "Lymphocytes", aliases: ["Lymphocytes"] },
  { displayName: "Eosinophils", aliases: ["Eosinophils"] },
  { displayName: "Monocytes", aliases: ["Monocytes"] },
  { displayName: "Basophils", aliases: ["Basophils"] },
  { displayName: "Platelet Count", aliases: ["Platelet Count"] },
  { displayName: "MPV", aliases: ["MPV"] },
  { displayName: "ESR", aliases: ["ESR", "Erythrocyte Sedimentation Rate"] },
  { displayName: "VLDL", aliases: ["VLDL"] },
  { displayName: "CHOL/HDL Ratio", aliases: ["CHOL/HDL Ratio", "Chol HDL Ratio"] },
  { displayName: "LDL/HDL Ratio", aliases: ["LDL/HDL Ratio"] },
  { displayName: "Total Protein", aliases: ["Total Protein"] },
  { displayName: "Albumin", aliases: ["Albumin"] },
  { displayName: "Globulin", aliases: ["Globulin"] },
  { displayName: "A/G Ratio", aliases: ["A/G Ratio", "Albumin Globulin Ratio"] },
  { displayName: "Total Bilirubin", aliases: ["Total Bilirubin"] },
  { displayName: "Conjugated Bilirubin", aliases: ["Conjugated Bilirubin", "Direct Bilirubin"] },
  { displayName: "Unconjugated Bilirubin", aliases: ["Unconjugated Bilirubin", "Indirect Bilirubin"] },
  { displayName: "Delta Bilirubin", aliases: ["Delta Bilirubin"] },
  { displayName: "Iron", aliases: ["Iron"] },
  { displayName: "Transferrin Saturation", aliases: ["Transferrin Saturation"] },
  { displayName: "Urea", aliases: ["Urea"] },
  { displayName: "Blood Urea Nitrogen", aliases: ["Blood Urea Nitrogen", "BUN"] },
  { displayName: "Uric Acid", aliases: ["Uric Acid"] },
  { displayName: "Calcium", aliases: ["Calcium"] },
  { displayName: "SGPT", aliases: ["SGPT", "ALT"] },
  { displayName: "SGOT", aliases: ["SGOT", "AST"] },
  { displayName: "Sodium (Na+)", aliases: ["Sodium (Na+)", "Sodium"] },
  { displayName: "Potassium (K+)", aliases: ["Potassium (K+)", "Potassium"] },
  { displayName: "Chloride (Cl-)", aliases: ["Chloride (Cl-)", "Chloride"] },
  { displayName: "IgE", aliases: ["IgE"] },
  { displayName: "HBsAg", aliases: ["HBsAg"] },
  { displayName: "Hb A", aliases: ["Hb A"] },
  { displayName: "Hb A2", aliases: ["Hb A2"] },
  { displayName: "P2 Peak", aliases: ["P2 Peak"] },
  { displayName: "P3 Peak", aliases: ["P3 Peak"] },
  { displayName: "Foetal Hb", aliases: ["Foetal Hb", "Fetal Hb"] },
  { displayName: "ABO Type", aliases: ["ABO Type"] },
  { displayName: "Rh (D) Type", aliases: ["Rh (D) Type", "Rh Type"] },
  { displayName: "Colour", aliases: ["Colour", "Color"] },
  { displayName: "Clearity", aliases: ["Clearity", "Clarity"] },
  { displayName: "pH", aliases: ["pH"] },
  { displayName: "Specific Gravity", aliases: ["Specific Gravity"] },
  { displayName: "Urine Glucose", aliases: ["Urine Glucose"] },
  { displayName: "Urine Protein", aliases: ["Urine Protein"] },
  { displayName: "Bilirubin", aliases: ["Bilirubin"] },
  { displayName: "Urobilinogen", aliases: ["Urobilinogen"] },
  { displayName: "Urine Ketone", aliases: ["Urine Ketone", "Ketone"] },
  { displayName: "Nitrite", aliases: ["Nitrite"] },
  { displayName: "Pus Cells", aliases: ["Pus Cells"] },
  { displayName: "Red Cells", aliases: ["Red Cells", "RBCs"] },
  { displayName: "Epithelial Cells", aliases: ["Epithelial Cells"] },
  { displayName: "Casts", aliases: ["Casts"] },
  { displayName: "Crystals", aliases: ["Crystals"] },
  { displayName: "Amorphous Material", aliases: ["Amorphous Material"] }
];

const methodWords = [
  "Calculated",
  "Colorimetric",
  "Electrical impedance",
  "Derived",
  "Microscopic",
  "Capillary photometry",
  "Chemiluminescence",
  "CLIA",
  "Immunoturbidimetric",
  "Bromocresol Green Method",
  "Uricase",
  "Urease",
  "Direct- ISE",
  "UV with P5P",
  "GOD-POD",
  "Diazo reaction",
  "Double indicator",
  "Nitrite reaction",
  "Nitroprusside",
  "Protein error of indicators",
  "Polyelectrolyte based reaction",
  "Azobilirubin",
  "Arsenazo",
  "Pyridyl azo Dye",
  "Direct measured",
  "High Performance Liquid Chromatography",
  "Ezymatic",
  "Enzymatic"
];

const unitPattern = [
  "million/cmm",
  "microIU/mL",
  "micromol/L",
  "micro g/dL",
  "mL/min/1.73m2",
  "mm/1hr",
  "mg/dL",
  "g/dL",
  "ng/mL",
  "mg/mL",
  "pg/mL",
  "IU/mL",
  "mmol/L",
  "mEq/L",
  "cells/cmm",
  "/cmm",
  "/hpf",
  "U/L",
  "S/Co",
  "fL",
  "pg",
  "%"
]
  .map(escapeRegExp)
  .join("|");

const sortedDefinitions = testDefinitions
  .map((definition) => ({
    ...definition,
    aliases: [...definition.aliases].sort((a, b) => b.length - a.length)
  }))
  .sort((a, b) => b.aliases[0].length - a.aliases[0].length);

export function extractLabValuesFromText(text: string): ExtractedLabResult[] {
  const lines = normalizeText(text)
    .split(/\r?\n/)
    .map((line) => normalizeLine(line))
    .filter(Boolean);

  const results: ExtractedLabResult[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const matchedTest = findTestAtLineStart(line);

    if (!matchedTest) continue;

    const windowLines = collectResultWindow(lines, index);
    const result = extractResultForTest(matchedTest.displayName, line, windowLines);

    if (!result) continue;
    results.push(result);
  }

  return dedupeResults(results);
}

function extractResultForTest(testName: string, firstLine: string, windowLines: string[]): ExtractedLabResult | null {
  const unit = findUnit(windowLines.join(" "));
  const flag = findFlag(firstLine);
  const referenceRange = parseReferenceRange(testName, firstLine, windowLines);
  const value = parseResultValue(firstLine, windowLines, unit, referenceRange);

  if (!value) return null;

  return {
    testName,
    value: value.value,
    valueText: value.valueText,
    comparator: value.comparator,
    unit: unit ?? "",
    flag,
    referenceRange,
    source: "pdf",
    isAnalyzable: typeof value.value === "number",
    notes: typeof value.value === "number"
      ? "Extracted from PDF text. Please review before analysis."
      : "Extracted qualitative value from PDF text. Review manually; it will not be included in numeric range analysis."
  };
}

function parseResultValue(
  firstLine: string,
  windowLines: string[],
  unit: string | undefined,
  referenceRange: ReferenceRange
): ParsedValue | null {
  const directBeforeUnit = unit ? valueBeforeUnit(firstLine, unit) : null;
  if (directBeforeUnit && !looksLikeReferenceOnly(firstLine, directBeforeUnit.valueText, referenceRange)) {
    return directBeforeUnit;
  }

  const sameLineValue = valueFromSameLine(firstLine, referenceRange);
  if (sameLineValue) return sameLineValue;

  for (const line of windowLines.slice(1)) {
    if (isMethodLine(line)) continue;

    const standalone = standaloneValue(line);
    if (standalone) return standalone;
  }

  return qualitativeValueFromLine(firstLine, windowLines);
}

function valueBeforeUnit(line: string, unit: string): ParsedValue | null {
  const regex = new RegExp(`(?:^|\\s)([<>])?\\s*(-?\\d+(?:\\.\\d+)?)\\s*${escapeRegExp(unit)}(?:\\s|$)`, "i");
  const match = line.match(regex);
  if (!match) return null;

  const comparator = match[1] as "<" | ">" | undefined;
  const numericText = match[2];
  return {
    value: Number(numericText),
    valueText: `${comparator ?? ""}${numericText}`,
    comparator
  };
}

function valueFromSameLine(line: string, referenceRange: ReferenceRange): ParsedValue | null {
  const cleaned = removeMatchedTestPrefix(line);
  const valueTokens = [...cleaned.matchAll(/([<>])?\s*(-?\d+(?:\.\d+)?)/g)]
    .map((match) => ({
      comparator: match[1] as "<" | ">" | undefined,
      value: Number(match[2]),
      valueText: `${match[1] ?? ""}${match[2]}`
    }))
    .filter((token) => Number.isFinite(token.value));

  if (valueTokens.length === 0) return null;

  // Common one-line table shape: Test Method VALUE Unit LOW - HIGH
  if (valueTokens.length >= 3 && referenceRange.low === valueTokens[valueTokens.length - 2].value && referenceRange.high === valueTokens[valueTokens.length - 1].value) {
    return valueTokens[0];
  }

  // Common one-line no-unit shape: TIBC 352.00 261 - 462
  if (valueTokens.length >= 3) {
    return valueTokens[0];
  }

  // Do not treat a single number as the result when the line is clearly only a reference instruction.
  if (/\b(?:up to|normal|desirable|optimal|borderline|high|low|adult|children|reactive|non reactive|deficiency|sufficiency|toxicity)\b/i.test(line)) {
    return null;
  }

  return valueTokens[0];
}

function standaloneValue(line: string): ParsedValue | null {
  const numeric = line.match(/^([HL]\s+)?([<>])?\s*(-?\d+(?:\.\d+)?)(?:\s*%)?$/i);
  if (numeric) {
    const comparator = numeric[2] as "<" | ">" | undefined;
    const numericText = numeric[3];
    return {
      value: Number(numericText),
      valueText: `${comparator ?? ""}${numericText}`,
      comparator
    };
  }

  const qualitative = line.match(/^(?:Interpretation\s+)?(Non Reactive|Reactive|Present\s*\(\+\)|Present|Absent|Nil|Clear|Pale Yellow|Positive|Negative|Normochromic Normocytic)$/i);
  if (qualitative) {
    return {
      valueText: qualitative[1]
    };
  }

  return null;
}

function qualitativeValueFromLine(firstLine: string, windowLines: string[]): ParsedValue | null {
  const withoutTest = removeMatchedTestPrefix(firstLine).trim();

  const qualitativePairs = [
    "Non Reactive",
    "Reactive",
    "Present (+)",
    "Present",
    "Absent",
    "Nil",
    "Clear",
    "Pale Yellow",
    "Positive",
    "Negative",
    '"A"'
  ];

  for (const token of qualitativePairs) {
    if (new RegExp(`(?:^|\\s)${escapeRegExp(token)}(?:\\s|$)`, "i").test(withoutTest)) {
      return { valueText: token.replace(/"/g, "") };
    }
  }

  for (const line of windowLines.slice(1, 4)) {
    const standalone = standaloneValue(line);
    if (standalone && standalone.value === undefined) return standalone;
  }

  return null;
}

function parseReferenceRange(testName: string, firstLine: string, windowLines: string[]): ReferenceRange {
  const firstLineReference = parseSimpleReferenceRange(firstLine);
  const categoryText = collectCategoryReferenceText(windowLines);
  const fullText = windowLines.join(" ");

  if (categoryText) {
    const normalRange = categoryText.match(/(?:^|;\s*)(?:Normal|Adult|Non-Diabetes|Good Control|Sufficiency)\s*:\s*(-?\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(-?\d+(?:\.\d+)?)/i);
    const normalLessThan = categoryText.match(/(?:^|;\s*)(?:Normal|Non-Diabetes|Optimal|Desirable|Non Reactive)\s*:\s*<\s*(-?\d+(?:\.\d+)?)/i);
    const hdlLow = /HDL/i.test(testName) ? categoryText.match(/(?:^|;\s*)Low\s*:\s*<\s*(-?\d+(?:\.\d+)?)/i) : null;

    return {
      low: normalRange ? Number(normalRange[1]) : hdlLow ? Number(hdlLow[1]) : undefined,
      high: normalRange ? Number(normalRange[2]) : normalLessThan ? Number(normalLessThan[1]) : undefined,
      text: categoryText
    };
  }

  if (firstLineReference.low !== undefined || firstLineReference.high !== undefined || firstLineReference.text) {
    return firstLineReference;
  }

  const fullTextReference = parseSimpleReferenceRange(fullText);
  if (fullTextReference.low !== undefined || fullTextReference.high !== undefined || fullTextReference.text) {
    return fullTextReference;
  }

  const qualitative = fullText.match(/(Absent|Nil|Clear|Pale Yellow|Non Reactive\s*:\s*<\s*\d+(?:\.\d+)?|Reactive\s*:\s*>\s*\d+(?:\.\d+)?)/i);
  if (qualitative) {
    return { text: qualitative[0] };
  }

  return {};
}

function parseSimpleReferenceRange(text: string): ReferenceRange {
  const rangeMatch = text.match(/(-?\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(-?\d+(?:\.\d+)?)/i);
  const upToMatch = text.match(/(?:up to|less than|below)\s*<?\s*(-?\d+(?:\.\d+)?)/i);
  const lessThanMatch = text.match(/(?:^|\s)<\s*(-?\d+(?:\.\d+)?)/i);
  const greaterThanMatch = text.match(/(?:^|\s)>\s*(-?\d+(?:\.\d+)?)/i);

  if (rangeMatch) {
    return {
      low: Number(rangeMatch[1]),
      high: Number(rangeMatch[2]),
      text: `${rangeMatch[1]} - ${rangeMatch[2]}`
    };
  }

  if (upToMatch) {
    return {
      high: Number(upToMatch[1]),
      text: `Up to ${upToMatch[1]}`
    };
  }

  if (lessThanMatch) {
    return {
      high: Number(lessThanMatch[1]),
      text: `< ${lessThanMatch[1]}`
    };
  }

  if (greaterThanMatch) {
    return {
      low: Number(greaterThanMatch[1]),
      text: `> ${greaterThanMatch[1]}`
    };
  }

  return {};
}

function collectCategoryReferenceText(windowLines: string[]) {
  const categoryLines = windowLines.filter((line) =>
    /\b(?:Normal|Desirable|Borderline|High|Very High|Low|Optimal|Near to above Optimal|Diabetes|Pre-Diabetes|Non-Diabetes|Poor Control|Good Control|Deficiency|Insufficiency|Sufficiency|Toxicity|Adult|Children|Reactive|Non Reactive)\b\s*:/i.test(line)
  );

  return categoryLines.length > 0 ? categoryLines.join("; ") : undefined;
}

function collectResultWindow(lines: string[], startIndex: number) {
  const window: string[] = [lines[startIndex]];

  for (let index = startIndex + 1; index < lines.length && window.length < 12; index += 1) {
    const line = lines[index];

    if (findTestAtLineStart(line)) break;
    if (isHardStopLine(line)) break;

    window.push(line);
  }

  return window;
}

function findTestAtLineStart(line: string): TestDefinition | null {
  for (const definition of sortedDefinitions) {
    for (const alias of definition.aliases) {
      const pattern = new RegExp(`^${escapeRegExp(alias)}(?:\\b|\\s|:|\\(|-|/|$)`, "i");
      if (pattern.test(line)) return definition;
    }
  }

  return null;
}

function removeMatchedTestPrefix(line: string) {
  const matched = findTestAtLineStart(line);
  if (!matched) return line;

  const alias = matched.aliases.find((value) => new RegExp(`^${escapeRegExp(value)}`, "i").test(line));
  if (!alias) return line;

  return line.replace(new RegExp(`^${escapeRegExp(alias)}`, "i"), "").trim();
}

function findUnit(text: string) {
  const match = text.match(new RegExp(`\\b(${unitPattern})\\b`, "i"));
  return match?.[1] ?? undefined;
}

function findFlag(line: string) {
  const withoutTest = removeMatchedTestPrefix(line);
  const match = withoutTest.match(/(?:^|\s)(H|L)(?:\s|$)/i);
  return match?.[1]?.toUpperCase() as "H" | "L" | undefined;
}

function looksLikeReferenceOnly(line: string, valueText: string, referenceRange: ReferenceRange) {
  const numeric = Number(valueText.replace(/[<>]/g, ""));

  if (referenceRange.low === numeric || referenceRange.high === numeric) return true;

  return /\b(?:normal|desirable|optimal|borderline|high|low|adult|children|up to|reactive|non reactive|deficiency|sufficiency|toxicity)\b/i.test(line);
}

function isMethodLine(line: string) {
  return methodWords.some((word) => new RegExp(`^${escapeRegExp(word)}\\b`, "i").test(line));
}

function isHardStopLine(line: string) {
  return /^(Explanation|Interpretation|Limitations|Reference|Summary and Uses|Test Result Unit|Patient Information|Sample Information|Client\/Location Information|Page \d+|This is an Electronically|Dr\.|DR\.|-{3,})/i.test(line);
}

function dedupeResults(results: ExtractedLabResult[]) {
  const seen = new Set<string>();

  return results.filter((result) => {
    const key = [
      result.testName.toLowerCase(),
      result.valueText ?? result.value ?? "",
      result.unit ?? "",
      result.referenceRange?.text ?? ""
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeText(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/µ/g, "micro")
    .replace(/\bS\/Co\b/g, "S/Co");
}

function normalizeLine(line: string) {
  return line
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*:\s*/g, ": ")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 - $2")
    .replace(/<\s+/g, "<")
    .replace(/>\s+/g, ">");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
