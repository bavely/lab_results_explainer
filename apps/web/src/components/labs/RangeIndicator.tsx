interface RangeIndicatorProps {
  value: number;
  low?: number;
  high?: number;
}

export function RangeIndicator({ value, low, high }: RangeIndicatorProps) {
  if (low === undefined || high === undefined || low >= high) {
    return <p className="text-sm text-slate-500">No numeric range available.</p>;
  }

  const spread = high - low;
  const min = low - spread * 0.5;
  const max = high + spread * 0.5;
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const normalStart = ((low - min) / (max - min)) * 100;
  const normalWidth = ((high - low) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="relative h-3 rounded-full bg-gradient-to-r from-amber-200 via-emerald-200 to-red-200">
        <div className="absolute top-0 h-3 rounded-full bg-emerald-400/80" style={{ left: `${normalStart}%`, width: `${normalWidth}%` }} />
        <div className="absolute -top-1 h-5 w-1.5 rounded-full bg-slate-950 shadow" style={{ left: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Low</span>
        <span>Normal: {low}–{high}</span>
        <span>High</span>
      </div>
    </div>
  );
}
