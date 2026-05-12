import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MedicalDisclaimer() {
  return (
    <Alert>
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <AlertTitle>Educational use only</AlertTitle>
          <AlertDescription>
            This app does not provide medical advice, diagnosis, or treatment. Always review lab results with a licensed healthcare professional who understands your full clinical context.
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
