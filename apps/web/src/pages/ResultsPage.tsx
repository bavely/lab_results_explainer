import { useLocation, useNavigate } from "react-router-dom";
import type { AnalyzeLabsResponse } from "@lab-results/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabResultCard } from "@/components/labs/LabResultCard";
import { MedicalDisclaimer } from "@/components/labs/MedicalDisclaimer";
import { RiskFlagBanner } from "@/components/labs/RiskFlagBanner";

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = (location.state as { analysis?: AnalyzeLabsResponse } | null)?.analysis;

  if (!analysis) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 text-center">
        <h1 className="text-3xl font-bold">No analysis found</h1>
        <p className="text-slate-600">Start with manual entry or upload a PDF report.</p>
        <Button onClick={() => navigate("/manual")}>Go to manual entry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results summary</h1>
          <p className="mt-2 max-w-3xl text-slate-600">{analysis.summary.overallPlainLanguageSummary}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/manual")}>Analyze another set</Button>
      </div>

      <MedicalDisclaimer />

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard title="Total" value={analysis.summary.totalResults} />
        <SummaryCard title="Normal" value={analysis.summary.normalCount} />
        <SummaryCard title="Abnormal" value={analysis.summary.abnormalCount} />
        <SummaryCard title="Follow-up" value={analysis.summary.followUpRecommended ? "Yes" : "No"} />
      </div>

      <RiskFlagBanner flags={analysis.combinationFlags} />

      <div className="grid gap-5 lg:grid-cols-2">
        {analysis.results.map((result) => (
          <LabResultCard key={`${result.normalizedName}-${result.value}`} result={result} />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-950">{value}</div>
      </CardContent>
    </Card>
  );
}
