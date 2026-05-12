import type { LabExplanation } from "@lab-results/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { labStatusLabels, labStatusStyles } from "@/lib/statusStyles";
import { RangeIndicator } from "./RangeIndicator";

export function LabResultCard({ result }: { result: LabExplanation }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{result.testName}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              {result.value} {result.unit} · {result.referenceRange?.low ?? "?"} - {result.referenceRange?.high ?? "?"}
            </p>
          </div>
          <Badge className={labStatusStyles[result.status]}>{labStatusLabels[result.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <RangeIndicator value={result.value} range={result.referenceRange} />
        <p className="leading-7 text-slate-700">{result.plainLanguageExplanation}</p>

        {result.followUpQuestions.length > 0 && (
          <div className="rounded-2xl bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-900">Questions to ask your clinician</h4>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              {result.followUpQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
