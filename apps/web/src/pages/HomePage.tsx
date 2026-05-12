import type { ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, FileText, Keyboard, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicalDisclaimer } from "@/components/labs/MedicalDisclaimer";
import { analyzeLabs } from "@/features/lab-analysis/api";
import { sampleLabPayload } from "@/features/lab-analysis/sampleData";

export function HomePage() {
  const navigate = useNavigate();
  const sampleMutation = useMutation({
    mutationFn: analyzeLabs,
    onSuccess: (data) => navigate("/results", { state: { analysis: data } })
  });

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" /> Healthcare AI portfolio project
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Explain lab results in plain language without making diagnoses.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A full-stack demo that combines deterministic lab-range classification, PDF extraction, combination flags, and safe AI-generated explanations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/manual")}>
              Start manual entry <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/upload")}>
              Upload PDF
            </Button>
            <Button size="lg" variant="secondary" disabled={sampleMutation.isPending} onClick={() => sampleMutation.mutate(sampleLabPayload)}>
              {sampleMutation.isPending ? "Loading sample..." : "Use sample data"}
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle>What this demonstrates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Feature icon={<Keyboard className="h-5 w-5" />} title="React form architecture" text="Dynamic lab rows, validation, and patient-friendly data entry." />
            <Feature icon={<FileText className="h-5 w-5" />} title="PDF parsing workflow" text="Upload, extract, preview, correct, then analyze." />
            <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Medical guardrails" text="Rules classify first; AI explains without diagnosing." />
          </CardContent>
        </Card>
      </section>

      <MedicalDisclaimer />
    </div>
  );
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">{icon}</div>
      <div>
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
