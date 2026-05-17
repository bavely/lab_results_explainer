import { ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabResultCard } from "@/components/labs/LabResultCard";
import { RiskFlagBanner } from "@/components/labs/RiskFlagBanner";
import type { AnalyzeResponse } from "@/types/labs";

interface ResultsDashboardProps {
  data: AnalyzeResponse;
}

export function ResultsDashboard({ data }: ResultsDashboardProps) {
  return (
    <section className="space-y-5">
      <Card className="border-blue-100 bg-white">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Analysis summary</CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-600">{data.summary.overallPlainLanguageSummary}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold">{data.summary.totalResults}</p>
              <p className="text-sm text-slate-500">Total results</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-2xl font-bold text-emerald-700">{data.summary.normalCount}</p>
              <p className="text-sm text-emerald-700">Normal</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-2xl font-bold text-amber-700">{data.summary.abnormalCount}</p>
              <p className="text-sm text-amber-700">Outside range</p>
            </div>
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {data.summary.importantNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <RiskFlagBanner flags={data.combinationFlags} />

      <div className="grid gap-5">
        {data.results.map((result) => (
          <LabResultCard key={`${result.normalizedName}-${result.value}`} result={result} />
        ))}
      </div>
    </section>
  );
}
