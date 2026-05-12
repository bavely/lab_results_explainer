import type { ReferenceRange } from "@lab-results/shared";

export function RangeIndicator({ value, range }: { value: number; range?: ReferenceRange }) {
  if (range?.low === undefined || range?.high === undefined || range.high <= range.low) {
    return <p className="text-sm text-slate-500">No complete reference range available.</p>;
  }

  const low = range.low;
  const high = range.high;
  const span = high - low;
  const min = low - span * 0.6;
  const max = high + span * 0.6;
  const position = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="space-y-2">
      <div className="relative h-3 rounded-full bg-gradient-to-r from-amber-200 via-emerald-300 to-rose-200">
        <div className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-slate-950" style={{ left: `${position}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Low</span>
        <span>Reference: {low} - {high}</span>
        <span>High</span>
      </div>
    </div>
  );
}
