import type { ExtractedLabResult, LabInput } from "@lab-results/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DisplayResult = LabInput | ExtractedLabResult;

function formatReferenceRange(result: DisplayResult) {
  if (result.referenceRange?.text) return result.referenceRange.text;

  const low = result.referenceRange?.low;
  const high = result.referenceRange?.high;

  if (low !== undefined && high !== undefined) return `${low} - ${high}`;
  if (low !== undefined) return `> ${low}`;
  if (high !== undefined) return `< ${high}`;

  return "—";
}

function formatValue(result: DisplayResult) {
  if ("valueText" in result && result.valueText) return result.valueText;
  if (result.value !== undefined) return String(result.value);
  return "—";
}

export function LabResultTable({ results }: { results: DisplayResult[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Flag</TableHead>
            <TableHead>Reference range</TableHead>
            <TableHead>Analysis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={`${result.testName}-${index}`}>
              <TableCell className="font-medium">{result.testName}</TableCell>
              <TableCell>{formatValue(result)}</TableCell>
              <TableCell>{result.unit || "—"}</TableCell>
              <TableCell>{"flag" in result && result.flag ? result.flag : "—"}</TableCell>
              <TableCell className="max-w-md whitespace-normal text-xs text-slate-600">{formatReferenceRange(result)}</TableCell>
              <TableCell>
                {"isAnalyzable" in result && result.isAnalyzable === false ? (
                  <span className="text-xs text-amber-700">Review only</span>
                ) : (
                  <span className="text-xs text-emerald-700">Ready</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
