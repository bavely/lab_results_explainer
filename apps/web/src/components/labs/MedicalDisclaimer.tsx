import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MedicalDisclaimer() {
  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-950">
      <ShieldAlert className="absolute left-4 top-4 h-5 w-5" />
      <div className="ml-7">
        <AlertTitle>Educational use only</AlertTitle>
        <AlertDescription>
          This tool does not provide medical advice, diagnosis, or treatment. Always review lab results with a licensed healthcare professional who understands your full history, symptoms, medications, and clinical context.
        </AlertDescription>
      </div>
    </Alert>
  );
}
