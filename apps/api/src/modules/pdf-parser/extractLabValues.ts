import type { ExtractedLabResult, ReferenceRange } from "@lab-results/shared";
import { cleanPHI } from "../../middleware/PHICleaner.js";

type ParsedValue = {
  value?: number;
  valueText: string;
  comparator?: "<" | ">";
};

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

export function extractLabValuesFromText(text: string): ExtractedLabResult[] {
  const normalizedText = normalizeText(text);
  console.log("Extracting lab values from text. Normalized text:", normalizedText);

  const lines = normalizedText
    .split(/\r?\n/)
    .map((line) => normalizeLine(line))
    .filter(Boolean);
  const results: ExtractedLabResult[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!isPotentialResultLine(line)) continue;

    const testName = extractTestName(line);
    if (!testName) continue;

    const windowLines = collectResultWindow(lines, index);
    const result = extractResultForTest(testName, line, windowLines);

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
    notes:
      typeof value.value === "number"
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
  const cleaned = removeTestPrefix(line);
  const valueTokens = [...cleaned.matchAll(/([<>])?\s*(-?\d+(?:\.\d+)?)/g)]
    .map((match) => ({
      comparator: match[1] as "<" | ">" | undefined,
      value: Number(match[2]),
      valueText: `${match[1] ?? ""}${match[2]}`
    }))
    .filter((token) => Number.isFinite(token.value));

  if (valueTokens.length === 0) return null;

  if (
    valueTokens.length >= 3 &&
    referenceRange.low === valueTokens[valueTokens.length - 2].value &&
    referenceRange.high === valueTokens[valueTokens.length - 1].value
  ) {
    return valueTokens[0];
  }

  if (valueTokens.length >= 3) {
    return valueTokens[0];
  }

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
  const withoutTest = removeTestPrefix(firstLine).trim();

  const qualitativePairs = ["Non Reactive", "Reactive", "Present (+)", "Present", "Absent", "Nil", "Clear", "Pale Yellow", "Positive", "Negative", '"A"'];

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

  if (firstLineReference.low !== undefined || firstLineReference.high !== undefined || firstLineReference.text) return firstLineReference;

  const fullTextReference = parseSimpleReferenceRange(fullText);
  if (fullTextReference.low !== undefined || fullTextReference.high !== undefined || fullTextReference.text) return fullTextReference;

  const qualitative = fullText.match(/\b(Absent|Nil|Clear|Pale Yellow|Non Reactive\s*:\s*<\s*\d+(?:\.\d+)?|Reactive\s*:\s*>\s*\d+(?:\.\d+)?)\b/i);
  if (qualitative) return { text: qualitative[0] };

  return {};
}

function parseSimpleReferenceRange(text: string): ReferenceRange {
  const rangeMatch = text.match(/(-?\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(-?\d+(?:\.\d+)?)/i);
  const upToMatch = text.match(/\b(?:up to|less than|below)\s*<?\s*(-?\d+(?:\.\d+)?)/i);
  const lessThanMatch = text.match(/(?:^|\s)<\s*(-?\d+(?:\.\d+)?)/i);
  const greaterThanMatch = text.match(/(?:^|\s)>\s*(-?\d+(?:\.\d+)?)/i);

  if (rangeMatch) return { low: Number(rangeMatch[1]), high: Number(rangeMatch[2]), text: `${rangeMatch[1]} - ${rangeMatch[2]}` };
  if (upToMatch) return { high: Number(upToMatch[1]), text: `Up to ${upToMatch[1]}` };
  if (lessThanMatch) return { high: Number(lessThanMatch[1]), text: `< ${lessThanMatch[1]}` };
  if (greaterThanMatch) return { low: Number(greaterThanMatch[1]), text: `> ${greaterThanMatch[1]}` };

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
    if (isPotentialResultLine(line)) break;
    if (isHardStopLine(line)) break;
    window.push(line);
  }

  return window;
}

function isPotentialResultLine(line: string) {
  if (isHardStopLine(line) || isMethodLine(line)) return false;
  const hasValue = /([<>])?\s*-?\d+(?:\.\d+)?|\b(?:Non Reactive|Reactive|Present|Absent|Nil|Positive|Negative)\b/i.test(line);
  return hasValue && /^[A-Za-z]/.test(line);
}

function extractTestName(line: string) {
  const noFlag = line.replace(/\s+(?:H|L)\s+/i, " ");
  const match = noFlag.match(/^(.+?)(?=\s(?:[<>])?\s*-?\d+(?:\.\d+)?\b|\s(?:Non Reactive|Reactive|Present|Absent|Nil|Positive|Negative)\b|$)/i);
  const candidate = (match?.[1] ?? "").replace(/[\-:]+$/g, "").trim();
  if (!candidate || candidate.length < 2) return undefined;
  return candidate;
}

function removeTestPrefix(line: string) {
  const testName = extractTestName(line);
  if (!testName) return line;
  return line.replace(new RegExp(`^${escapeRegExp(testName)}`, "i"), "").trim();
}

function findUnit(text: string) {
  const match = text.match(/\b(?:[a-zA-Z%]+(?:\/[a-zA-Z0-9.+-]+)+|[munpf]?g\/dL|mEq\/L|mmol\/L|IU\/mL|U\/L|S\/Co|%|fL|pg)\b/i);
  return match?.[0] ?? undefined;
}

function findFlag(line: string) {
  const withoutTest = removeTestPrefix(line);
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
    const key = [result.testName.toLowerCase(), result.valueText ?? result.value ?? "", result.unit ?? "", result.referenceRange?.text ?? ""].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeText(text: string) {
  return cleanPHI(text).replace(/\u00a0/g, " ").replace(/[–—]/g, "-").replace(/µ/g, "micro").replace(/\bS\/Co\b/g, "S/Co");
}

function normalizeLine(line: string) {
  return line.trim().replace(/\s+/g, " ").replace(/\s*:\s*/g, ": ").replace(/(\d)\s*-\s*(\d)/g, "$1 - $2").replace(/<\s+/g, "<").replace(/>\s+/g, ">").replace(/\b(\d)\s+(\d)\b/g, "$1.$2");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
