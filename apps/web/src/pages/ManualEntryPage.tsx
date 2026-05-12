import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MedicalDisclaimer } from "@/components/labs/MedicalDisclaimer";
import { LabEntryForm } from "@/components/labs/LabEntryForm";
import { analyzeLabs } from "@/features/lab-analysis/api";
import type { LabEntryFormValues } from "@/features/lab-analysis/schemas";

export function ManualEntryPage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: analyzeLabs,
    onSuccess: (data) => navigate("/results", { state: { analysis: data } })
  });

  function handleSubmit(values: LabEntryFormValues) {
    mutation.mutate({
      patientContext: values.patientContext,
      results: values.results
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manual lab entry</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Enter lab values exactly as shown on a report, including units and reference ranges when available.
        </p>
      </div>
      <MedicalDisclaimer />
      {mutation.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {mutation.error.message}
        </div>
      )}
      <LabEntryForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
    </div>
  );
}
