import { FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UploadResponse } from "@/types/labs";

interface PdfUploadDropzoneProps {
  onUpload: (file: File) => void;
  onAnalyze: (data: { results: UploadResponse["extractedResults"] }) => void;
  uploadResult?: UploadResponse;
  isUploading?: boolean;
}

export function PdfUploadDropzone({ onUpload, onAnalyze, uploadResult, isUploading }: PdfUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");

  function handleFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    onUpload(file);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload lab report</CardTitle>
        <CardDescription>Upload a lab report PDF, PNG, or JPG. Extracted values should be reviewed before analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files?.[0]);
          }}
          onDragOver={(event) => event.preventDefault()}
          className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-blue-300 bg-blue-50/50 p-10 text-center transition hover:bg-blue-50"
        >
          <FileUp className="mb-3 h-8 w-8 text-blue-700" />
          <span className="font-semibold text-slate-900">Drop a PDF/PNG/JPG here or click to browse</span>
          <span className="mt-1 text-sm text-slate-500">Maximum size is controlled by the Flask API.</span>
        </button>
        <input ref={inputRef} type="file" accept="application/pdf,image/png,image/jpeg" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
        {fileName && <p className="text-sm text-slate-600">Selected: {fileName}</p>}
        {isUploading && <p className="text-sm text-blue-700">Uploading and parsing...</p>}

        {uploadResult && (
          <div className="rounded-2xl border bg-slate-50 p-4">
            <h3 className="font-semibold">Extraction preview</h3>
            <p className="mt-1 text-sm text-slate-600">{uploadResult.message}</p>
            <div className="mt-3 overflow-auto rounded-xl bg-white p-3 text-sm">
              {uploadResult.extractedResults.length ? (
                <table className="w-full min-w-[600px] text-left">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2">Test</th>
                      <th>Value</th>
                      <th>Unit</th>
                      <th>Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.extractedResults.map((item, index) => (
                      <tr key={`${item.testName}-${index}`} className="border-t">
                        <td className="py-2 font-medium">{item.testName}</td>
                        <td>{item.value}</td>
                        <td>{item.unit}</td>
                        <td>{item.referenceRange?.low} - {item.referenceRange?.high}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>{uploadResult.message || "No structured values were extracted from this file."}</p>
              )}
            </div>
            <Button
              className="mt-4"
              variant="outline"
              disabled={!uploadResult.extractedResults.length}
              onClick={() => onAnalyze({ results: uploadResult.extractedResults })}
            >
              Review/edit extracted values — next step
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
