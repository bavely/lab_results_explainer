import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RangeIndicator } from "@/components/labs/RangeIndicator";
import type { LabExplanation } from "@/types/labs";

const statusVariant: Record<string, "normal" | "low" | "high" | "unknown"> = {
  normal: "normal",
  low: "low",
  high: "high",
  borderline: "low",
  unknown: "unknown",
};

interface LabResultCardProps {
  result: LabExplanation;
}

export function LabResultCard({ result }: LabResultCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{result.testName}</CardTitle>
            <CardDescription>
              Value: <span className="font-medium text-slate-800">{result.value} {result.unit}</span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={statusVariant[result.status] ?? "unknown"}>{result.status}</Badge>
            <Badge variant="outline">{result.severity}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-6 text-slate-700">{result.plainLanguageExplanation}</p>

        <RangeIndicator value={result.value} low={result.referenceRange?.low} high={result.referenceRange?.high} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-900">General context</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {result.possibleGeneralCauses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-900">Questions to ask</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {result.followUpQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
