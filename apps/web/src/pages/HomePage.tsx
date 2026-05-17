import type React from "react";
import { useMutation } from "@tanstack/react-query";
import { Activity, BrainCircuit, FileText } from "lucide-react";
import { MedicalDisclaimer } from "@/components/labs/MedicalDisclaimer";
import { LabEntryForm } from "@/components/labs/LabEntryForm";
import { PdfUploadDropzone } from "@/components/labs/PdfUploadDropzone";
import { ResultsDashboard } from "@/components/labs/ResultsDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { analyzeLabs, uploadLabPdf } from "@/lib/api";

export function HomePage() {
  const analyzeMutation = useMutation({ mutationFn: analyzeLabs });
  const uploadMutation = useMutation({ mutationFn: uploadLabPdf });

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex rounded-full border bg-white px-3 py-1 text-sm font-medium text-blue-700 shadow-sm">
            Flask + React + Tailwind + shadcn-style UI
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Understand lab results in plain language.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Enter common lab values or upload a report PDF. The backend classifies values using deterministic rules first, then returns patient-friendly educational explanations.
            </p>
          </div>
          <MedicalDisclaimer />
        </div>

        <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
          <CardContent className="grid gap-4 p-6">
            <Feature icon={<Activity />} title="Rule-based classification" text="Low, high, normal, and unknown statuses are calculated before AI explanations." />
            <Feature icon={<BrainCircuit />} title="AI-ready explanation layer" text="Mock output works immediately. OpenAI JSON mode scaffold is included for later." />
            <Feature icon={<FileText />} title="Privacy-aware PDF parsing" text="Uploads are parsed in memory and common PHI patterns are redacted from extracted text." />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <LabEntryForm onSubmit={(data) => analyzeMutation.mutate(data)} isSubmitting={analyzeMutation.isPending} />
        <PdfUploadDropzone
          onUpload={(file) => uploadMutation.mutate(file)}
          onAnalyze={(data) => analyzeMutation.mutate(data)}
          uploadResult={uploadMutation.data}
          isUploading={uploadMutation.isPending}
        />
      </section>

      {(analyzeMutation.error || uploadMutation.error) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {analyzeMutation.error?.message || uploadMutation.error?.message}
        </div>
      )}

      {analyzeMutation.data && <ResultsDashboard data={analyzeMutation.data} />}
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
      <div className="mt-1 text-white [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-blue-50">{text}</p>
      </div>
    </div>
  );
}
