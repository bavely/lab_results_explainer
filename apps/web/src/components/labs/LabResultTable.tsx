import type { LabInput } from "@lab-results/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function LabResultTable({ results }: { results: LabInput[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Reference range</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={`${result.testName}-${index}`}>
              <TableCell className="font-medium">{result.testName}</TableCell>
              <TableCell>{result.value}</TableCell>
              <TableCell>{result.unit || "—"}</TableCell>
              <TableCell>
                {result.referenceRange?.low ?? "?"} - {result.referenceRange?.high ?? "?"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
