import { useState } from "react";

import { useTheme } from "@/context/theme-provider";
import { cn } from "@/lib/utils";

/**
 * Horizontal bar chart for ONE series over ordered categories (a status funnel,
 * a priority scale).
 *
 * One series means one hue, not a colour per bar — a colour per category would
 * be decoration here, since every category is already named in text beside its
 * bar. Ordered categories get an ordinal ramp instead, light to dark along the
 * order.
 *
 * The ramps below came out of the data-viz validator in ordinal mode, run
 * against this app's card surfaces (#ffffff light, #1f2229 dark): monotone
 * lightness, every adjacent gap >= 0.06 L, single hue, and the step nearest the
 * surface clearing 2:1. Dark is a separately chosen set of steps, not an
 * inversion of the light one.
 */
const RAMPS = {
  light: {
    3: ["#86b6ef", "#2a78d6", "#184f95"],
    5: ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#104281"],
  },
  dark: {
    3: ["#256abf", "#3987e5", "#86b6ef"],
    5: ["#256abf", "#3987e5", "#6da7ec", "#9ec5f4", "#cde2fb"],
  },
} as const;

export type BarDatum = { label: string; value: number };

const OrdinalBarChart = ({
  title,
  data,
  emptyLabel = "Nothing to show yet",
}: {
  title: string;
  data: BarDatum[];
  emptyLabel?: string;
}) => {
  const { resolvedTheme } = useTheme();
  const [hovered, setHovered] = useState<number | null>(null);

  const ramp = RAMPS[resolvedTheme][data.length <= 3 ? 3 : 5];
  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <section className="rounded-lg border bg-card p-5">
      {/* one series, so the title names it — no legend box needed */}
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>

      {total === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {data.map((d, index) => {
            const share = total ? Math.round((d.value / total) * 100) : 0;
            // a non-zero value always shows a sliver, so "1" is never invisible
            const width = d.value === 0 ? 0 : Math.max((d.value / max) * 100, 3);

            return (
              <li
                key={d.label}
                className="grid grid-cols-[6.5rem_1fr_2.25rem] items-center gap-3"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                // the count is already visible, so the hover detail carries the
                // share — what the bar length only implies
                title={`${d.label}: ${d.value} of ${total} (${share}%)`}
              >
                {/* named in text, so identity never rests on colour alone */}
                <span className="truncate text-xs text-muted-foreground">
                  {d.label}
                </span>

                <span className="relative block h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-[width,opacity] duration-300",
                      hovered !== null && hovered !== index && "opacity-55"
                    )}
                    style={{ width: `${width}%`, backgroundColor: ramp[index] }}
                  />
                </span>

                <span className="text-right text-sm font-medium tabular-nums">
                  {d.value}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default OrdinalBarChart;
