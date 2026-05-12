import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LabInput } from "@lab-results/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabResultTable } from "@/components/labs/LabResultTable";
import { MedicalDisclaimer } from "@/components/labs/MedicalDisclaimer";
import { PdfUploadDropzone } from "@/components/labs/PdfUploadDropzone";
import { analyzeLabs, uploadLabReportPdf } from "@/features/lab-analysis/api";

export function UploadReportPage() {
  const navigate = useNavigate();
  const [extractedResults, setExtractedResults] = useState<LabInput[]>([]);

  const uploadMutation = useMutation({
    mutationFn: uploadLabReportPdf,
    onSuccess: (data) => setExtractedResults(data.extractedResults)
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeLabs,
    onSuccess: (data) => navigate("/results", { state: { analysis: data } })
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload lab report PDF</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          The API extracts candidate lab values from text-based PDFs. Always review extracted values before analysis.
        </p>
      </div>
      <MedicalDisclaimer />
      <PdfUploadDropzone onFileSelected={(file) => uploadMutation.mutate(file)} disabled={uploadMutation.isPending} />

      {uploadMutation.isPending && <p className="text-sm text-slate-600">Extracting possible lab values...</p>}
      {uploadMutation.isError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{uploadMutation.error.message}</div>}

      {extractedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review extracted values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <LabResultTable results={extractedResults} />
            <div className="flex justify-end">
              <Button
                disabled={analyzeMutation.isPending}
                onClick={() => analyzeMutation.mutate({ patientContext: { sex: "unknown" }, results: extractedResults })}
              >
                {analyzeMutation.isPending ? "Analyzing..." : "Analyze extracted values"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
