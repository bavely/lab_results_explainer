import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PdfUploadDropzone({ onFileSelected, disabled }: { onFileSelected: (file: File) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  function handleFile(file?: File) {
    if (!file) return;
    setSelectedName(file.name);
    onFileSelected(file);
  }

  return (
    <Card>
      <CardContent className="p-8">
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center hover:bg-slate-100"
          onClick={() => inputRef.current?.click()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files[0]);
          }}
          onDragOver={(event) => event.preventDefault()}
        >
          <UploadCloud className="h-12 w-12 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold">Upload a lab report file</h3>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            The backend extracts possible lab values from PDFs (including scanned PDFs via OCR) and images, then the user reviews them before analysis. Do not upload real PHI in a public demo.
          </p>
          {selectedName && <p className="mt-3 text-sm font-medium text-slate-700">Selected: {selectedName}</p>}
          <Button type="button" className="mt-5" disabled={disabled}>
            Choose file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </div>
      </CardContent>
    </Card>
  );
}
