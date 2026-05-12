import type { CombinationFlag } from "@lab-results/shared";
import { AlertTriangle } from "lucide-react";
import { Alert } from "@/components/ui/alert";

export function RiskFlagBanner({ flags }: { flags: CombinationFlag[] }) {
  if (flags.length === 0) return null;

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <Alert key={flag.code} className="border-amber-200 bg-amber-50 text-amber-950">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h3 className="font-semibold">{flag.title}</h3>
              <p className="mt-1 leading-6">{flag.explanation}</p>
              {flag.recommendedFollowUp && <p className="mt-2 text-sm font-medium">{flag.recommendedFollowUp}</p>}
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
