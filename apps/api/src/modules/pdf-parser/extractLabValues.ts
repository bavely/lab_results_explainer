import type { ExtractedLabResult, ReferenceRange } from "@lab-results/shared";
import { cleanPHI } from "../../middleware/PHICleaner.js";
import { OpenAI } from "openai";
import { env } from "../../config/env.js";

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

export async function extractLabValuesFromText(text: string): Promise<ExtractedLabResult[]> {
  const normalizedText = normalizeText(text);
  console.log("Extracting lab values from text via LLM. Normalized text:", normalizedText);

  const llmResults = await extractLabValuesWithLlm(normalizedText);
  if (llmResults.length > 0) {
    return dedupeResults(llmResults);
  }

  return extractLabValuesWithHeuristics(normalizedText);
}

function extractLabValuesWithHeuristics(normalizedText: string): ExtractedLabResult[] {

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

async function extractLabValuesWithLlm(normalizedText: string): Promise<ExtractedLabResult[]> {
  if (!env.OPENAI_API_KEY) return [];

  try {
    const client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      ...(env.OPENAI_BASE_URL ? { baseURL: env.OPENAI_BASE_URL } : {})
    });
    const model = env.OPENAI_MODEL ?? env.AZURE_OPENAI_DEPLOYMENT;
    if (!model) return [];

    const completion = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract lab report rows from noisy OCR text. Return strict JSON object with key results[]. Only include true lab rows with a test name and value. Ignore headers, metadata, dates, times, IDs, and administrative fields."
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Extract lab test rows from normalizedText.",
            normalizedText,
            requiredShape: {
              results: [
                {
                  testName: "string",
                  value: "number optional",
                  valueText: "string",
                  comparator: "< or > optional",
                  unit: "string optional",
                  flag: "H or L optional",
                  referenceRange: { low: "number optional", high: "number optional", text: "string optional" }
                }
              ]
            }
          })
        }
      ]
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { results?: unknown[] };
    if (!Array.isArray(parsed.results)) return [];

    return parsed.results
      .map((item) => normalizeLlmResult(item))
      .filter((item): item is ExtractedLabResult => Boolean(item));
  } catch (error) {
    console.warn("LLM extraction failed, falling back to heuristic parsing", error);
    return [];
  }
}

function normalizeLlmResult(item: unknown): ExtractedLabResult | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const testName = typeof row.testName === "string" ? row.testName.trim() : "";
  const valueText = typeof row.valueText === "string" ? row.valueText.trim() : "";
  if (!testName || !valueText) return null;

  const numericValue = typeof row.value === "number" && Number.isFinite(row.value) ? row.value : undefined;
  const comparator = row.comparator === "<" || row.comparator === ">" ? row.comparator : undefined;
  const unit = typeof row.unit === "string" ? row.unit : "";
  const flag = row.flag === "H" || row.flag === "L" ? row.flag : undefined;
  const rr = row.referenceRange as Record<string, unknown> | undefined;

  return {
    testName,
    value: numericValue,
    valueText,
    comparator,
    unit,
    flag,
    referenceRange: {
      low: typeof rr?.low === "number" ? rr.low : undefined,
      high: typeof rr?.high === "number" ? rr.high : undefined,
      text: typeof rr?.text === "string" ? rr.text : undefined
    },
    source: "pdf",
    isAnalyzable: typeof numericValue === "number",
    notes:
      typeof numericValue === "number"
        ? "Extracted by LLM from normalized PDF/OCR text. Please review before analysis."
        : "Extracted qualitative value by LLM from normalized PDF/OCR text. Review manually; it will not be included in numeric range analysis."
  };
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
