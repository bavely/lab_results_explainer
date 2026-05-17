import { AlertTriangle } from "lucide-react";
import type { CombinationFlag } from "@/types/labs";

interface RiskFlagBannerProps {
  flags: CombinationFlag[];
}

export function RiskFlagBanner({ flags }: RiskFlagBannerProps) {
  if (!flags.length) return null;

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <div key={flag.code} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div>
              <h3 className="font-semibold">{flag.title}</h3>
              <p className="mt-1 text-sm leading-6">{flag.explanation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
